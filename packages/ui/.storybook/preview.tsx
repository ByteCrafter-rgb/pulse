import { useEffect, type ReactNode } from "react";
import type { Decorator, Preview } from "@storybook/react-vite";
import { ThemeProvider, type Theme } from "../src/theme/ThemeProvider";
import "./preview.css";

// Portaled content (Modal, Toast) renders outside the decorator, so the root element needs the theme too.
function ThemedCanvas({ theme, children }: { theme: Theme; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset["theme"] = theme;
  }, [theme]);

  return (
    <ThemeProvider theme={theme} className="p-xl">
      {children}
    </ThemeProvider>
  );
}

const withTheme: Decorator = (Story, context) => (
  <ThemedCanvas theme={context.globals["theme"] as Theme}>
    <Story />
  </ThemedCanvas>
);

const preview: Preview = {
  tags: ["autodocs"],
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  parameters: {
    a11y: { test: "error" },
    controls: { expanded: true },
    backgrounds: { disable: true },
  },
};

export default preview;
