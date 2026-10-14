import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { ToastProvider, useToast, type ToastOptions } from "./Toast";

function Trigger({ toast }: { toast: ToastOptions }) {
  const { show } = useToast();
  return (
    <button type="button" onClick={() => show(toast)}>
      Notify
    </button>
  );
}

function setup(
  toast: ToastOptions,
  providerProps: { defaultDuration?: number; max?: number } = {},
) {
  const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
  render(
    <ToastProvider {...providerProps}>
      <Trigger toast={toast} />
    </ToastProvider>,
  );
  return { user, trigger: screen.getByRole("button", { name: "Notify" }) };
}

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("has no axe violations with toasts showing", async () => {
    const { user, trigger } = setup({ title: "Service added", description: "kv-store" });
    await user.click(trigger);
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it("announces non-urgent toasts through a polite status region", async () => {
    const { user, trigger } = setup({ title: "Service added", variant: "success" });
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toBeEmptyDOMElement();

    await user.click(trigger);
    expect(within(status).getByText("Service added")).toBeInTheDocument();
  });

  it("announces danger toasts through an assertive alert region", async () => {
    const { user, trigger } = setup({ title: "Scrape failed", variant: "danger" });
    await user.click(trigger);
    expect(within(screen.getByRole("alert")).getByText("Scrape failed")).toBeInTheDocument();
    expect(within(screen.getByRole("status")).queryByText("Scrape failed")).toBeNull();
  });

  it("auto-dismisses after its duration", async () => {
    const { user, trigger } = setup({ title: "Saved", duration: 3000 });
    await user.click(trigger);
    act(() => vi.advanceTimersByTime(2900));
    expect(screen.getByText("Saved")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByText("Saved")).toBeNull();
  });

  it("pauses the timer while focus is inside the toast", async () => {
    const { user, trigger } = setup({ title: "Saved", duration: 3000 });
    await user.click(trigger);
    act(() => screen.getByRole("button", { name: "Dismiss: Saved" }).focus());
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("stays until dismissed when duration is null, and closes on Escape", async () => {
    const { user, trigger } = setup({ title: "Disk almost full", duration: null });
    await user.click(trigger);
    act(() => vi.advanceTimersByTime(60_000));
    const dismiss = screen.getByRole("button", { name: "Dismiss: Disk almost full" });
    dismiss.focus();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Disk almost full")).toBeNull();
  });

  it("runs the action and closes", async () => {
    const onClick = vi.fn();
    const { user, trigger } = setup({
      title: "Service removed",
      action: { label: "Undo", onClick },
    });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Service removed")).toBeNull();
  });

  it("drops the oldest toast past the max", async () => {
    const { user, trigger } = setup({ title: "Ping" }, { max: 2 });
    await user.click(trigger);
    await user.click(trigger);
    await user.click(trigger);
    expect(screen.getAllByText("Ping")).toHaveLength(2);
  });

  it("throws a helpful error outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Trigger toast={{ title: "x" }} />)).toThrow(/ToastProvider/);
  });
});
