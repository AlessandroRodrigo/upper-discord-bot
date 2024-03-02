import { BusinessLayer } from "@/business/business-layer";
import { Message } from "discord.js";
import { MockInstance, beforeEach, describe, expect, it, vi } from "vitest";

const defaultMessage = {
  channel: {
    isDMBased: vi.fn(),
    isTextBased: vi.fn(),
    name: "mocked-channel-name",
  },
  author: {
    bot: false,
  },
  member: {
    permissions: {
      has: vi.fn(),
    },
  },
};

describe("business-layer", () => {
  describe("shouldAnswer", () => {
    let isTicketChannelSpy: MockInstance<
      [channelName: string, userName: string],
      boolean
    >;

    beforeEach(() => {
      defaultMessage.channel.isDMBased.mockReturnValue(false);
      defaultMessage.channel.isTextBased.mockReturnValue(false);
      defaultMessage.author.bot = false;
      defaultMessage.member?.permissions.has.mockReturnValue(false);
      isTicketChannelSpy = vi.spyOn(BusinessLayer, "checkIfIsTicketChannel");
    });

    it("answers when the message is from an administrator", () => {
      defaultMessage.member?.permissions.has.mockReturnValue(true);

      const result = BusinessLayer.shouldAnswer(
        defaultMessage as unknown as Message,
      );

      expect(result).toBe(true);
      expect(isTicketChannelSpy).not.toHaveBeenCalled();
    });

    it("doesn't answer when the message is from a bot", () => {
      defaultMessage.author.bot = true;

      const result = BusinessLayer.shouldAnswer(
        defaultMessage as unknown as Message,
      );

      expect(result).toBe(false);
      expect(isTicketChannelSpy).not.toHaveBeenCalled();
    });

    it("answers when the message is from a DM-based channel and is text-based", () => {
      defaultMessage.channel.isDMBased.mockReturnValue(true);
      defaultMessage.channel.isTextBased.mockReturnValue(true);

      const result = BusinessLayer.shouldAnswer(
        defaultMessage as unknown as Message,
      );

      expect(result).toBe(true);
      expect(isTicketChannelSpy).not.toHaveBeenCalled();
    });

    it("doesn't answer when the message is from a DM-based channel and is not text-based", () => {
      defaultMessage.channel.isDMBased.mockReturnValue(true);
      defaultMessage.channel.isTextBased.mockReturnValue(false);

      const result = BusinessLayer.shouldAnswer(
        defaultMessage as unknown as Message,
      );

      expect(result).toBe(false);
    });

    it("answers when the message is from a text-based channel and is a ticket channel", () => {
      defaultMessage.channel.isTextBased.mockReturnValue(true);
      isTicketChannelSpy.mockReturnValueOnce(true);

      const result = BusinessLayer.shouldAnswer(
        defaultMessage as unknown as Message,
      );

      expect(result).toBe(true);
    });

    it("doesn't answer when the message is from a text-based channel and is not a ticket channel", () => {
      defaultMessage.channel.isTextBased.mockReturnValue(true);
      isTicketChannelSpy.mockReturnValueOnce(false);

      const result = BusinessLayer.shouldAnswer(
        defaultMessage as unknown as Message,
      );

      expect(result).toBe(false);
    });

    it("doesn't answer when the message is from a non-text-based channel", () => {
      defaultMessage.channel.isTextBased.mockReturnValue(false);

      const result = BusinessLayer.shouldAnswer(
        defaultMessage as unknown as Message,
      );

      expect(result).toBe(false);
      expect(isTicketChannelSpy).toHaveBeenCalled();
    });
  });
});
