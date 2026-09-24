import { QUOTE_STATUS_META } from "../lib/quotes";
import type { QuoteStatus } from "../lib/types";

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const meta = QUOTE_STATUS_META[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${meta.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {meta.label}
    </span>
  );
}
