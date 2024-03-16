import { Message } from "discord.js";

export type Command = {
  name: string;
  alias: string[];
  description: string;
  handle: (message: Message, args: Args, options: Options) => void;
  help: string;
  example?: string;
  permissions?: string[];
  validation?: (message: Message) => boolean;
};
export type Commands = Command[];

export type Args = {
  [key: string]: any;
};

export type Options = {
  [key: string]: any;
};
