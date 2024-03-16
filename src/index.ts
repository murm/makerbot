import { Client, GatewayIntentBits, Message } from "discord.js";
import { setupConfig } from "./config";
import { setupApp } from "./app";
import { setupGpt, startGpt, addToQueue } from "./gpt";
import { handleCommand, isCommand } from "./utils/commands";
import { addOriginalMessageId } from "./utils/helpers";

setupConfig();
setupApp();
setupGpt();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once("ready", () => {
  console.log("### Bot is ready!");

  startGpt();
});

client.on("messageDelete", (message) => {
  globalThis.originalMessageMap.delete(message.id);
  // TODO Additional logic to handle if the deleted message was an original message in the map
});

client.on("messageCreate", async (message: Message) => {
  console.log("### Message", message.content);

  await addOriginalMessageId(message);

  const clientId = client.user!.id;
  const { content, inGuild, author } = message;

  if (
    author.bot ||
    !inGuild ||
    content.includes("@here") ||
    content.includes("@everyone")
  ) {
    return;
  }

  if (message.mentions.users.has(clientId)) {
    addToQueue(message);
  }

  if (isCommand(message)) {
    handleCommand(message);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
