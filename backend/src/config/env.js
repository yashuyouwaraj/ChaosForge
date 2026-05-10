const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const projectRoot = path.resolve(__dirname, "../..");
const nodeEnv = process.env.NODE_ENV || "development";

const envFiles = [
  path.join(projectRoot, `.env.${nodeEnv}`),
  path.join(projectRoot, ".env"),
];

for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
  }
}

module.exports = { nodeEnv };
