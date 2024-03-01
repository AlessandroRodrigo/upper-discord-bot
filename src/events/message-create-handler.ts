import { AssistantFactory } from "@/factories/assistant";
import { checkIfSubscriptionIsActive } from "@/lib/hotmart";
import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";
import { Message } from "discord.js";

export async function messageCreateHandler(message: Message<boolean>) {
  if (shouldAnswer(message)) {
    logger.info(
      `Received message from ${message.author.id}: ${message.content}`,
    );

    const isAdmin = message.member?.permissions.has("Administrator");
    if (isAdmin) {
      await processMessageWithAssistant(message);
      return;
    }

    const foundEmail = await redis.get(`discord:${message.author.id}:email`);
    if (!foundEmail) {
      logger.error(`Failed to get email for user ${message.author.id}`);
      await message.channel.send("Desculpe, não consegui encontrar seu email.");
      await message.channel.send(
        "Por favor use o comando `/email` para configurar seu email.",
      );
      return;
    }

    const isSubscriptionActive = await checkIfSubscriptionIsActive(foundEmail);
    if (!isSubscriptionActive) {
      message.reply("Seu e-mail não está ativo. Por favor, verifique.");
      return;
    }

    await processMessageWithAssistant(message);
    return;
  }
}

function shouldAnswer(message: Message<boolean>) {
  return (
    (message.channel.isDMBased() || message.channel.isTextBased()) &&
    !message.author.bot
  );
}

async function processMessageWithAssistant(message: Message<boolean>) {
  message.channel.sendTyping();

  const assistantMessage = await AssistantFactory.createAssistantMessage({
    authorId: message.author.id,
    authorMessage: message.content,
  });

  logger.info(`Sending message to ${message.author.id}: ${assistantMessage}`);
  await message.reply(assistantMessage);
}
