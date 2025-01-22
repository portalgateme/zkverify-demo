export const TEST_PRIVATE_KEYS = [
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
] as const;

export const ZK_VERIFY_ATTESTATION_ADDRESS =
  "0x209f82A06172a8d96CF2c95aD8c42316E80695c1";
export const ATTESTATION_RELAYER_ADDRESS =
  "0x1fFD7C562335D06D5439E40Ca3d5c04a708B63A5";
export const INITIAL_BALANCE = "10";

export const ATTESTATION_ABI = [
  "function submitAttestation(uint256 _attestationId, bytes32 _proofsAttestation) external",
];
export const LATEST_ATTESTATION_ABI = [
  "function latestAttestationId() public view returns (uint256)",
];
