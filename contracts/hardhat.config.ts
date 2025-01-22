import { HardhatUserConfig, task } from "hardhat/config";
import "hardhat-tracer";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";


task("node", "Starts a JSON-RPC server on top of Hardhat Network").setAction(
  async (taskArgs, hre, runSuper) => {
    // Log forking details before starting the node
    const networkConfig = hre.network.config;

    if (
      "forking" in networkConfig &&
      networkConfig.forking &&
      networkConfig.forking.url
    ) {
      console.log("Forking enabled with the following configuration:");
      console.log(`Forking URL: ${networkConfig.forking.url}`);
      if (networkConfig.forking.blockNumber) {
        console.log(
          `Forking Block Number: ${networkConfig.forking.blockNumber}`
        );
      } else {
        console.log("Forking from the latest block.");
      }
    } else {
      console.log("Forking is not enabled.");
    }

    // Then, run the original node task
    await runSuper(taskArgs);
  }
);

function privateKey() {
  return process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [];
}

function getRpcUrl(chain: string) {
  const envName = chain.toUpperCase() + "_RPC_URL";
  const url = process.env[envName];

  if (!url) {
    throw new Error(`Missing environment variable ${envName}`);
  }

  return url;
}

const config: HardhatUserConfig = {
  solidity: "0.8.27",

  mocha: {
    timeout: 100000000,
  },

  networks: {
    hardhat: {
      forking: {
        url: getRpcUrl("sepolia"),
        blockNumber: 7235828,
      },
    },
    localhost: {
      url: "http://localhost:8545",
      accounts: privateKey(),
    },
    sepolia: {
      url: getRpcUrl("sepolia"),
      accounts: privateKey(),
    },
  },
};

export default config;
