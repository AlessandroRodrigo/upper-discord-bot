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
  interaction.deferReply();
  const email = interaction.options.get("email")?.value;
  const parsedEmail = EmailCommandParser.safeParse(email);

  if (!parsedEmail.success) {
    await interaction.editReply(
      "O e-mail informado é inválido. Por favor, tente novamente.",
    );
    return;
  }

  await redis.set(`discord:${interaction.user.id}:email`, parsedEmail.data);
  await interaction.editReply(`
    Muito bom! Seu e-mail foi salvo com sucesso. Agora podemos continuar com as suas dúvidas.
  `);
}
