import { redis } from "@/lib/redis";
import {
  CacheType,
  CommandInteraction,
  Interaction,
  userMention,
} from "discord.js";
import { z } from "zod";

export async function interactionCreateHandler(
  interaction: Interaction<CacheType>,
) {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "ask") {
    await askCommandHandler(interaction as CommandInteraction<CacheType>);
    return;
  }

  if (commandName === "email") {
    await emailCommandHandler(interaction as CommandInteraction<CacheType>);
    return;
  }
}

const EmailCommandParser = z.coerce.string().email();

async function emailCommandHandler(interaction: CommandInteraction<CacheType>) {
  const email = interaction.options.get("email")?.value;
  const parsedEmail = EmailCommandParser.safeParse(email);

  if (!parsedEmail.success) {
    await interaction.reply("You provided an invalid email!");
    return;
  }

  await redis.set(`discord:${interaction.user.id}:email`, parsedEmail.data);
  await interaction.reply(`
    Your email has been set to **${email}**.
  `);
}

async function askCommandHandler(interaction: CommandInteraction<CacheType>) {
  const question = interaction.options.data.find(
    (option) => option.name === "question",
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
