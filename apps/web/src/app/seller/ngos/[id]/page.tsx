import NgoDetailClient from "./ngo-detail-client";

export default async function NgoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NgoDetailClient ngoId={id} />;
}
