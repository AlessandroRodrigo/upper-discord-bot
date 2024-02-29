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
} from "@/assistant";
import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";
import { checkIfSubscriptionIsActive } from "@/lib/hotmart";

export async function messageCreateHandler(message: Message<boolean>) {
  if (message.channel.type === ChannelType.DM && !message.author.bot) {
    logger.info(
      `Received message from ${message.author.id}: ${message.content}`,
    );

    const email = await redis.get(`discord:${message.author.id}:email`);

    if (!email) {
      logger.error(`Failed to get email for user ${message.author.id}`);
      await message.channel.send("I'm sorry, I couldn't find your email.");
      await message.channel.send(
        "Please, use the command `/email` to let me know your email.",
      );
      return;
    }

    message.channel.sendTyping();
    const isSubscriptionAtive = await checkIfSubscriptionIsActive(email);

    if (isSubscriptionAtive) {
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
    } else {
      message.reply("You don't have an active subscription.");
    }
  }
}
