import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatCard } from "./StatCard";

const meta = {
  title: "Components/StatCard",
  component: StatCard,
  args: { label: "Throughput", value: "1,204 rps", delta: 8 },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LatencyWorsening: Story = {
  args: { label: "p95 latency", value: "182 ms", delta: 12, goodDirection: "down" },
};

export const LatencyImproving: Story = {
  args: { label: "p95 latency", value: "143 ms", delta: -9, goodDirection: "down" },
};

export const Flat: Story = {
  args: { label: "Error rate", value: "0.4%", delta: 0 },
};

export const CustomDeltaLabel: Story = {
  args: { label: "Uptime", value: "99.95%", delta: 0.05, deltaLabel: "+0.05 pt" },
};

export const WithHint: Story = {
  args: { hint: "Last 15 minutes" },
};

export const NoDelta: Story = {
  args: { label: "Active alerts", value: "3" },
  render: ({ label, value }) => <StatCard label={label} value={value} />,
};

export const Loading: Story = {
  args: { loading: true },
};

export const LongValues: Story = {
  args: {
    label: "Requests served since the service was registered",
    value: "1,284,993,201",
    delta: 1234.5,
  },
};

export const Row: Story = {
  render: () => (
    <div className="grid w-[48rem] max-w-full grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-lg">
      <StatCard label="p95 latency" value="182 ms" delta={12} goodDirection="down" />
      <StatCard label="Error rate" value="0.4%" delta={-0.2} goodDirection="down" />
      <StatCard label="Throughput" value="1,204 rps" delta={8} />
      <StatCard label="Uptime" value="99.95%" delta={0} />
    </div>
  ),
};
