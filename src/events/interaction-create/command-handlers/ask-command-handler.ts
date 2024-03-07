import { AssistantFactory } from "@/factories/assistant";
import { logger } from "@/lib/logger";
import { CacheType, CommandInteraction } from "discord.js";
import { z } from "zod";

const QuestionOptionParser = z.coerce.string();

async function handler(interaction: CommandInteraction<CacheType>) {
  logger.info(
    `Handling ask command for user ${interaction.user.id} - ${interaction.user.username}`,
  );

  await interaction.deferReply();
  const question = interaction.options.get("question")?.value;
  const parsedQuestion = QuestionOptionParser.safeParse(question);

  if (!parsedQuestion.success) {
    await interaction.editReply(
      "A questão informada é inválido. Por favor, tente novamente.",
    );
    return;
  }

  const assistantMessage = await AssistantFactory.createAssistantMessage({
    authorId: interaction.user.id,
    authorMessage: parsedQuestion.data,
  });
  await interaction.editReply(assistantMessage);

  logger.info(
    `Handled ask command for user ${interaction.user.id} - ${interaction.user.username}`,
  );
}

async function accept(interaction: CommandInteraction<CacheType>) {
  return interaction.commandName === "ask";
}

export const askCommandHandler = {
  handler,
  accept,
};
