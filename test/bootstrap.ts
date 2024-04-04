import { uptime } from "node:os";
import { findUp } from "find-up";
import dotenv from "dotenv";

export async function runTest(code: () => any) {
  console.log("starting test", uptime());
  const envFile = await findUp(".env");
  dotenv.config({ path: envFile });
  await code();
  console.log("done in", process.uptime());
}
