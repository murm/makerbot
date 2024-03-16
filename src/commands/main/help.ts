import { EmbedBuilder } from "discord.js";
import { Command } from "../../types/commands";
import { getCommand } from "../../utils/commands";
import { commands } from "../index";

export const help: Command = {
  name: "help",
  alias: ["help"],
  description: "Provides help for commands",
  handle: (message, args) => {
    const embed = new EmbedBuilder().setTitle("Help with commands").setColor("#0099ff");

    if (args.length === 0) {
      embed.addFields(
        commands.map((cmd) => ({
          name: cmd.name,
          value: `${cmd.help}\n_${cmd.description}_`,
          inline: false,
        }))
      );
    } else {
      const command = getCommand(args[0]);
      if (command) {
        embed
          .setTitle(`Command: ${command.name}`)
          .setDescription(command.description)
          .addFields({ name: "Usage", value: command.help, inline: true });

        if (command.alias && command.alias.length > 0) {
          embed.addFields({
            name: "Aliases",
            value: command.alias.join(", "),
            inline: true,
          });
        }
      } else {
        embed
          .setColor("#ff0000")
          .setDescription(`:warning: Command not found: ${args[0]}`);
      }
    }

    message.channel.send({ embeds: [embed] });
  },
  help: "!help [commandName]",
};
