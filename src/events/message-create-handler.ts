import { BusinessLayer } from "@/business/business-layer";
import { AssistantFactory } from "@/factories/assistant";
import { checkIfSubscriptionIsActive } from "@/lib/hotmart";
import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  Message,
} from "discord.js";

export async function messageCreateHandler(message: Message<boolean>) {
  logger.info(`Received message from ${message.author.id}: ${message.content}`);

  if (BusinessLayer.shouldAnswer(message)) {
    logger.info(
      `Answering message from ${message.author.id}: ${message.content}`,
    );

    if (!BusinessLayer.shouldVerifyEmail(message)) {
      logger.info(`Processing message without email verification.`);
      await processMessageWithAssistant(message);
      return;
    }

    await handleEmailVerification(message, async (email, message) => {
      logger.info(`Processing message with email verification.`);
      handleSubscriptionVerification(
        message,
        email,
        async (isActive, message) => {
          logger.info(`Processing message with subscription verification.`);
          processMessageWithAssistant(message);
        },
      );
    });

    return;
  }

  logger.info(`Ignoring message from ${message.author.id}: ${message.content}`);
}

async function processMessageWithAssistant(message: Message<boolean>) {
  message.channel.sendTyping();

  const assistantMessage = await AssistantFactory.createAssistantMessage({
    authorId: message.author.id,
    authorMessage: message.content,
  });

  const usefulButton = new ButtonBuilder()
    .setCustomId(`useful-${message.author.id}`)
    .setLabel("Essa resposta foi útil")
    .setStyle(ButtonStyle.Primary);

  const notUsefulButton = new ButtonBuilder()
    .setCustomId(`not-useful-${message.author.id}`)
    .setLabel("Essa resposta não foi útil")
    .setStyle(ButtonStyle.Secondary);

  const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    usefulButton,
    notUsefulButton,
  );

  logger.info(`Sending message to ${message.author.id}: ${assistantMessage}`);
  const reply = await message.reply({
    content: assistantMessage,
    components: [actionRow],
  });

  handleFeedbackCollector(reply, message);
}

async function handleFeedbackCollector(
  reply: Message,
  originalMessage: Message,
) {
  const collector = reply.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.user.id === originalMessage.author.id,
    time: 600000 /* 10 minutes */,
  });

  collector.on("collect", async (interaction) => {
    await interaction.deferReply({ ephemeral: true });
    const isUseful = interaction.customId.startsWith("useful");
    const isNotUseful = interaction.customId.startsWith("not-useful");

    if (isUseful) {
      await interaction.editReply("Obrigado por nos ajudar a melhorar!");
    }

    if (isNotUseful) {
      await interaction.editReply("Obrigado por nos ajudar a melhorar!");
    }

    collector.stop();
  });

  collector.on("end", () => {
    reply.edit({
      components: [],
    });
  });
}

async function handleEmailVerification(
  message: Message,
  callback: (email: string, message: Message) => void,
) {
  const foundEmail = await redis.get(`discord:${message.author.id}:email`);

  if (!foundEmail) {
    await message.channel.send("Desculpe, não consegui encontrar seu email.");
    await message.channel.send(
      "Por favor use o comando `/email` para configurar seu email.",
    );
    return;
  }

  callback(foundEmail, message);
}

async function handleSubscriptionVerification(
  message: Message,
  email: string,
  callback: (isActive: boolean, message: Message) => void,
) {
  const isSubscriptionActive = await checkIfSubscriptionIsActive(email);

  if (!isSubscriptionActive) {
    logger.info(`Subscription is not active for ${email}`);
    message.reply("Seu e-mail não está ativo. Por favor, verifique.");
    return;
  }

  callback(isSubscriptionActive, message);
}
