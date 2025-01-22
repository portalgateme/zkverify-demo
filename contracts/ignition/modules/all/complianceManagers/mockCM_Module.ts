// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const mockComplianceManager = buildModule("mockComplianceManager", (m) => {
    const complianceManager = m.contract("MockComplianceManager", []);

    const complianceAddresses = [
        m.getAccount(0),
        m.getAccount(1),
        m.getAccount(2),
        m.getAccount(3),
        m.getAccount(4),
    ]

    for (const address of complianceAddresses) {
        m.call(complianceManager, "setCompliance", [address, true]);
    }

    return { complianceManager }
});

export default mockComplianceManager;
