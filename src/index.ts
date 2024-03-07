import {
  askCommand,
  emailCommand,
  humanCommand,
  upperCommand,
} from "@/commands";
import { channelCreateHandler } from "@/events/channel-create-handler";
import { interactionCreateHandler } from "@/events/interaction-create/handler";
import { logger } from "@/lib/logger";
import {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
} from "discord.js";

const token = process.env.TOKEN!;
const clientId = process.env.CLIENT_ID!;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.Channel],
});

client.once(Events.ClientReady, () => {
  logger.info("Bot is ready.");
});

const commands = [emailCommand, humanCommand, upperCommand, askCommand].map(
  (command) => command.toJSON(),
);

const rest = new REST({ version: "10" }).setToken(token);

rest
  .put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => logger.info("Successfully registered application commands."))
  .catch(logger.error);

client.on(Events.Error, (error) => {
  logger.trace("A client error occurred:", error);
});

client.on(Events.Warn, (warning) => {
  logger.trace("A client warning occurred:", warning);
});

client.on(Events.ChannelCreate, channelCreateHandler);

client.on(Events.InteractionCreate, interactionCreateHandler);

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled promise rejection:", error);
});

client.login(token);
