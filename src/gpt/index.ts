import OpenAI from "openai";
import {
  getOriginalMessageId,
  sendSubsequentReplies,
  sleep,
  splitStringIntoChunks,
} from "../utils/helpers";
import { Message } from "discord.js";
import { Assistant } from "../../@types/globals";

const apology = `:warning: Apologies, I encountered a problem while handling your request. ¯\\_(ツ)_/¯`;

export const setupGpt = () => {
  globalThis.openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  globalThis.queue = [];
  globalThis.openaiThreads = {};
  globalThis.originalMessageMap = new Map();
  globalThis.assistants = [
    {
      id: process.env.OPENAI_ASSISTANT_ID!,
      name: "BOT",
      isAvailable: true,
    },
  ];
};

export interface OpenAIThreadsMap {
  [channelId: string]: string;
}

export const processMessage = async (
  message: Message,
  assistant: Assistant
) => {
  console.log("### Interacting with bot started");
  const interval = setInterval(() => {
    message.channel.sendTyping();
  }, 3000);

  try {
    const threadKey = getOriginalMessageId(message.id);

    await createThread(threadKey);

    const openAiThreadId = globalThis.openaiThreads[threadKey];

    const run = await generateMessage(openAiThreadId, assistant.id);
    const status = await statusCheckLoop(openAiThreadId, run.id);

    clearInterval(interval);

    if (status === "completed") {
      console.log("### Process completed successfully");

      const messages = await getMessages(openAiThreadId);

      let responseArray: string[] = [messages.data[0].content[0].text.value];
      if (messages.data[0].content[0].text.value.length > 1900) {
        responseArray = splitStringIntoChunks(
          messages.data[0].content[0].text.value,
          1900
        );
      }

      sendSubsequentReplies(message, responseArray);
    } else {
      console.log("### Process failed miserably");

      message.reply(apology);
    }
  } catch (e) {
    clearInterval(interval);

    message.reply(apology);
  }
};

export const createThread = async (threadKey: string) => {
  if (globalThis.openaiThreads[threadKey]) {
    return globalThis.openaiThreads[threadKey];
  }

  console.log("### Creating new thread");

  const threadResponse = await globalThis.openai.beta.threads.create();

  globalThis.openaiThreads[threadKey] = threadResponse.id;

  return threadResponse.id;
};

export const addMessage = async (openAiThreadId: string, content: string) => {
  console.log("### Adding message");

  try {
    const added = await globalThis.openai.beta.threads.messages.create(
      openAiThreadId,
      {
        role: "user",
        content,
      }
    );

    return added;
  } catch (e) {
    return;
  }
};

export const generateMessage = async (
  openAiThreadId: string,
  assistantId: string
) => {
  console.log("### Generating message");

  const run = await globalThis.openai.beta.threads.runs.create(openAiThreadId, {
    assistant_id: assistantId,
  });

  return run;
};

export const getMessages = async (openAiThreadId: string) => {
  console.log("### Getting messages");

  const messages = await globalThis.openai.beta.threads.messages.list(
    openAiThreadId
  );

  return messages;
};

type RunStatus = "canceled" | "failed" | "completed" | "expired";

export const statusCheckLoop = async (
  openAiThreadId: string,
  runId: string
): Promise<RunStatus> => {
  console.log("### Processing message");
  const terminalStates: RunStatus[] = [
    "canceled",
    "failed",
    "completed",
    "expired",
  ];

  while (true) {
    const run = await openai.beta.threads.runs.retrieve(openAiThreadId, runId);

    if (terminalStates.includes(run.status)) {
      return run.status;
    }

    await sleep(200);
  }
};

export const addToQueue = (message: Message) => {
  console.log("### Adding to queue");
  globalThis.queue.push(message);
};

export const startGpt = async () => {
  console.log("### Starting GPT");
  while (true) {
    globalThis.assistants.forEach((assistant) => {
      if (assistant.isAvailable && globalThis.queue.length > 0) {
        assistant.isAvailable = false; // Mark the assistant as busy
        const message = globalThis.queue.shift(); // Get the next message

        processMessage(message, assistant).finally(() => {
          assistant.isAvailable = true; // Mark the assistant as available again
        });
      }
    });

    await sleep(200); // Allow time for other operations
  }
};

const findAndUseAssistant = () => {
  return globalThis.assistants.find((assistant) => assistant.isAvailable);
};
