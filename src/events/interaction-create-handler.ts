import { redis } from "@/lib/redis";
import {
  ButtonInteraction,
  CacheType,
  CommandInteraction,
  Interaction,
} from "discord.js";
import { z } from "zod";

export async function interactionCreateHandler(
  interaction: Interaction<CacheType>,
) {
  if (interaction.isButton()) {
    if (isUsefulAnswerFeedback(interaction.customId)) {
      handleUsefulAnswerFeedbackInteraction(interaction);
      return;
    }
  }

  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "email") {
    await emailCommandHandler(interaction as CommandInteraction<CacheType>);
    return;
  }
}

const EmailCommandParser = z.coerce.string().email();

async function emailCommandHandler(interaction: CommandInteraction<CacheType>) {
  const email = interaction.options.get("email")?.value;
  const parsedEmail = EmailCommandParser.safeParse(email);

  if (!parsedEmail.success) {
    await interaction.reply(
      "O e-mail informado é inválido. Por favor, tente novamente.",
    );
    return;
  }

  await redis.set(`discord:${interaction.user.id}:email`, parsedEmail.data);
  await interaction.reply(`
    E-mail configurado com sucesso para **${parsedEmail.data}**.
  `);
}

function isUsefulAnswerFeedback(customId: string) {
  return customId.startsWith("useful") || customId.startsWith("not-useful");
}

async function handleUsefulAnswerFeedbackInteraction(
  interaction: ButtonInteraction<CacheType>,
) {
  await interaction.deferReply({ ephemeral: true });

  const isOwner = interaction.customId.endsWith(interaction.user.id);

  if (!isOwner) {
    await interaction.editReply({
      content: "Você não tem permissão para clicar nesse botão.",
    });
    return;
  }

  await interaction.editReply({
    content: "Obrigado por nos ajudar a melhorar!",
  });
}
