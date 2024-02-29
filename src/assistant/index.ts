import { basePrompt } from "@/assistant/prompt";
import { logger } from "@/lib/logger";
import { openai } from "@/lib/openai";
import { redis } from "@/lib/redis";
import { createReadStream } from "fs";
import {
  MessageContentText,
  ThreadMessagesPage,
} from "openai/resources/beta/threads/messages/messages";
import { Run } from "openai/resources/beta/threads/runs/runs";
import path from "path";

const DEFAULT_MODEL = "gpt-3.5-turbo-1106";
const DEFAULT_NAME = "Level Up Assistant";

async function getOrCreateKnowledge() {
  const knowledgeId = await redis.get("knowledgeId");

  if (knowledgeId) {
    return knowledgeId;
  }

  const knowledge = await openai.files.create({
    file: createReadStream(path.join(__dirname, "knowledge.json")),
    purpose: "assistants",
  });

  await redis.set("knowledgeId", knowledge.id);

  return knowledge.id;
}

export async function getOrCreateAssistant() {
  const knowledgeId = await getOrCreateKnowledge();

  const assistantId = await redis.get("assistantId");

  if (assistantId) {
    logger.info(`Using existing assistant: ${assistantId}`);
    return assistantId;
  }

  const assistant = await openai.beta.assistants.create({
    model: DEFAULT_MODEL,
    file_ids: [knowledgeId],
    instructions: basePrompt,
    name: DEFAULT_NAME,
    tools: [
      {
        type: "retrieval",
      },
    ],
  });

  await redis.set("assistantId", assistant.id);

  logger.info(`Created new assistant: ${assistant.id}`);
  return assistant.id;
}

export async function getOrCreateThread(userId: string) {
  const threadId = await redis.get(`thread:${userId}`);

  if (threadId) {
    return threadId;
  }

  const thread = await openai.beta.threads.create();

  redis.set(`thread:${userId}`, thread.id);

  return thread.id;
}

export async function createThreadMessage(threadId: string, userInput: string) {
  const response = await openai.beta.threads.messages.create(threadId, {
    content: userInput,
    role: "user",
  });

  return response;
}

export async function runThreadMessage(threadId: string, assistantId: string) {
  const response = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });

  return response;
}

export async function waitForThreadRun(threadId: string, runId: string) {
  const retrieveRun = async (): Promise<Run> => {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);

    if (run.status === "queued" || run.status === "in_progress") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return retrieveRun();
    }

    return run;
  };

  return retrieveRun();
}

export async function listThreadMessages(threadId: string) {
  return openai.beta.threads.messages.list(threadId);
}

export async function getMessageText(messages: ThreadMessagesPage) {
  if (messages.data[0].content[0].type === "text") {
    return messages.data[0].content[0].text;
  }

  return "";
}

export function removeMessageAnnotations(message: MessageContentText.Text) {
  let finalMessage = message.value;
  const annotations = message.annotations;

  for (const annotation of annotations) {
    finalMessage = message.value.replace(annotation.text, "");
  }

  return finalMessage.trim();
}
