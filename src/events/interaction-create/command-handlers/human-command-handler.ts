import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";
import { CommandInteraction, CacheType } from "discord.js";

async function handler(interaction: CommandInteraction<CacheType>) {
  logger.info(
    `Handling human command for user ${interaction.user.id} - ${interaction.user.username}`,
  );

  await interaction.deferReply();
  await redis.set(`discord:${interaction.user.id}:needsHuman`, "true");
  await interaction.editReply(`
      Entendido! Nossos moderadores já foram notificados e em breve irão te ajudar.
    `);
  await interaction.followUp(`
      Se precisar da minha ajuda novamente, basta utilizar o comando \`/upper\` e eu voltarei a te ajudar.
    `);

  logger.info(
    `Handled human command for user ${interaction.user.id} - ${interaction.user.username}`,
  );
}

async function accept(interaction: CommandInteraction<CacheType>) {
  return interaction.commandName === "human";
}

export const humanCommandHandler = {
  handler,
  accept,
};
