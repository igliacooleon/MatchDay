import { bytesToHex, getAddress } from "viem";
import type { Address } from "viem";

declare global {
  interface Window {
    RelayerSDK?: any;
    relayerSDK?: any;
    ethereum?: any;
    okxwallet?: any;
  }
}

export type EncryptedWeightPayload = {
  handle: `0x${string}`;
  proof: `0x${string}`;
};

let fhevmInstance: any = null;

/**
 * Get SDK from window (loaded via static script tag in HTML)
 * SDK 0.3.0-5 is loaded via static script tag in index.html
 */
const getSDK = (): any => {
  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires browser environment");
  }

  // Check for both uppercase and lowercase versions
  const sdk = window.RelayerSDK || window.relayerSDK;

  if (!sdk) {
    throw new Error("RelayerSDK not loaded. Please ensure the script tag is in your HTML.");
  }

  return sdk;
};

/**
 * Initialize FHE instance (singleton pattern)
 */
export const initializeFHE = async (provider?: any): Promise<any> => {
  if (fhevmInstance) {
    return fhevmInstance;
  }

  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires browser environment");
  }

  const ethereumProvider = provider ||
    window.ethereum ||
    window.okxwallet?.provider ||
    window.okxwallet;

  if (!ethereumProvider) {
    throw new Error("No Ethereum provider found. Please connect your wallet first.");
  }

  const sdk = getSDK();
  const { initSDK, createInstance, ZamaEthereumConfig, SepoliaConfig } = sdk;

  await initSDK();

  const baseConfig =
    ZamaEthereumConfig && ZamaEthereumConfig.kmsContractAddress ? ZamaEthereumConfig : SepoliaConfig;
  const config = { ...baseConfig, network: ethereumProvider };

  try {
    fhevmInstance = await createInstance(config);
    return fhevmInstance;
  } catch (error) {
    throw error;
  }
};

/**
 * Get FHE instance if it exists
 */
export const getFHEInstance = (): any => {
  return fhevmInstance;
};

/**
 * Check if FHE is ready
 */
export const isFheReady = (): boolean => {
  return fhevmInstance !== null;
};

/**
 * Encrypt weight for league entry using Zama FHE SDK
 * @param weight Weight value (0-100 for example)
 * @param userAddress User's Ethereum address
 * @param contractAddress MatchDay contract address
 * @returns Encrypted weight handle and input proof
 */
export async function encryptWeight(
  weight: bigint,
  userAddress: Address,
  contractAddress: Address
): Promise<EncryptedWeightPayload> {
  if (weight < 0n) {
    throw new Error("Weight cannot be negative");
  }

  if (!isFheReady()) {
    await initializeFHE();
  }

  const instance = getFHEInstance();
  if (!instance) {
    throw new Error("FHE SDK not initialized");
  }

  try {
    const contractAddr = getAddress(contractAddress);
    const userAddr = getAddress(userAddress);

    const input = instance.createEncryptedInput(contractAddr, userAddr);
    input.add64(weight);

    const { handles, inputProof } = await input.encrypt();

    const encryptedHandle = bytesToHex(handles[0]) as `0x${string}`;
    const proof = bytesToHex(inputProof) as `0x${string}`;

    return {
      handle: encryptedHandle,
      proof
    };
  } catch (error) {
    throw new Error(`Failed to encrypt weight: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Decrypt publicly available handles using the relayer SDK
 */
export async function publicDecryptHandles(handles: `0x${string}`[]) {
  if (handles.length === 0) {
    throw new Error("No handles provided for public decryption");
  }

  if (!isFheReady()) {
    await initializeFHE();
  }

  const instance = getFHEInstance();
  if (!instance) {
    throw new Error("FHE SDK not initialized");
  }

  const result = await instance.publicDecrypt(handles);

  const normalized: Record<string, number> = {};
  Object.entries(result.clearValues || {}).forEach(([handle, value]) => {
    const key = handle.toLowerCase();
    normalized[key] = typeof value === "bigint" ? Number(value) : Number(value);
  });

  const values = handles.map((handle) => normalized[handle.toLowerCase()] ?? 0);

  return {
    values,
    abiEncoded: result.abiEncodedClearValues as `0x${string}`,
    proof: result.decryptionProof as `0x${string}`
  };
}
