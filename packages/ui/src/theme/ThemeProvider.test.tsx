import { render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeProvider";

function ShowTheme() {
  return <span>{useTheme()}</span>;
}

describe("ThemeProvider", () => {
  it("sets data-theme on its wrapper and exposes the theme via context", () => {
    const { container } = render(
      <ThemeProvider theme="dark">
        <ShowTheme />
      </ThemeProvider>,
    );
    expect(container.firstElementChild).toHaveAttribute("data-theme", "dark");
    expect(screen.getByText("dark")).toBeInTheDocument();
  });

  it("defaults to light outside a provider", () => {
    render(<ShowTheme />);
    expect(screen.getByText("light")).toBeInTheDocument();
  });
});
