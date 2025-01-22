import { Note } from "../services/darkpool/note";

export function toHex(n: bigint) {
  return n.toString(16).padStart(64, "0");
}

export function to0xHex(n: bigint) {
  return "0x" + toHex(n);
}

export function toToml(obj: unknown): string {
  if (Array.isArray(obj)) {
    return `[${obj
      .map((item) => {
        if (typeof item === "string" && item.startsWith("0x")) {
          return `"${item}"`;
        }
        return toToml(item);
      })
      .join(",")}]`;
  }

  if (typeof obj === "object" && obj !== null) {
    return Object.entries(obj)
      .map(([key, value]) => `${key} = ${toToml(value)}`)
      .join("\n");
  }

  if (typeof obj === "string") {
    if (obj.startsWith("0x")) {
      return `"${obj}"`;
    }
    return `"${obj}"`;
  }

  if (typeof obj === "number") {
    return obj.toString();
  }

  return String(obj);
}
