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
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState<"contacted" | "closed" | null>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(suggestedReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const el = document.createElement("textarea");
      el.value = suggestedReply;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-2.5 rounded-lg transition-colors"
      >
        {copied ? "✓ Copied!" : "Copy Reply"}
      </button>

      <div className="flex gap-3 pt-1 border-t border-gray-100">
        {leadStatus !== "closed" && (
          <button
            onClick={() => handleAction("contacted")}
            disabled={loading !== null}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading === "contacted" ? "Updating…" : "Mark as Contacted"}
          </button>
        )}
        {leadStatus !== "closed" && (
          <button
            onClick={() => handleAction("closed")}
            disabled={loading !== null}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading === "closed" ? "Updating…" : "Mark as Closed"}
          </button>
        )}
        {leadStatus === "closed" && (
          <p className="w-full text-center text-sm text-gray-400 py-2">This lead is closed.</p>
        )}
      </div>
    </div>
  );
}
