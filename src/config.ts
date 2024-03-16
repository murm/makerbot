import { config } from "dotenv";
import { resolve } from "path";

export const setupConfig = () => {
  config({ path: resolve(__dirname, "..", ".env") });

  let envFile = "";
  switch (process.env.NODE_ENV) {
    case "production":
      envFile = ".env.production";
      break;
    case "staging":
      envFile = ".env.staging";
      break;
    case "dev":
      envFile = ".env.local";
      break;
  }

  if (envFile) {
    config({ path: resolve(__dirname, "..", envFile) });
  }
};
