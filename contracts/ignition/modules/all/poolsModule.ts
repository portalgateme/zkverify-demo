// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const poolsModule = buildModule("poolsModule", (m) => {
    const initialOwner = m.getParameter("initialOwner", m.getAccount(0));

    // erc20
    const erc20 = m.contract("ERC20AssetPool", [initialOwner]);
    // erc721
    const erc721 = m.contract("ERC721AssetPool", [initialOwner]);
    // eth
    const eth = m.contract("ETHAssetPool", [initialOwner]);

    return { erc20, erc721, eth };
});

export default poolsModule;
