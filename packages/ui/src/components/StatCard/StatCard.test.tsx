import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <StatCard label="p95 latency" value="182 ms" delta={12} goodDirection="down" />
        <StatCard label="Throughput" value="1,204 rps" delta={-3} />
        <StatCard label="Error rate" value="0.4%" loading />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("is a group named by its label", () => {
    render(<StatCard label="Throughput" value="1,204 rps" />);
    expect(screen.getByRole("group", { name: "Throughput" })).toHaveTextContent("1,204 rps");
  });

  it("describes the trend in words, not just color", () => {
    render(<StatCard label="p95 latency" value="182 ms" delta={12} goodDirection="down" />);
    expect(screen.getByText("up 12%, worsening")).toBeInTheDocument();
  });

  it("treats a rise as improving when up is the good direction", () => {
    render(<StatCard label="Throughput" value="1,204 rps" delta={8} />);
    expect(screen.getByText("up 8%, improving")).toBeInTheDocument();
  });

  it("lets an explicit trend override the delta sign", () => {
    render(
      <StatCard label="Uptime" value="99.9%" delta={0.01} trend="flat" deltaLabel="+0.01 pt" />,
    );
    expect(screen.getByText("unchanged")).toBeInTheDocument();
  });

  it("shows no value while loading and marks itself busy", () => {
    render(<StatCard label="Error rate" value="0.4%" loading delta={2} />);
    const group = screen.getByRole("group", { name: "Error rate" });
    expect(group).toHaveAttribute("aria-busy", "true");
    expect(group).not.toHaveTextContent("0.4%");
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });
});
