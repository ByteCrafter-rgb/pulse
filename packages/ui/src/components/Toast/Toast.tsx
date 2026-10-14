import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../theme/ThemeProvider";
import { cn } from "../../utils/cn";
import { useIsClient } from "../../utils/useIsClient";

export type ToastVariant = "info" | "success" | "warning" | "danger";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Milliseconds before auto-dismiss. `null` keeps the toast until it is closed. */
  duration?: number | null;
  action?: { label: string; onClick: () => void };
}

interface ToastRecord extends ToastOptions {
  id: number;
}

export interface ToastApi {
  show: (toast: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside <ToastProvider>");
  return api;
}

export interface ToastProviderProps {
  children: ReactNode;
  defaultDuration?: number;
  /** Older toasts are dropped once the queue is longer than this. */
  max?: number;
}

export function ToastProvider({ children, defaultDuration = 5000, max = 4 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (toast: ToastOptions) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { duration: defaultDuration, ...toast, id }].slice(-max));
      return id;
    },
    [defaultDuration, max],
  );

  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastRecord[];
  onDismiss: (id: number) => void;
}) {
  const theme = useTheme();
  const isClient = useIsClient();
  if (!isClient) return null;

  // Both live regions stay mounted so screen readers are already watching
  // them when a toast is inserted. Danger toasts interrupt; the rest wait.
  const urgent = toasts.filter((toast) => toast.variant === "danger");
  const polite = toasts.filter((toast) => toast.variant !== "danger");

  return createPortal(
    <div
      data-theme={theme}
      className="pointer-events-none fixed right-0 bottom-0 z-50 flex w-full max-w-sm flex-col gap-sm p-lg"
    >
      <div role="status" aria-live="polite" className="flex flex-col gap-sm">
        {polite.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
      <div role="alert" aria-live="assertive" className="flex flex-col gap-sm">
        {urgent.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </div>,
    document.body,
  );
}

const accentClasses: Record<ToastVariant, string> = {
  info: "border-l-accent",
  success: "border-l-success",
  warning: "border-l-warning",
  danger: "border-l-danger",
};

function ToastItem({ toast, onDismiss }: { toast: ToastRecord; onDismiss: (id: number) => void }) {
  const { id, title, description, variant = "info", duration, action } = toast;
  const titleId = useId();
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration ?? null);
  const startedAt = useRef(0);

  useEffect(() => {
    if (paused || remaining.current === null) return;
    startedAt.current = Date.now();
    const timer = setTimeout(() => onDismiss(id), remaining.current);
    return () => {
      clearTimeout(timer);
      if (remaining.current !== null) {
        remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current));
      }
    };
  }, [paused, id, onDismiss]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onDismiss(id);
    }
  }

  return (
    // Handlers here only catch events bubbling from the buttons inside, to pause and to close on Escape.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      role="group"
      aria-labelledby={titleId}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onKeyDown={handleKeyDown}
      className={cn(
        "pointer-events-auto flex items-start gap-md rounded-md border border-l-4 border-border",
        "bg-surface-raised p-md text-text shadow-lg",
        accentClasses[variant],
      )}
    >
      <div className="flex-1">
        <p id={titleId} className="text-sm font-semibold">
          {title}
        </p>
        {description && <p className="mt-xs text-sm text-text-muted">{description}</p>}
        {action && (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              onDismiss(id);
            }}
            className="focus-visible:focus-ring mt-sm rounded-sm text-sm font-medium text-accent underline-offset-2 hover:underline"
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        aria-label={`Dismiss: ${title}`}
        onClick={() => onDismiss(id)}
        className="focus-visible:focus-ring rounded-sm p-xs text-text-muted hover:text-text"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
          <path
            d="M5 5l10 10M15 5L5 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
