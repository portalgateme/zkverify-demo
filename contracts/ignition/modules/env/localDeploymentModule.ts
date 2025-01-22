// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import zkModule from "../all/zkModule";
import poolsModule from "../all/poolsModule";
import auxModule from "../all/auxModule";
import { TEST_PRIVATE_KEYS } from "../../../test/utils/consts";
import { Wallet } from "ethers";
const localDeploymentModule = buildModule("localDeploymentModule", (m) => {
  // Base parameters
  const identityIssuer = m.getParameter("identityIssuer", m.getAccount(0));
  const initialOwner = m.getParameter("initialOwner", m.getAccount(0));

  // Get dependency modules
  const { zkHub, vkRegistry } = m.useModule(zkModule);
  const { erc20, erc721, eth } = m.useModule(poolsModule);
  const { feeManager, relayerHub, mimc, noteManager } = m.useModule(auxModule);

  // Mock compliance manager
  const complianceManager = m.contract("MockComplianceManager", []);
  m.call(complianceManager, "setCompliance", [m.getAccount(0), true], {
    id: "setComplianceForAccount0",
  });
  m.call(
    complianceManager,
    "setCompliance",
    [new Wallet(TEST_PRIVATE_KEYS[0]).address, true],
    {
      id: "setComplianceForAccount1",
    }
  );
  m.call(
    complianceManager,
    "setCompliance",
    [new Wallet(TEST_PRIVATE_KEYS[1]).address, true],
    {
      id: "setComplianceForAccount2",
    }
  );

  // Access portal
  const accessPortal = m.contract("AccessPortal", [
    identityIssuer,
    initialOwner,
    [complianceManager],
  ]);

  // Darkpool asset manager
  const darkpoolAssetManager = m.contract("DarkpoolAssetManager", [
    erc20,
    erc721,
    eth,
    relayerHub,
    feeManager,
    complianceManager,
    mimc,
    zkHub,
    noteManager,
    initialOwner,
  ]);

  m.call(erc20, "setAssetManager", [darkpoolAssetManager, true], {
    id: "setAssetManagerForERC20",
  });

  m.call(eth, "setAssetManager", [darkpoolAssetManager, true], {
    id: "setAssetManagerForETH",
  });

  m.call(erc721, "setAssetManager", [darkpoolAssetManager, true], {
    id: "setAssetManagerForERC721",
  });

  // OTCSwap asset manager
  const otcSwapAssetManager = m.contract("OTCSwapAssetManager", [
    erc20,
    erc721,
    eth,
    relayerHub,
    feeManager,
    complianceManager,
    mimc,
    zkHub,
    noteManager,
    initialOwner,
  ]);

  m.call(erc20, "setAssetManager", [otcSwapAssetManager, true], {
    id: "setSwapAssetManagerForERC20",
  });

  m.call(eth, "setAssetManager", [otcSwapAssetManager, true], {
    id: "setSwapAssetManagerForETH",
  });

  m.call(erc721, "setAssetManager", [otcSwapAssetManager, true], {
    id: "setSwapAssetManagerForERC721",
  });

  m.call(noteManager, "setAssetManager", [darkpoolAssetManager, true], {
    id: "setAssetManagerForNoteManager",
  });

  m.call(
    relayerHub,
    "add",
    [
      "0x0A20B38894799fD27837aF3Ed8929E7b8d1dDDe7"
    ],
    { id: "addRelayer" }
  );

  return {
    zkHub,
    vkRegistry,
    erc20,
    erc721,
    eth,
    feeManager,
    relayerHub,
    complianceManager,
    accessPortal,
    darkpoolAssetManager,
    otcSwapAssetManager,
  };
});

export default localDeploymentModule;
