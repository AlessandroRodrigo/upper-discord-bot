import { ChannelType, Message } from "discord.js";

export async function messageCreateHandler(message: Message<boolean>) {
  if (message.channel.type === ChannelType.DM && !message.author.bot) {
    await message.reply("You sent a DM: " + message.content);
  }
}
