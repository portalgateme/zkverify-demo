import fs from "node:fs";

export function loadVk(circuit: string) {
  const base = "circuits";
  return fs.readFileSync(`${base}/${circuit}/target/vk`).toString("hex");
}
