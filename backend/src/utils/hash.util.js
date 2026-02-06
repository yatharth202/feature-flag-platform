import crypto from "crypto";

export const getUserRolloutBucket = (userId, flagKey) => {
  const hash = crypto
    .createHash("sha256")
    .update(`${userId}:${flagKey}`)
    .digest("hex");


  const bucket = parseInt(hash.substring(0, 8), 16) % 100;
  return bucket;
};
