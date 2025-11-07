import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TEAMS = ["A-Team", "B-Team", "C-Team"] as const;

async function getTeamSections(viewerTeamId: string) {
  // counts for each team, respecting display rules: own team all, others public
  const sections = await Promise.all(TEAMS.map(async (teamId) => {
    const where: any = (teamId === viewerTeamId)
      ? { teamId } // include both PUBLIC and PRIVATE
      : { teamId, access: "PUBLIC" as const };

    const [cards, count] = await Promise.all([
      prisma.knowledgeCard.findMany({
        where,
        include: { comments: { include: { createdBy: true }, orderBy: { createdAt: "desc" } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.knowledgeCard.count({ where: { teamId } }) // total count for the team (all)
    ]);

    return { teamId, visibleCards: cards, totalCount: count };
  }));
  return sections;
}

export default async function TeamPage({ searchParams }: { searchParams: { teamFilter?: string } }) {
  const session = await auth();
  if (!session?.user) return null;

  const sections = await getTeamSections(session.user.teamId);

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Team View</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {sections.map(({ teamId, visibleCards, totalCount }) => (
          <section key={teamId} className="border rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{teamId} <span className="text-sm text-gray-600">({totalCount} Cards)</span></h2>
            </div>
            <div className="space-y-3">
              {visibleCards.map((c: any) => (
                <div key={c.id} className="border rounded-xl p-3">
                  {/* mini card: lock on private */}
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{c.title}</div>
                    {c.access === "PRIVATE" && (
                      <span className="text-xs px-2 py-0.5 border rounded-full">🔒 PRIVATE</span>
                    )}
                    <div className="ml-auto text-xs">👍 {c.likesCount}</div>
                  </div>
                  <div className="text-sm text-gray-700">{c.summary ?? ""}</div>
                </div>
              ))}

              {visibleCards.length === 0 && <div className="text-sm text-gray-500">No cards yet.</div>}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
