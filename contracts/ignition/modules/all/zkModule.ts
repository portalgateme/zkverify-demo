// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const zkModule = buildModule("zkModule", (m) => {
  const zkVerifyAttestation = m.getParameter(
    "zkVerifyAttestation",
    "0x209f82A06172a8d96CF2c95aD8c42316E80695c1"
  );

  // vkRegistry
  const vkRegistry = m.contract("VkRegistry", []);

  m.call(
    vkRegistry,
    "registerVkHash",
    [
      "deposit",
      "0x8b33b8ad8810b3698c092806467a91960294a5e4be44b5175814b1b83a8ea88c",
    ],
    { id: "registerDepositVkHash" }
  );

  m.call(
    vkRegistry,
    "registerVkHash",
    [
      "withdraw",
      "0xe7f8b00b8828bd428c74c74a2e7068f6b77ace08f9c3d35c3569c25a25c4b034",
    ],
    { id: "registerWithdrawVkHash" }
  );

  // zkHub
  const zkHub = m.contract("ZKHub", [vkRegistry, zkVerifyAttestation]);

  return { vkRegistry, zkHub };
});

export default zkModule;
