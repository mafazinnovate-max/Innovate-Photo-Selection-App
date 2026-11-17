import { prisma } from "@/lib/prisma";

export default async function Loading() {
    const superAdmin = await prisma.superAdmin.findFirst({
        select: {
            logoUrl: true,
        },
    });

    return (
        <div className="flex min-h-screen items-center justify-center bg-black">
            {superAdmin?.logoUrl && (
                <img
                    src={superAdmin.logoUrl}
                    alt="Picknovate"
                    width={96}
                    height={96}
                    loading="eager"
                    className="h-20 w-20 object-contain animate-pulse sm:h-24 sm:w-24"
                />
            )}
        </div>
    );
}