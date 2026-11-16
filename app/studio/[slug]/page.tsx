import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Template1 from "../templates/template-1";
import Template2 from "../templates/template-2";
import Template3 from "../templates/template-3";

export default async function StudioProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const profile = await prisma.studioProfile.findFirst({
    where: {
      publicSlug: slug,
      isPublished: true,
    },
    include: {
      packages: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      portfolioPhotos: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  switch (profile.templateKey) {
  case "template-1":
    return <Template1 profile={profile} />;

  case "template-2":
    return <Template2 profile={profile} />;

  case "template-3":
    return <Template3 profile={profile} />;

  default:
    return <Template1 profile={profile} />;
}
}