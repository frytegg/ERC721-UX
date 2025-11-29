// src/lib/ethereum.ts
import { BrowserProvider } from "ethers";

export const SEPOLIA_CHAIN_ID_DEC = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

export function getEthereum() {
  const { ethereum } = window as any;
  if (!ethereum) {
    throw new Error("MetaMask / window.ethereum not found");
  }
  return ethereum;
}

export function getBrowserProvider(): BrowserProvider {
  const ethereum = getEthereum();
  return new BrowserProvider(ethereum);
}

export async function requestAccounts(): Promise<string[]> {
  const ethereum = getEthereum();
  const accounts: string[] = await ethereum.request({
    method: "eth_requestAccounts",
  });
  return accounts;
}
