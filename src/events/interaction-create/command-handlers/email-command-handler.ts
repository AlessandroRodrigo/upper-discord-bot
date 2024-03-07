import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";
import { CommandInteraction, CacheType } from "discord.js";
import { z } from "zod";

const EmailCommandParser = z.coerce.string().email();

async function handler(interaction: CommandInteraction<CacheType>) {
  logger.info(
    `Handling email command for user ${interaction.user.id} - ${interaction.user.username}`,
  );

  await interaction.deferReply();
  const email = interaction.options.get("email")?.value;
  const parsedEmail = EmailCommandParser.safeParse(email);

  if (!parsedEmail.success) {
    await interaction.editReply(
      "O e-mail informado é inválido. Por favor, tente novamente.",
    );
    return;
  }

  await redis.set(`discord:${interaction.user.id}:email`, parsedEmail.data);
  await interaction.editReply(`
      Muito bom! Seu e-mail foi salvo com sucesso. Agora podemos continuar com as suas dúvidas.
    `);

  logger.info(
    `Handled email command for user ${interaction.user.id} - ${interaction.user.username}`,
  );
}

async function accept(interaction: CommandInteraction<CacheType>) {
  return interaction.commandName === "email";
}

export const emailCommandHandler = {
  handler,
  accept,
};
