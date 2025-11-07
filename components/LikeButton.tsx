"use client";
import { useOptimistic, useTransition } from "react";
import { toggleLike } from "@/app/actions/card";

export default function LikeButton({ cardId, likesCount }: { cardId: string; likesCount: number }) {
  const [pending, startTransition] = useTransition();
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likesCount,
    (state, delta: number) => state + delta
  );

  return (
    <button
      onClick={() => {
        // ✅ Wrap optimistic state update inside a transition
        startTransition(async () => {
          addOptimisticLike(1);
          await toggleLike(cardId);
        });
      }}
      className={`rounded-full border px-3 py-1 text-sm ${pending ? "opacity-60 cursor-not-allowed" : ""}`}
      disabled={pending}
    >
      👍 {optimisticLikes}
    </button>
  );
}
