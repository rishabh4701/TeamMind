"use client";

import { useState } from "react";
import CardForm from "./CardForm";

export default function CreateCardSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-2xl p-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="border rounded-2xl px-4 py-2 font-medium hover:bg-gray-50"
        >
          ➕ Create Card
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">New Card</h2>
            <button
              onClick={() => setOpen(false)}
              className="text-sm text-gray-600 hover:underline"
            >
              Cancel
            </button>
          </div>
          <CardForm />
        </div>
      )}
    </div>
  );
}
