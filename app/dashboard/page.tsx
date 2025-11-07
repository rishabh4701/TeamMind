import { prisma } from "@/lib/prisma";
import CardItem from "@/components/CardItem";
import CreateCardSection from "@/components/CreateCardSection";

export const dynamic = "force-dynamic";

async function getCards(search?: string, tag?: string) {
  const where: any = { access: "PUBLIC" };
  if (search)
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  if (tag) where.tags = { has: tag };
  return prisma.knowledgeCard.findMany({
    where,
    include: {
      comments: { include: { createdBy: true }, orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string };
}) {
  const cards = await getCards(searchParams?.q, searchParams?.tag);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Global Knowledge (PUBLIC)</h1>

      {/* ✅ Client-side CreateCardSection */}
      <CreateCardSection />

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={searchParams?.q ?? ""}
          placeholder="Search title/content"
          className="flex-1 border p-2 rounded"
        />
        <input
          name="tag"
          defaultValue={searchParams?.tag ?? ""}
          placeholder="Filter by tag"
          className="border p-2 rounded"
        />
        <button className="border rounded-2xl px-4">Filter</button>
      </form>

      <div className="grid md:grid-cols-2 gap-4">
        {cards.map((c) => (
          <CardItem key={c.id} card={c as any} />
        ))}
      </div>
    </div>
  );
}
