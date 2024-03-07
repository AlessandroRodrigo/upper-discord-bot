import { BUSINESS_CONSTANTS } from "@/business/constants";
import { redis } from "@/lib/redis";
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
  const isCommand = message.content.startsWith("/");

  if (isMasterUser) {
    return true;
  }

  if (isCommand || !isContentBased || isBot || isAdmin) {
    return false;
  }

  if (isDMBased && isTextBased) {
    return true;
  }

  const isTicketChannel = BusinessLayer.checkIfIsTicketChannel(
    message.channel.name,
    message.author.username,
  );
  const needsHuman = redis.get(`discord:${message.author.id}:needsHuman`);

  if (isTextBased && isTicketChannel && !needsHuman) {
    return true;
  }

  return false;
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
