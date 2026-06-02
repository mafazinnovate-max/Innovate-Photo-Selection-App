
import EventForm from "@/components/admin/event-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

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
                coverImageUrl: event.coverImageUrl ?? "",
                coverPosition: event.coverPosition ?? 0,
            }}
        />
    );
}