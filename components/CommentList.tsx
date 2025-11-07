export default function CommentList({ comments }: { comments: { id: string; text: string; createdBy: { name: string | null, email: string }; createdAt: Date }[] }) {
  return (
    <ul className="mt-2 space-y-2">
      {comments.map(c=>(
        <li key={c.id} className="text-sm border rounded p-2">
          <div className="font-medium">{c.createdBy.name ?? c.createdBy.email} <span className="text-xs text-gray-500">• {new Date(c.createdAt).toLocaleString()}</span></div>
          <div>{c.text}</div>
        </li>
      ))}
    </ul>
  );
}
