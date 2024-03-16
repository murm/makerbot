import { Message } from "discord.js";
import { Command } from "../../types/commands";
import { parseCommand } from "../../utils/commands";
import { InvalidCommandEmbed } from "../../utils/embeds";

export const slap: Command = {
  name: "slap",
  alias: ["slap", "slå"],
  description: "Slap somone with something!",
  handle: (message, args) => {
    message.channel.send(
      `<@${message.author.id}> slaps ${args[0]} around a bit with ${
        args[1] ? args[1] : "a large trout"
      }!`
    );
  },
  help: "!slap <user> [item]",
  example: '!slap @someone "a crowbar"',
  permissions: ["ADMINISTRATOR"],
  validation: (message: Message) => {
    const { args } = parseCommand(message.content);

    if (args.length < 1) {
      const embed = InvalidCommandEmbed(slap, "Missing required arguments.");

      message.channel.send({ embeds: [embed] });
      return false;
    }

    return true;
  },
};
