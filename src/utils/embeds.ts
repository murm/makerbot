import { EmbedBuilder } from "discord.js";
import { Command } from "../types/commands";

export const InvalidCommandEmbed = (command: Command, description: string) => {
  const embed = new EmbedBuilder()
    .setColor("#ff0000")
    .setTitle(":warning: Invalid command usage")
    .setDescription(description)
    .addFields({ name: "Correct usage", value: command.help });

  if (command.example) {
    embed.addFields({ name: "Example", value: command.example });
  }

  return embed;
};
