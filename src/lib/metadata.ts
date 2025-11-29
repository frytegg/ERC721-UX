// src/lib/metadata.ts

// Convert ipfs:// URI to an HTTP gateway URL
export function resolveIpfsUri(uri: string, preferredGatewayBase?: string): string {
  if (!uri.startsWith("ipfs://")) return uri;
  const path = uri.slice("ipfs://".length);
  const base = normalizeGatewayBase(preferredGatewayBase) ?? "https://ipfs.io/ipfs/";
  return `${base}${path}`;
}

// Resolve URIs that might be https or ipfs for IMAGE usage
export function resolveImageUri(uri: string, preferredGatewayBase?: string): string {
  if (uri.startsWith("ipfs://")) {
    return resolveIpfsUri(uri, preferredGatewayBase);
  }
  // data: URLs or normal https/http are fine as-is
  return uri;
}

// Fetch JSON from a tokenURI that may be https, ipfs, or data:...base64
export async function fetchJsonFromTokenUri(tokenUri: string): Promise<any> {
  const dataPrefix = "data:application/json;base64,";
  if (tokenUri.startsWith(dataPrefix)) {
    const b64 = tokenUri.slice(dataPrefix.length);
    const jsonStr = atob(b64);
    return JSON.parse(jsonStr);
  }

  const url =
    tokenUri.startsWith("ipfs://") ? resolveIpfsUri(tokenUri, inferPreferredGatewayFromTokenUri(tokenUri)) : tokenUri;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch metadata. HTTP status ${res.status}`);
  }
  return await res.json();
}

// Try to infer the preferred gateway from a known HTTP tokenURI
export function inferPreferredGatewayFromTokenUri(tokenUri: string): string | undefined {
  try {
    const u = new URL(tokenUri);
    // Known pattern: https://gateway.pinata.cloud/ipfs/<CID>/...
    if (u.hostname.includes("pinata") && u.pathname.startsWith("/ipfs/")) {
      return "https://gateway.pinata.cloud/ipfs/";
    }
    // You can add more gateways here if needed
  } catch {
    // Not an HTTP URL; ignore
  }
  return undefined;
}

function normalizeGatewayBase(base?: string): string | undefined {
  if (!base) return undefined;
  // Ensure it ends with /ipfs/
  if (base.endsWith("/ipfs/")) return base;
  if (base.endsWith("/ipfs")) return `${base}/`;
  if (!base.endsWith("/")) base = `${base}/`;
  return `${base}ipfs/`;
}
