import { commandProcessor } from "@/events/interaction-create/command-handlers/command-processor";
import { CacheType, Interaction } from "discord.js";

export async function interactionCreateHandler(
  interaction: Interaction<CacheType>,
) {
  if (interaction.isCommand()) {
    await commandProcessor(interaction);
    return;
  }
}
