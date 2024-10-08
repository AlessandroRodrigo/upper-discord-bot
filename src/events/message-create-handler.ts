import { AssistantUtils } from "@/assistant/utils";
import { BusinessLayer } from "@/business/business-layer";
import { AssistantFactory } from "@/factories/assistant";
// import { checkIfSubscriptionIsActive } from "@/lib/hotmart";
import { logger } from "@/lib/logger";
// import { redis } from "@/lib/redis";
import { Message } from "discord.js";

export async function messageCreateHandler(message: Message<boolean>) {
  logger.info(
    `Received message from ${message.author.id} - ${message.author.username}: ${message.content}`,
  );
  const hasAudio = message.attachments.some((attachment) =>
    attachment.contentType?.includes("audio"),
  );

  if (hasAudio) {
    logger.info(`Processing audio message.`);
    const audioUrl = message.attachments.find((attachment) =>
      attachment.contentType?.includes("audio"),
    )?.url;

    if (!audioUrl) {
      logger.info(`Audio URL not found.`);
      return;
    }

    const transcript = await AssistantUtils.transcriptAudio(audioUrl);
    logger.info(`Transcripted audio: ${transcript}`);
    message.content = transcript;
  }

  if (await BusinessLayer.shouldAnswer(message)) {
    logger.info(
      `Answering message from ${message.author.id} - ${message.author.username}: ${message.content}`,
    );

    if (!BusinessLayer.shouldVerifyEmail(message)) {
      logger.info(`Processing message without email verification.`);
      await processMessageWithAssistant(message);
      return;
    }

    logger.info(`Processing message with subscription verification.`);
    processMessageWithAssistant(message);

    // await handleEmailVerification(message, async (email, message) => {
    //   logger.info(`Processing message with email verification.`);
    //   handleSubscriptionVerification(
    //     message,
    //     email,
    //     async (isActive, message) => {
    //       logger.info(`Processing message with subscription verification.`);
    //       processMessageWithAssistant(message);
    //     },
    //   );
    // });

    return;
  }

  logger.info(
    `Ignoring message from ${message.author.id} - ${message.author.username}: ${message.content}`,
  );
}

async function processMessageWithAssistant(message: Message<boolean>) {
  message.channel.sendTyping();

  const assistantMessage = await AssistantFactory.createAssistantMessage({
    authorId: message.author.id,
    authorMessage: message.content,
  });

  logger.info(
    `Sending message to ${message.author.id} - ${message.author.username}: ${assistantMessage}`,
  );
  await message.reply(assistantMessage);
}

// async function handleEmailVerification(
//   message: Message,
//   callback: (email: string, message: Message) => void,
// ) {
//   const foundEmail = await redis.get(`discord:${message.author.id}:email`);

//   if (!foundEmail) {
//     await message.channel.send(
//       "Ei, estou aqui para te ajudar, mas notei que seu e-mail ainda não está configurado.",
//     );
//     await message.channel.send(
//       "Por favor use o comando `/email 'seu e-mail'` para configurar seu e-mail. Lembre-se de utilizar o mesmo da Hotmart.",
//     );
//     return;
//   }

//   callback(foundEmail, message);
// }

// async function handleSubscriptionVerification(
//   message: Message,
//   email: string,
//   callback: (isActive: boolean, message: Message) => void,
// ) {
//   const isSubscriptionActive = await checkIfSubscriptionIsActive(email);

//   if (!isSubscriptionActive) {
//     logger.info(`Subscription is not active for ${email}`);
//     await message.reply(
//       "Parece que seu e-mail não está ativo na Hotmart, você tem certeza que digitou corretamente?",
//     );
//     await message.reply(
//       "Por favor, use o comando `/email 'seu e-mail'` para configurar seu e-mail novamente.",
//     );
//     return;
//   }

//   callback(isSubscriptionActive, message);
// }
