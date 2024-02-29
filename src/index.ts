import { askCommand, emailCommand } from "@/commands";
import { interactionCreateHandler } from "@/events/interaction-create-handler";
import { messageCreateHandler } from "@/events/message-create-handler";
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
  console.log("Ready!");
});

const commands = [askCommand, emailCommand].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

rest
  .put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);

client.on(Events.InteractionCreate, interactionCreateHandler);

client.on(Events.MessageCreate, messageCreateHandler);

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

client.login(token);
