import fs from "node:fs";
import path from "node:path";

const src = path.resolve("client/dist");
const dest = path.resolve("dist");

if (fs.existsSync(src)) {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true });
  console.log("Copied client/dist to root dist/ directory successfully.");
}
