"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LeadActionsProps {
  leadId: string;
  leadStatus: string;
  suggestedReply: string;
}

export default function LeadActions({ leadId, leadStatus, suggestedReply }: LeadActionsProps) {
  const router = useRouter();
  const [copied, setCopied]   = useState(false);
  const [loading, setLoading] = useState<"contacted" | "closed" | null>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(suggestedReply);
    } catch {
      const el = document.createElement("textarea");
      el.value = suggestedReply;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleAction(action: "contacted" | "closed") {
    setLoading(action);
    try {
      await fetch(`/api/leads/${leadId}/${action}`, { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      setLoading(null);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <button
        onClick={handleCopy}
        className="w-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold py-2.5 rounded-lg transition-colors"
      >
        {copied ? "✓ Copied to clipboard" : "Copy Reply"}
      </button>

      {leadStatus !== "closed" ? (
        <div className="flex gap-2.5">
          <button
            onClick={() => handleAction("contacted")}
            disabled={loading !== null}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading === "contacted" ? "Updating…" : "Mark Contacted"}
          </button>
          <button
            onClick={() => handleAction("closed")}
            disabled={loading !== null}
            className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading === "closed" ? "Updating…" : "Close Lead"}
          </button>
        </div>
      ) : (
        <p className="text-center text-sm text-slate-400 py-1">This lead is closed.</p>
      )}
    </div>
  );
}
