import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import fakeMeebitsClaimerAbi from "../abi/fakeMeebitsClaimer.json";
import { getBrowserProvider, SEPOLIA_CHAIN_ID_DEC } from "./ethereum";

export const FAKE_MEEBITS_CLAIMER_ADDRESS =
  "0x5341e225Ab4D29B838a813E380c28b0eFD6FBa55";

type SignerOrProvider = BrowserProvider | JsonRpcSigner;

export function getFakeMeebitsClaimerContract(
  signerOrProvider: SignerOrProvider,
): Contract {
  return new Contract(
    FAKE_MEEBITS_CLAIMER_ADDRESS,
    fakeMeebitsClaimerAbi.abi,
    signerOrProvider,
  );
}

export async function connectSepoliaWithSignerForMeebitsClaimer() {
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
