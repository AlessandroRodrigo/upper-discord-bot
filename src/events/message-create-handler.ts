import { AssistantFactory } from "@/factories/assistant";
import { checkIfSubscriptionIsActive } from "@/lib/hotmart";
import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";
import { Message } from "discord.js";

export async function messageCreateHandler(message: Message<boolean>) {
  if (message.channel.isDMBased() && !message.author.bot) {
    logger.info(
      `Received message from ${message.author.id}: ${message.content}`,
    );
    const isAdmin = message.member?.permissions.has("Administrator");

    if (isAdmin) {
      const assistantMessage = await AssistantFactory.createAssistantMessage({
        authorId: message.author.id,
        authorMessage: message.content,
      });

      logger.info(
        `Sending message to ADMIN ${message.author.id}: ${assistantMessage}`,
      );
      await message.reply(assistantMessage);
      return;
    }

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

    if (!isSubscriptionAtive) {
      message.reply("You don't have an active subscription.");
      return;
    }

    const assistantMessage = await AssistantFactory.createAssistantMessage({
      authorId: message.author.id,
      authorMessage: message.content,
    });

    logger.info(`Sending message to ${message.author.id}: ${assistantMessage}`);
    await message.reply(assistantMessage);
  }
}
