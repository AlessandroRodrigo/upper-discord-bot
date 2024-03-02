function isTicketChannel(channelName: string, userName: string) {
  return channelName.includes(userName);
}

export const Util = {
  isTicketChannel,
};
