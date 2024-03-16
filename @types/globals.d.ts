export {};

export type Assistant = {
  id: string;
  name: string;
  isAvailable: boolean;
};

declare global {
  var openai: any;
  var queue: any[];
  var openaiThreads: OpenAIThreadsMap;
  var originalMessageMap: Map;
  var assistants: Assistant[];
}
