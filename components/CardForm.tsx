"use client";
import { useState, useTransition } from "react";
import { upsertCard } from "@/app/actions/card";

export default function CardForm({ initial }: { initial?: any }) {
  const [pending, start] = useTransition();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [access, setAccess] = useState<"PUBLIC"|"PRIVATE">(initial?.access ?? "PUBLIC");

  return (
    <form
      onSubmit={(e)=>{e.preventDefault(); start(async ()=>{ await upsertCard({ id: initial?.id, title, content, access }); }); }}
      className="space-y-3 border rounded-2xl p-4"
    >
      <input className="w-full border p-2 rounded" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      <textarea className="w-full border p-2 rounded" placeholder="Content" rows={5} value={content} onChange={e=>setContent(e.target.value)} />
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <span>Access</span>
          <select value={access} onChange={e=>setAccess(e.target.value as any)} className="border p-2 rounded">
            <option value="PUBLIC">PUBLIC</option>
            <option value="PRIVATE">PRIVATE</option>
          </select>
        </label>
        <button disabled={pending} className="ml-auto rounded-2xl border px-4 py-2">{pending ? "Saving..." : "Save"}</button>
      </div>
    </form>
  );
}
