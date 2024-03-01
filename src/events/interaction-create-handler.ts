import { redis } from "@/lib/redis";
import { CacheType, CommandInteraction, Interaction } from "discord.js";
import { z } from "zod";

export async function interactionCreateHandler(
  interaction: Interaction<CacheType>,
) {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

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
    await interaction.reply(
      "O e-mail informado é inválido. Por favor, tente novamente.",
    );
    return;
  }

  await redis.set(`discord:${interaction.user.id}:email`, parsedEmail.data);
  await interaction.reply(`
    E-mail configurado com sucesso para **${parsedEmail.data}**.
  `);
}
