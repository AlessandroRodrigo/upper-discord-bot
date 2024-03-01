import { SlashCommandBuilder } from "discord.js";

export const emailCommand = new SlashCommandBuilder()
  .setName("email")
  .setDescription("Set your email")
  .addStringOption((option) =>
    option.setName("email").setDescription("Your email").setRequired(true),
  );
