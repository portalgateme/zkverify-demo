import { expect } from "chai";
import hre from "hardhat";
import localDeploymentModule from "../ignition/modules/env/localDeploymentModule";
import {
  initSession,
  registerVerificationKey,
  submitProof,
} from "../services/zkVerify";
import { ATTESTATION_RELAYER_ADDRESS, TEST_PRIVATE_KEYS } from "./utils/consts";
import { createNote } from "../services/darkpool/note";
import { parseEther } from "ethers";
import { generateDepositProofParams } from "../services/proof/deposit";
import { loadVk } from "./utils/loadVk";
import { zkVerifySession } from "zkverifyjs";
import { sendToZKV } from "./utils/sendToZKV";
import { seedZkVerifyTransaction } from "./utils/seedZKV_fork";
import { DarkpoolAssetManager, ETHAssetPool } from "../typechain-types";
import { mintSigners } from "./utils/signers_fork";

describe.only("contracts", function () {
  let ethAsset = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  let ethAmount = parseEther("1").toString();
  let session: zkVerifySession;

  before(async function () {
    session = await initSession();
  });

  it("all contracts are deployed correctly", async function () {
    const {
      zkHub,
      vkRegistry,
      erc20,
      erc721,
      eth,
      feeManager,
      relayerHub,
      darkpoolAssetManager,
    } = await hre.ignition.deploy(localDeploymentModule);

    expect(zkHub.target).to.be.properAddress;
    expect(vkRegistry.target).to.be.properAddress;
    expect(erc20.target).to.be.properAddress;
    expect(erc721.target).to.be.properAddress;
    expect(eth.target).to.be.properAddress;
    expect(feeManager.target).to.be.properAddress;
    expect(relayerHub.target).to.be.properAddress;
    expect(darkpoolAssetManager.target).to.be.properAddress;
  });

  it("deposit", async function () {
    const { darkpoolAssetManager } = (await hre.ignition.deploy(
      localDeploymentModule
    )) as unknown as { darkpoolAssetManager: DarkpoolAssetManager };

    const [signer1] = await mintSigners(hre);

    const note = await createNote({
      pk: TEST_PRIVATE_KEYS[0],
      amount: ethAmount,
      asset: ethAsset,
    });

    const { proof, publicInputs } = await generateDepositProofParams(note);

    const vk = loadVk("deposit");

    const { attestationId, merkleTreeRoot, solidityAttestationDetails } =
      await sendToZKV(session, vk, proof, publicInputs, hre.network.provider);

    await seedZkVerifyTransaction(hre, attestationId, merkleTreeRoot);

    await darkpoolAssetManager
      .connect(signer1)
      .depositETH(note.note, note.note_footer, solidityAttestationDetails, {
        value: "0x" + parseEther("1").toString(16),
      });
  });

});
