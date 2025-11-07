"use client";

import LikeButton from "./LikeButton";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

export default function CardItem({
  card,
}: {
  card: {
    id: string;
    title: string;
    content: string;
    summary?: string | null;
    tags: string[];
    likesCount: number;
    access: "PUBLIC" | "PRIVATE"; // ✅ literal type instead of Prisma enum
    teamId: string;
    comments: {
      id: string;
      text: string;
      createdBy: { name: string | null; email: string };
      createdAt: Date;
    }[];
  };
}) {
  return (
    <div className="rounded-2xl border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">{card.title}</h3>
        {card.access === "PRIVATE" && (
          <span className="ml-1 text-xs px-2 py-0.5 border rounded-full">
            🔒 PRIVATE
          </span>
        )}
        <span className="ml-auto text-xs border rounded px-2">
          {card.teamId}
        </span>
      </div>

      {card.summary && <p className="text-sm text-gray-700">{card.summary}</p>}
      <p className="text-sm whitespace-pre-wrap">{card.content}</p>

      <div className="flex flex-wrap gap-2">
        {card.tags?.map((t) => (
          <span key={t} className="text-xs border rounded px-2 py-0.5">
            #{t}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <LikeButton cardId={card.id} likesCount={card.likesCount} />
      </div>

      <CommentForm cardId={card.id} />
      <CommentList comments={card.comments} />
    </div>
  );
}
