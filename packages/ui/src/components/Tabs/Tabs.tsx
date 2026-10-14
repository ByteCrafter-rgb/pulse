import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  /** Accessible name for the tab list. */
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /**
   * "automatic" selects a tab as soon as it receives focus. Use "manual" when
   * showing a panel is expensive, so arrow keys only move focus and
   * Enter/Space selects.
   */
  activation?: "automatic" | "manual";
  className?: string;
}

export function Tabs({
  items,
  label,
  value,
  defaultValue,
  onValueChange,
  activation = "automatic",
  className,
}: TabsProps) {
  const baseId = useId();
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const firstEnabled = items.find((item) => !item.disabled)?.id;
  const [internalValue, setInternalValue] = useState(defaultValue ?? firstEnabled);
  const selected = value ?? internalValue;

  function select(id: string) {
    if (value === undefined) setInternalValue(id);
    onValueChange?.(id);
  }

  function focusTab(id: string) {
    tabRefs.current.get(id)?.focus();
    if (activation === "automatic") select(id);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentId: string) {
    const enabled = items.filter((item) => !item.disabled);
    const index = enabled.findIndex((item) => item.id === currentId);
    let target: TabItem | undefined;

    switch (event.key) {
      case "ArrowRight":
        target = enabled[(index + 1) % enabled.length];
        break;
      case "ArrowLeft":
        target = enabled[(index - 1 + enabled.length) % enabled.length];
        break;
      case "Home":
        target = enabled[0];
        break;
      case "End":
        target = enabled[enabled.length - 1];
        break;
      default:
        return;
    }

    event.preventDefault();
    if (target) focusTab(target.id);
  }

  const tabId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = (id: string) => `${baseId}-panel-${id}`;

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className="flex gap-xs border-b border-border">
        {items.map((item) => {
          const isSelected = item.id === selected;
          return (
            <button
              key={item.id}
              ref={(node) => {
                if (node) tabRefs.current.set(item.id, node);
                else tabRefs.current.delete(item.id);
              }}
              type="button"
              role="tab"
              id={tabId(item.id)}
              aria-selected={isSelected}
              aria-controls={panelId(item.id)}
              disabled={item.disabled}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => select(item.id)}
              onKeyDown={(event) => handleKeyDown(event, item.id)}
              className={cn(
                "-mb-px border-b-2 px-lg py-sm text-sm font-medium transition-colors",
                "focus-visible:focus-ring rounded-t-sm",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isSelected
                  ? "border-accent text-text"
                  : "border-transparent text-text-muted hover:text-text",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={panelId(item.id)}
          aria-labelledby={tabId(item.id)}
          hidden={item.id !== selected}
          tabIndex={0}
          className="focus-visible:focus-ring rounded-sm py-lg"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
