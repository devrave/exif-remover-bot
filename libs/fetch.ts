import fetch from "node-fetch";

export async function fetchAsBuffer(url: string) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  return Buffer.from(arrayBuffer);
}
