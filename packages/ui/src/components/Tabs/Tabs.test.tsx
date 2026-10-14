import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { Tabs, type TabItem } from "./Tabs";

const items: TabItem[] = [
  { id: "overview", label: "Overview", content: "Overview panel" },
  { id: "latency", label: "Latency", content: "Latency panel" },
  { id: "errors", label: "Errors", content: "Errors panel", disabled: true },
  { id: "alerts", label: "Alerts", content: "Alerts panel" },
];

function setup(props: Partial<ComponentProps<typeof Tabs>> = {}) {
  const user = userEvent.setup();
  render(<Tabs items={items} label="Service sections" {...props} />);
  return { user, tab: (name: string) => screen.getByRole("tab", { name }) };
}

describe("Tabs", () => {
  it("has no axe violations", async () => {
    const { container } = render(<Tabs items={items} label="Service sections" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("wires tabs to panels with ARIA", () => {
    const { tab } = setup();
    expect(screen.getByRole("tablist", { name: "Service sections" })).toBeInTheDocument();
    expect(tab("Overview")).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel", { name: "Overview" });
    expect(tab("Overview")).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveTextContent("Overview panel");
  });

  it("puts only the selected tab in the tab order (roving tabindex)", async () => {
    const { user, tab } = setup();
    await user.tab();
    expect(tab("Overview")).toHaveFocus();
    expect(tab("Latency")).toHaveAttribute("tabindex", "-1");
    await user.tab();
    expect(screen.getByRole("tabpanel")).toHaveFocus();
  });

  it("moves and selects with arrow keys, skipping disabled tabs and wrapping", async () => {
    const { user, tab } = setup();
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(tab("Latency")).toHaveFocus();
    expect(tab("Latency")).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowRight}");
    expect(tab("Alerts")).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(tab("Overview")).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(tab("Alerts")).toHaveFocus();
  });

  it("jumps with Home and End", async () => {
    const { user, tab } = setup();
    await user.tab();
    await user.keyboard("{End}");
    expect(tab("Alerts")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(tab("Overview")).toHaveFocus();
  });

  it("in manual mode, arrows move focus and Enter selects", async () => {
    const onValueChange = vi.fn();
    const { user, tab } = setup({ activation: "manual", onValueChange });
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(tab("Latency")).toHaveFocus();
    expect(tab("Overview")).toHaveAttribute("aria-selected", "true");
    expect(onValueChange).not.toHaveBeenCalled();

    await user.keyboard("{Enter}");
    expect(tab("Latency")).toHaveAttribute("aria-selected", "true");
    expect(onValueChange).toHaveBeenCalledWith("latency");
  });

  it("respects a controlled value", async () => {
    const onValueChange = vi.fn();
    const { user, tab } = setup({ value: "alerts", onValueChange });
    expect(tab("Alerts")).toHaveAttribute("aria-selected", "true");
    await user.click(tab("Overview"));
    expect(onValueChange).toHaveBeenCalledWith("overview");
    expect(tab("Alerts")).toHaveAttribute("aria-selected", "true");
  });
});
