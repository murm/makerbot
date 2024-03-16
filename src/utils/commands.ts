import { commands } from "../commands";
import { Message } from "discord.js";
import yargsParser from "yargs-parser";

export const isCommand = (message: Message) => {
  return message.content.startsWith("!");
};

export const getCommand = (commandName: string) => {
  return commands.find(
    (c) => c.name === commandName || c.alias.includes(commandName)
  );
};

export const handleCommand = (message: Message) => {
  const { commandName, args, options } = parseCommand(message.content);

  const commandToExecute = getCommand(commandName);

  if (!commandToExecute) {
    return;
  }

  if (commandToExecute.permissions) {
    // TODO: check permissions
  }

  if (commandToExecute.validation && !commandToExecute.validation(message)) {
    return;
  }

  if (commandToExecute.handle) {
    commandToExecute.handle(message, args, options);
  }
};

export const parseCommand = (input: string) => {
  const commandBody = input.startsWith("!") ? input.slice(1) : input;

  const args = yargsParser(commandBody, {
    configuration: {
      "short-option-groups": false,
      "camel-case-expansion": false,
      "boolean-negation": false,
    },
    alias: { f: "force" },
    boolean: ["f", "force"],
  });

  const commandName = args._[0];

  const namedArgs: { [key: string]: any } = {};
  for (const key in args) {
    if (key !== "_" && key !== "--") {
      namedArgs[key] = args[key];
    }
  }

  const cleanedArgs = args._.slice(1).map((arg: string | number) => {
    if (
      typeof arg === "string" &&
      ((arg.startsWith('"') && arg.endsWith('"')) ||
        (arg.startsWith("'") && arg.endsWith("'")))
    ) {
      return arg.slice(1, -1);
    }

    return arg;
  });

  return {
    commandName: commandName as string,
    args: cleanedArgs,
    options: namedArgs,
  };
};
