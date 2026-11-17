import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";

export async function GET() {
    try {
        await r2.send(
            new HeadBucketCommand({
                Bucket: R2_BUCKET_NAME,
            })
        );

        return NextResponse.json({
            success: true,
            message: "Cloudflare R2 connected successfully!",
        });
    } catch (error) {
        console.error("R2 connection failed:", error);

        return NextResponse.json(
            {
                success: false,
                message: "R2 connection failed. Check server logs.",
            },
            { status: 500 }
        );
    }
}