import { logger } from "@/lib/logger";
import { CacheType, CommandInteraction } from "discord.js";

async function handler(interaction: CommandInteraction<CacheType>) {
  logger.info(
    `Handling cancel command for user ${interaction.user.id} - ${interaction.user.username}`,
  );

  await interaction.reply(
    "Para realizar o cancelamento, acesse esse link: https://www.launchpass.com/portal",
  );

  logger.info(
    `Handled cancel command for user ${interaction.user.id} - ${interaction.user.username}`,
  );
}

async function accept(interaction: CommandInteraction<CacheType>) {
  return interaction.commandName === "cancel";
}

export const cancelCommandHandler = {
  handler,
  accept,
};
