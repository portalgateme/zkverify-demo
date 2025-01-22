import { initSession, registerVerificationKey } from "../services/zkVerify";
import { exec } from "child_process";
import { promisify } from "util";
import { promises as fs } from "fs";
import path from "path";

const execAsync = promisify(exec);

async function genVk() {
  console.log("Generating Vks...");
  try {
    const { stdout, stderr } = await execAsync("sh ./sh/gen_vk.sh");
    console.log("VK Generation Output:", stdout);
    if (stderr) {
      console.error("VK Generation Error:", stderr);
    }
  } catch (error) {
    console.error("Failed to execute gen_vk.sh:", error);
    throw error;
  }
}

async function registerVk() {
  const session = await initSession();
  // await genVk();

  try {
    const circuitsDir = path.join(__dirname, "../circuits");
    const directories = await fs.readdir(circuitsDir);

    for (const dir of directories) {
      // Skip the fuzk folder and any non-directory entries
      if (dir === "fuzk") continue;

      const dirPath = path.join(circuitsDir, dir);
      const stats = await fs.stat(dirPath);

      if (stats.isDirectory()) {
        const vkPath = path.join(
          __dirname,
          "..",
          "circuits",
          dir,
          "target",
          "vk"
        );
        try {
          const vkContent = await fs.readFile(vkPath);
          const vkHex = vkContent.toString("hex");

          const statementHash = await registerVerificationKey(session, vkHex);

          console.log("Statement Hash for ", dir, ":", statementHash);
        } catch (error) {
          console.error(`Failed to read VK for ${dir}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error processing directories:", error);
    throw error;
  }
}

registerVk();
