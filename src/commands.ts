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

export const emailCommand = new SlashCommandBuilder()
  .setName("email")
  .setDescription("Set your email")
  .addStringOption((option) =>
    option.setName("email").setDescription("Your email").setRequired(true)
  );
