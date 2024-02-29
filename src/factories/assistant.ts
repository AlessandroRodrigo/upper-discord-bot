import {
  getOrCreateAssistant,
  getOrCreateThread,
  createThreadMessage,
  runThreadMessage,
  waitForThreadRun,
  listThreadMessages,
  getMessageText,
  removeMessageAnnotations,
} from "@/assistant";
import { logger } from "@/lib/logger";

type CreateAssistantMessage = {
  authorId: string;
  authorMessage: string;
};

async function createAssistantMessage({
  authorId,
  authorMessage,
}: CreateAssistantMessage) {
  const assistantId = await getOrCreateAssistant();
  const threadId = await getOrCreateThread(authorId);
  await createThreadMessage(threadId, authorMessage);
  const threadRun = await runThreadMessage(threadId, assistantId);
  await waitForThreadRun(threadId, threadRun.id);
  const threadMessages = await listThreadMessages(threadId);
  const assistantMessage = await getMessageText(threadMessages);

  if (!assistantMessage) {
    logger.error(`Failed to get message content for thread ${threadId}`);
    return "I'm sorry, I didn't understand that.";
  }

  return removeMessageAnnotations(assistantMessage);
}

export const AssistantFactory = {
  createAssistantMessage,
};
