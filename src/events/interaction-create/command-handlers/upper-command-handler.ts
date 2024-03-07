import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";
import { CommandInteraction, CacheType } from "discord.js";

async function handler(interaction: CommandInteraction<CacheType>) {
  logger.info(
    `Handling upper command for user ${interaction.user.id} - ${interaction.user.username}`,
  );

  await interaction.deferReply();

  await redis.del(`discord:${interaction.user.id}:needsHuman`);

  await interaction.editReply(`
      Olá! Eu estou de volta para te ajudar. Se precisar de ajuda, basta me chamar.
    `);

  logger.info(
    `Handled upper command for user ${interaction.user.id} - ${interaction.user.username}`,
  );
}

async function accept(interaction: CommandInteraction<CacheType>) {
  return interaction.commandName === "upper";
}

export const upperCommandHandler = {
  handler,
  accept,
};
