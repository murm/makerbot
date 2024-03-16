import { Message } from "discord.js";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getOriginalMessageId = (messageId: string) => {
  return globalThis.originalMessageMap.get(messageId) || messageId;
};

export const addOriginalMessageId = async (message: Message) => {
  if (message.reference) {
    const repliedToMessageId = message.reference.messageId;
    const originalMessageId =
      globalThis.originalMessageMap.get(repliedToMessageId) ||
      repliedToMessageId;
    globalThis.originalMessageMap.set(message.id, originalMessageId);
  }
};

export const splitStringIntoChunks = (
  str: string,
  chunkSize: number
): string[] => {
  //const regex = new RegExp(".{1," + chunkSize + "}", "g"); // splits on new lines
  const regex = new RegExp("[\\s\\S]{1," + chunkSize + "}", "g");

  return str.match(regex)?.flatMap((chunk) => chunk.trim()) || [];
};

export const replyHelper = async (
  message: Message,
  response: string
): Promise<Message> => {
  return message.reply(response);
};

export const sendSubsequentReplies = async (
  originalMessage: Message,
  responseArray: string[]
) => {
  let messageToReplyTo = originalMessage;

  for (let i = 0; i < responseArray.length; i++) {
    let response = responseArray[i];

    if (responseArray.length > 1) {
      response = `**(${i + 1}/${responseArray.length})**\n${response}`;
    }

    const sentMessage = await replyHelper(messageToReplyTo, response);

    messageToReplyTo = sentMessage;
  }
};
