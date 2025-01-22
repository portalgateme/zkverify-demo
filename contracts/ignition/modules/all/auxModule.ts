// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const auxModule = buildModule("auxModule", (m) => {
    const initialOwner = m.getParameter("initialOwner", m.getAccount(0));

    // relayerHub
    const relayerHub = m.contract("RelayerHub", [initialOwner]);

    // feeManager
    const feeManager = m.contract("FeeManager", [initialOwner, relayerHub]);

    // mimc
    const mimc = m.contract("Mimc254", []);

    // noteManager
    const noteManager = m.contract("NoteManager", [initialOwner]);

    return { relayerHub, feeManager, mimc, noteManager };
});

export default auxModule;
