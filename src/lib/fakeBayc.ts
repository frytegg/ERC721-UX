// src/lib/fakeBayc.ts
import { Contract, BrowserProvider, JsonRpcSigner } from "ethers";
import fakeBaycAbi from "../abi/fakeBayc.json";
import { getBrowserProvider, SEPOLIA_CHAIN_ID_DEC } from "./ethereum";

export const FAKE_BAYC_ADDRESS =
  "0x1dA89342716B14602664626CD3482b47D5C2005E";

type SignerOrProvider = BrowserProvider | JsonRpcSigner;

export function getFakeBaycContract(signerOrProvider: SignerOrProvider): Contract {
  const abi = (fakeBaycAbi as any).abi ?? (fakeBaycAbi as any);
  return new Contract(FAKE_BAYC_ADDRESS, abi, signerOrProvider);
}

// Optional utility: ensure we are on Sepolia and get signer + address
export async function connectSepoliaWithSigner() {
  const provider = getBrowserProvider();

  const network = await provider.getNetwork();
  const chainId = Number(network.chainId.toString());
  if (chainId !== SEPOLIA_CHAIN_ID_DEC) {
    throw new Error(`Wrong network: expected Sepolia (${SEPOLIA_CHAIN_ID_DEC}), got ${chainId}`);
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address, chainId };
}
