import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import fakeMeebitsAbi from "../abi/fakeMeebits.json";
import { getBrowserProvider, SEPOLIA_CHAIN_ID_DEC } from "./ethereum";

export const FAKE_MEEBITS_ADDRESS =
  "0xD1d148Be044AEB4948B48A03BeA2874871a26003";

type SignerOrProvider = BrowserProvider | JsonRpcSigner;

export function getFakeMeebitsContract(
  signerOrProvider: SignerOrProvider,
): Contract {
  return new Contract(FAKE_MEEBITS_ADDRESS, fakeMeebitsAbi.abi, signerOrProvider);
}

export async function connectSepoliaWithSignerForMeebits() {
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
