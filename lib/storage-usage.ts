import "server-only";

import { ListObjectsV2Command } from "@aws-sdk/client-s3";

import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import {
    r2Public,
    R2_PUBLIC_BUCKET_NAME,
} from "@/lib/r2-public";

type BucketUsage = {
    totalBytes: number;
    objectCount: number;
};

type StudioUsage = {
    studioId: string;
    totalBytes: number;
    objectCount: number;
};

async function getBucketUsage(
    client: typeof r2,
    bucketName: string,
    prefix?: string
): Promise<BucketUsage> {
    let continuationToken: string | undefined;
    let totalBytes = 0;
    let objectCount = 0;

    do {
        const response = await client.send(
            new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: prefix,
                ContinuationToken: continuationToken,
                MaxKeys: 1000,
            })
        );

        for (const object of response.Contents ?? []) {
            totalBytes += object.Size ?? 0;
            objectCount++;
        }

        continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return {
        totalBytes,
        objectCount,
    };
}

export async function getStudioStorageUsage(
    studioId: string
) {
    if (!studioId) {
        throw new Error("Studio ID is required.");
    }

    const usage = await getBucketUsage(
        r2,
        R2_BUCKET_NAME,
        `studios/${studioId}/`
    );

    return {
        studioId,
        totalBytes: usage.totalBytes,
        totalGB: usage.totalBytes / (1024 ** 3),
        objectCount: usage.objectCount,
    };
}

export async function getPlatformStorageUsage() {
    let continuationToken: string | undefined;

    let privateBucketBytes = 0;
    let privateObjectCount = 0;

    let publicBucketBytes = 0;
    let publicObjectCount = 0;

    const studioMap = new Map<string, StudioUsage>();

    // Scan private bucket and calculate Studio-wise usage.
    do {
        const response = await r2.send(
            new ListObjectsV2Command({
                Bucket: R2_BUCKET_NAME,
                ContinuationToken: continuationToken,
                MaxKeys: 1000,
            })
        );

        for (const object of response.Contents ?? []) {
            const size = object.Size ?? 0;
            const key = object.Key ?? "";

            privateBucketBytes += size;
            privateObjectCount++;

            const match = key.match(/^studios\/([^/]+)\//);

            if (!match) continue;

            const studioId = match[1];

            const current = studioMap.get(studioId) ?? {
                studioId,
                totalBytes: 0,
                objectCount: 0,
            };

            current.totalBytes += size;
            current.objectCount++;

            studioMap.set(studioId, current);
        }

        continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    // Scan public bucket separately.
    const publicUsage = await getBucketUsage(
        r2Public,
        R2_PUBLIC_BUCKET_NAME
    );

    publicBucketBytes = publicUsage.totalBytes;
    publicObjectCount = publicUsage.objectCount;

    const studioUsage = Array.from(studioMap.values())
        .map((studio) => ({
            ...studio,
            totalGB: studio.totalBytes / (1024 ** 3),
        }))
        .sort((a, b) => b.totalBytes - a.totalBytes);

    const studioTotalBytes = studioUsage.reduce(
        (total, studio) => total + studio.totalBytes,
        0
    );

    const unassignedBytes =
        privateBucketBytes - studioTotalBytes;

    const totalBytes =
        privateBucketBytes + publicBucketBytes;

    return {
        totalBytes,
        totalGB: totalBytes / (1024 ** 3),

        privateBucket: {
            totalBytes: privateBucketBytes,
            totalGB: privateBucketBytes / (1024 ** 3),
            objectCount: privateObjectCount,
        },

        publicBucket: {
            totalBytes: publicBucketBytes,
            totalGB: publicBucketBytes / (1024 ** 3),
            objectCount: publicObjectCount,
        },

        unassigned: {
            totalBytes: unassignedBytes,
            totalGB: unassignedBytes / (1024 ** 3),
        },

        studioUsage,
    };
}