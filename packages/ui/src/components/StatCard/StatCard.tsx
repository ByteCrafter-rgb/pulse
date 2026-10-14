import { useId, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type Trend = "up" | "down" | "flat";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Change versus the previous period. Its sign sets the trend unless `trend` is given. */
  delta?: number;
  /** Formatted delta text. Defaults to a signed percentage. */
  deltaLabel?: string;
  trend?: Trend;
  /**
   * Which direction is good news. Throughput going up is good; latency going
   * up is not. Controls the color and the screen-reader wording.
   */
  goodDirection?: "up" | "down";
  hint?: ReactNode;
  loading?: boolean;
  className?: string;
}

function trendFromDelta(delta: number): Trend {
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "flat";
}

function formatDelta(delta: number): string {
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  return `${sign}${Math.abs(delta)}%`;
}

const trendWords: Record<Trend, string> = {
  up: "up",
  down: "down",
  flat: "unchanged",
};

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  trend,
  goodDirection = "up",
  hint,
  loading = false,
  className,
}: StatCardProps) {
  const labelId = useId();
  const resolvedTrend = trend ?? (delta === undefined ? undefined : trendFromDelta(delta));
  const sentiment =
    resolvedTrend === undefined || resolvedTrend === "flat"
      ? "neutral"
      : resolvedTrend === goodDirection
        ? "good"
        : "bad";
  const deltaText = deltaLabel ?? (delta === undefined ? undefined : formatDelta(delta));
  const magnitude = delta === undefined ? "" : ` ${Math.abs(delta)}%`;

  let spoken = resolvedTrend ? trendWords[resolvedTrend] : "";
  if (resolvedTrend && resolvedTrend !== "flat") {
    spoken += deltaLabel ? ` ${deltaLabel}` : magnitude;
  }
  if (sentiment === "good") spoken += ", improving";
  if (sentiment === "bad") spoken += ", worsening";

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      aria-busy={loading || undefined}
      className={cn(
        "flex flex-col gap-xs rounded-lg border border-border bg-surface-raised p-lg shadow-sm",
        className,
      )}
    >
      <span id={labelId} className="text-sm font-medium text-text-muted">
        {label}
      </span>

      {loading ? (
        <span className="h-8 w-24 animate-pulse rounded-sm bg-surface-subtle motion-reduce:animate-none">
          <span className="sr-only">Loading</span>
        </span>
      ) : (
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
      )}

      {!loading && resolvedTrend && (
        <span
          className={cn(
            "inline-flex items-center gap-xs text-sm font-medium",
            sentiment === "good" && "text-success",
            sentiment === "bad" && "text-danger",
            sentiment === "neutral" && "text-text-muted",
          )}
        >
          <TrendIcon trend={resolvedTrend} />
          {deltaText && <span aria-hidden="true">{deltaText}</span>}
          <span className="sr-only">{spoken}</span>
        </span>
      )}

      {hint && <span className="text-xs text-text-muted">{hint}</span>}
    </div>
  );
}

const trendPaths: Record<Trend, string> = {
  up: "M4 12 L10 6 L16 12",
  down: "M4 8 L10 14 L16 8",
  flat: "M4 10 L16 10",
};

function TrendIcon({ trend }: { trend: Trend }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
      <path d={trendPaths[trend]} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
