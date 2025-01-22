import { EthereumProvider, HardhatRuntimeEnvironment } from "hardhat/types";
import { TEST_PRIVATE_KEYS } from "./consts";
import { Wallet } from "ethers";

export async function mintSigners(hre: HardhatRuntimeEnvironment) {
  const wallets = TEST_PRIVATE_KEYS.map((pk) => new Wallet(pk));

  const promises = wallets.map(async (wallet) => {
    await hre.network.provider.send("hardhat_impersonateAccount", [
      wallet.address,
    ]);

    return await hre.ethers.getImpersonatedSigner(wallet.address);
  });

  return await Promise.all(promises);
}
