import crypto from "crypto";
import fetch from "node-fetch";

export async function getTokenPriceSig(request, collection, tokenId) {
  const serverAddress = "https://lenft-api-w27ha.ondigitalocean.app";
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  };
  const tokenBestBidResponse = await fetch(
    serverAddress +
      "/api/assetPriceSig?requestId=" +
      request +
      "&address=" +
      collection +
      "&tokenId=" +
      tokenId,
    options
  ).catch((err) => console.error(err));
  const priceSig = await tokenBestBidResponse.json();

  return priceSig;
}

export function getNewRequestID() {
  const requestID = crypto.randomBytes(32).toString("hex");
  return "0x" + requestID;
}
