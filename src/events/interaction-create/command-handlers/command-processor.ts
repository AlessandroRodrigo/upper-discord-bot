import { askCommandHandler } from "@/events/interaction-create/command-handlers/ask-command-handler";
import { emailCommandHandler } from "@/events/interaction-create/command-handlers/email-command-handler";
import { humanCommandHandler } from "@/events/interaction-create/command-handlers/human-command-handler";
import { upperCommandHandler } from "@/events/interaction-create/command-handlers/upper-command-handler";
import { logger } from "@/lib/logger";
import { CacheType, CommandInteraction } from "discord.js";

export async function commandProcessor(
  interaction: CommandInteraction<CacheType>,
) {
  const handlers = [
    emailCommandHandler,
    humanCommandHandler,
    upperCommandHandler,
    askCommandHandler,
  ];

  for (const handler of handlers) {
    if (await handler.accept(interaction)) {
      logger.info(
        `Handling ${interaction.commandName} command for user ${interaction.user.id} - ${interaction.user.username}`,
      );
      await handler.handler(interaction);
      return;
    }
  }
}
