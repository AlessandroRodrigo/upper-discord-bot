import { SlashCommandBuilder } from "discord.js";

export const askCommand = new SlashCommandBuilder()
  .setName("ask")
  .setDescription("Ask a question")
  .addStringOption((option) =>
    option
      .setName("question")
      .setDescription("The question to ask")
      .setRequired(true)
  );
