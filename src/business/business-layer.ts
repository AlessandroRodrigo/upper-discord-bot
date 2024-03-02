import { BUSINESS_CONSTANTS } from "@/business/constants";
import { Message } from "discord.js";

function checkIfIsTicketChannel(channelName: string, userName: string) {
  return channelName.includes(userName);
}

function shouldAnswer(message: Message) {
  const { ADMINISTRATOR_PERMISSION } = BUSINESS_CONSTANTS;

  const isDMBased = message.channel.isDMBased();
  const isTextBased = message.channel.isTextBased();
  const isBot = message.author.bot;
  const isAdmin = message.member?.permissions.has(ADMINISTRATOR_PERMISSION);

  if (isBot) {
    return false;
  }

  if (isAdmin) {
    return true;
  }

  if (isDMBased && isTextBased) {
    return true;
  }

  const isTicketChannel = BusinessLayer.checkIfIsTicketChannel(
    message.channel.name,
    message.author.username,
  );

  console.log(isTicketChannel);

  return isTextBased && isTicketChannel;
}

export const BusinessLayer = {
  shouldAnswer,
  checkIfIsTicketChannel,
};
