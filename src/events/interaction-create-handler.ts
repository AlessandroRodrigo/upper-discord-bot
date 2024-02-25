import { CacheType, Interaction, userMention } from "discord.js";

export async function interactionCreateHandler(
  interaction: Interaction<CacheType>
) {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "ask") {
    const question = interaction.options.data.find(
      (option) => option.name === "question"
    )?.value;

    if (!question) {
      await interaction.reply("You didn't provide a question!");
      return;
    }

    await interaction.user.send("You asked: " + question);
    await interaction.reply(`
      Hey, ${userMention(interaction.user.id)}! I've sent you a direct message with your question.
    `);
  }
}
