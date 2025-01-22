# zkVerify Demo User Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Flow Overview](#flow-overview)
3. [Code References](#code-references)

## Prerequisites

Before you begin, ensure that you have installed all necessary dependencies and have set up your development environment.

## Flow Overview

The main flow of the zkVerify Demo is as follows:

0. **Register circuits and get the VKHash for each circuit**  
   Before starting, you need to register circuits and obtain the VKHash for each circuit.

1. **Dapp generates proof**  
   In the dapp, generate the required zero-knowledge proof.

2. **Dapp submits proof to relayer**  
   Submit the generated proof, verifyInputs, and VKHash to the relayer.

3. **Relayer submits proof data to zkVerify testnet**  
   The relayer submits the proof data to the zkVerify testnet and returns the AttestationDetails to the dapp. 
   Additionally, the relayer uses a wallet on the zkVerify testnet to pay the gas fee for proof submittion.

4. **Proof is bridged from zkVerify testnet to Sepolia**  
   The proof is bridged from the zkVerify testnet to the Sepolia network.

5. **Dapp calls contract on Sepolia**  
   Using the attestationDetail, the dapp calls the contract on the Sepolia network.

6. **Contract calls ZKHub to verify the proof**  
   The contract calls ZKHub to verify the proof.

## Code References

### Dapp Code Reference

#### [`dapp/src/services/darkpool/depositService.ts`](../main/dapp/src/services/darkpool/depositService.ts)

This file contains the logic for generating and submitting proofs in the dapp.

### Relayer Code Reference

#### [`relayer/src/worker/zkVerifyWorker.js`](../main/relayer/src/worker/zkVerifyWorker.js)

This file contains the logic for the relayer to receive proofs and submit them to the zkVerify testnet.

### Contracts Code Reference

#### [`contracts/contracts/core/DarkpoolAssetManger.sol`](../main/contracts/contracts/core/DarkpoolAssetManger.sol)

This file contains the logic for the contract to call ZKHub to verify the proof on Sepolia.

Please implement your zkVerify Demo based on the above flow and code references.
