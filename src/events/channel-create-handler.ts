import { BusinessLayer } from "@/business/business-layer";
import { logger } from "@/lib/logger";
import { NonThreadGuildBasedChannel, TextChannel } from "discord.js";

export async function channelCreateHandler(
  channel: NonThreadGuildBasedChannel,
) {
  logger.info(
    `Received channel create event for ${channel.id} - ${channel.name}`,
  );

  const isTextBased = channel instanceof TextChannel;
  const channelUsername = channel.name.split("-")[1];
  const guildMemberList = await channel.guild.members.search({
    query: channelUsername,
  });
  const guildMember = guildMemberList.find(
    (guildMember) => guildMember.user.username === channelUsername,
  );

  if (!guildMember || !guildMember.user.username) {
    logger.info(`User not found for channel ${channel.id} - ${channel.name}`);
    return;
  }

  const isTicketChannel = BusinessLayer.checkIfIsTicketChannel(
    channel.name,
    guildMember.user.username,
  );

  if (isTextBased && isTicketChannel) {
    await handleGreetings(channel);
  }
}

async function handleGreetings(channel: TextChannel) {
  logger.info(`Sending welcome message to ${channel.id} - ${channel.name}`);
  await channel.send(
    `Olá! Eu sou o Upper e estou aqui para te ajudar com dúvidas do curso, para começar me diga qual é o seu e-mail. Para fazer isso basta usar o comando \`/email <seu-email>\`. Se já configurou seu e-mail, basta ignorar essa mensagem e me enviar sua dúvida.`,
  );
  await channel.send(
    `Se precisar falar com um humano, basta utilizar o comando \`/human\` e um de nossos moderadores irá te ajudar.`,
  );
}
