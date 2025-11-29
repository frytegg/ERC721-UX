// src/lib/fakeNefturians.ts
import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import fakeNefturiansAbi from "../abi/fakeNefturians.json";
import { getBrowserProvider, SEPOLIA_CHAIN_ID_DEC } from "./ethereum";

export const FAKE_NEFTURIANS_ADDRESS =
  "0x9bAADf70BD9369F54901CF3Ee1b3c63b60F4F0ED";

type SignerOrProvider = BrowserProvider | JsonRpcSigner;

export function getFakeNefturiansContract(
  signerOrProvider: SignerOrProvider,
): Contract {
  return new Contract(
    FAKE_NEFTURIANS_ADDRESS,
    fakeNefturiansAbi.abi,
    signerOrProvider,
  );
}

// Optional helper if you want a standard connect+network check:
export async function connectSepoliaWithSignerForNefturians() {
  const provider = getBrowserProvider();
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId.toString());
  if (chainId !== SEPOLIA_CHAIN_ID_DEC) {
    throw new Error(
      `Wrong network: expected Sepolia (${SEPOLIA_CHAIN_ID_DEC}), got ${chainId}`,
    );
  }
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { provider, signer, address, chainId };
}
