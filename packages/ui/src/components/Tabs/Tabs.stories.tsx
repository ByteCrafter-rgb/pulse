import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Tabs, type TabItem, type TabsProps } from "./Tabs";

const items: TabItem[] = [
  { id: "overview", label: "Overview", content: <p>Latency, error rate and throughput.</p> },
  { id: "latency", label: "Latency", content: <p>p50, p95 and p99 over time.</p> },
  { id: "errors", label: "Errors", content: <p>5xx responses and timeouts.</p> },
  { id: "alerts", label: "Alerts", content: <p>Rules and recent events.</p> },
];

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  args: { items, label: "Service sections", onValueChange: fn() },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ManualActivation: Story = {
  args: { activation: "manual" },
};

export const WithDisabledTab: Story = {
  args: {
    items: items.map((item) => (item.id === "errors" ? { ...item, disabled: true } : item)),
  },
};

function ControlledTabs(props: TabsProps) {
  const [value, setValue] = useState("latency");
  return (
    <div>
      <p className="mb-md text-sm text-text-muted">Selected: {value}</p>
      <Tabs {...props} value={value} onValueChange={setValue} />
    </div>
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledTabs {...args} />,
};

export const ManyTabs: Story = {
  args: {
    items: Array.from({ length: 12 }, (_, i) => ({
      id: `svc-${i}`,
      label: `Service ${i + 1}`,
      content: <p>Details for service {i + 1}.</p>,
    })),
  },
  render: (args) => (
    <div className="max-w-md overflow-x-auto">
      <Tabs {...args} />
    </div>
  ),
};

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("tab", { name: "Overview" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Latency" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.keyboard("{End}");
    await expect(canvas.getByRole("tab", { name: "Alerts" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(canvas.getByRole("tab", { name: "Overview" })).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith("overview");
  },
};
