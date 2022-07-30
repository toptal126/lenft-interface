import crypto from "crypto";
import fetch from "node-fetch";

export async function getTokenPriceSig(request, collection, tokenId) {
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  };
  const tokenBestBidResponse = await fetch(
    "/api/assetPrice?address=" + collection + "&tokenId=" + tokenId,
    options
  ).catch((err) => console.error(err));
  const priceSig = await tokenBestBidResponse.json();

  return priceSig;
}