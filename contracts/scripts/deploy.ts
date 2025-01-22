import hre from "hardhat";
import ZkModule from "../ignition/modules/all/zkModule";

async function getRocketNameFromAPI() {
    // Mock function to simulate an asynchronous API call
    return "Saturn VI";
}

async function main() {
    const rocketName = await getRocketNameFromAPI();

    const { zkHub, vkRegistry } = await hre.ignition.deploy(ZkModule, {
        parameters: {
            zkModule: {
                zkVerifyAttestation: "0x1234567890123456789012345678901234567890"
            }
        }
    });

    console.log(`zkHub deployed to: ${zkHub.target}`);
    console.log(`vkRegistry deployed to: ${vkRegistry.target}`);
}

main().catch(console.error);