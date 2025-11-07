"use client";
import { useState, useTransition } from "react";
import { addComment } from "@/app/actions/card";

export default function CommentForm({ cardId }: { cardId: string }) {
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  return (
    <form onSubmit={(e)=>{e.preventDefault(); const t=text; setText(""); start(async()=>{ await addComment({ cardId, text: t }); });}}
      className="flex gap-2">
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="Write a comment..." className="flex-1 border p-2 rounded"/>
      <button disabled={pending || !text.trim()} className="rounded-2xl border px-3">Post</button>
    </form>
  );
}
