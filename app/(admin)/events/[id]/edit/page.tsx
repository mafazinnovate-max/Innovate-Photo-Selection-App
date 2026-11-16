import EventForm from "@/components/admin/event-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";

interface EditEventPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditEventPage({
    params,
}: EditEventPageProps) {
    const { id } = await params;

    const event = await prisma.event.findUnique({
        where: {
            id,
        },
    });

    if (!event) {
        notFound();
    }

    // Generate a temporary URL for an R2 cover image.
    let coverImageUrl = event.coverImageUrl ?? "";

    if (event.coverImageKey) {
        try {
            coverImageUrl = await getSignedUrl(
                r2,
                new GetObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: event.coverImageKey,
                }),
                { expiresIn: 3600 },
            );
        } catch (error) {
            console.error(
                "Failed to generate event cover URL:",
                error,
            );
        }
    }

    return (
        <EventForm
            mode="edit"
            initialData={{
                id: event.id,
                name: event.name,
                clientName: event.clientName,
                eventType: event.eventType,
                description: event.description ?? "",
                eventDate: event.eventDate
                    ? event.eventDate.toISOString().split("T")[0]
                    : "",
                phoneNumber: event.phoneNumber ?? "",
                email: event.email ?? "",
                galleryMode: event.galleryMode ?? "single",
                coverImageUrl,
                coverPosition: event.coverPosition ?? 0,
            }}
        />
    );
}