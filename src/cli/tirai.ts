#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { stdin, stdout, stderr } from "node:process";
import { serveMcpStdio } from "./mcp.js";
import { runCli } from "./run.js";

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (argv[0] === "mcp") {
    await serveMcpStdio(stdin, stdout);
    return;
  }
  const input = stdin.isTTY ? "" : readFileSync(0, "utf8");
  const result = runCli(argv, input);
  if (result.stdout) stdout.write(result.stdout);
  if (result.stderr) stderr.write(result.stderr);
  process.exitCode = result.code;
}

void main();
