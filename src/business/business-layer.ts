import { BUSINESS_CONSTANTS } from "@/business/constants";
import { Message } from "discord.js";

function checkIfIsTicketChannel(channelName: string, userName: string) {
  return channelName.includes(userName);
}

function shouldAnswer(message: Message) {
  const { ADMINISTRATOR_PERMISSION } = BUSINESS_CONSTANTS;

  const isDMBased = message.channel.isDMBased();
  const isTextBased = message.channel.isTextBased();
  const isContentBased = !!message.content;
  const isBot = message.author.bot;
  const isAdmin = message.member?.permissions.has(ADMINISTRATOR_PERMISSION);
  const isMasterUser = message.author.id === process.env.MASTER_USER;

  if (isMasterUser) {
    return true;
  }

  if (!isContentBased) {
    return false;
  }

  if (isBot || isAdmin) {
    return false;
  }

  if (isDMBased && isTextBased) {
    return true;
  }

  const isTicketChannel = BusinessLayer.checkIfIsTicketChannel(
    message.channel.name,
    message.author.username,
  );

  return isTextBased && isTicketChannel;
}

function shouldVerifyEmail(message: Message) {
  const { ADMINISTRATOR_PERMISSION } = BUSINESS_CONSTANTS;

  const isAdmin = message.member?.permissions.has(ADMINISTRATOR_PERMISSION);

  return !isAdmin;
}

export const BusinessLayer = {
  shouldAnswer,
  checkIfIsTicketChannel,
  shouldVerifyEmail,
};
