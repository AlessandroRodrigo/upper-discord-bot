import { ChannelType, Message } from "discord.js";
import {
  createThreadMessage,
  getMessageText,
  getOrCreateAssistant,
  getOrCreateThread,
  listThreadMessages,
  removeMessageAnnotations,
  runThreadMessage,
  waitForThreadRun,
} from "../assistant";
import { logger } from "../lib/logger";

export async function messageCreateHandler(message: Message<boolean>) {
  if (message.channel.type === ChannelType.DM && !message.author.bot) {
    logger.info(
      `Received message from ${message.author.id}: ${message.content}`
    );
    message.channel.sendTyping();

    const assistantId = await getOrCreateAssistant();
    const threadId = await getOrCreateThread(message.author.id);
    await createThreadMessage(threadId, message.content);
    const threadRun = await runThreadMessage(threadId, assistantId);
    await waitForThreadRun(threadId, threadRun.id);
    const threadMessages = await listThreadMessages(threadId);
    const messageContent = await getMessageText(threadMessages);

    if (!messageContent) {
      logger.error(`Failed to get message content for thread ${threadId}`);
      await message.reply("I'm sorry, I didn't understand that.");
      return;
    }

    const cleanMessage = removeMessageAnnotations(messageContent);

    logger.info(`Sending message to ${message.author.id}: ${cleanMessage}`);
    await message.reply(cleanMessage);
  }
}
