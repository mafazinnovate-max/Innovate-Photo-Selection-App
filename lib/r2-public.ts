import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_PUBLIC_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_PUBLIC_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_PUBLIC_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL;

if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucketName ||
    !publicUrl
) {
    throw new Error("Missing public R2 configuration variables");
}

export const R2_PUBLIC_BUCKET_NAME = bucketName;
export const R2_PUBLIC_URL = publicUrl.replace(/\/+$/, "");

export const r2Public = new S3Client({
    region: "auto",
    endpoint:
        process.env.R2_ENDPOINT ||
        `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});