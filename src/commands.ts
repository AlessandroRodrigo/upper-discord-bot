import { SlashCommandBuilder } from "discord.js";

export const emailCommand = new SlashCommandBuilder()
  .setName("email")
  .setDescription("Set your email")
  .addStringOption((option) =>
    option.setName("email").setDescription("Your email").setRequired(true),
  );

export const humanCommand = new SlashCommandBuilder()
  .setName("human")
  .setDescription("Request human help");

export const upperCommand = new SlashCommandBuilder()
  .setName("upper")
  .setDescription("Bring back the upper bot");
