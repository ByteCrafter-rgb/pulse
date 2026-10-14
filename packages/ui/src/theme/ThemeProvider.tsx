import { createContext, useContext, type ReactNode } from "react";
import { cn } from "../utils/cn";

export type Theme = "light" | "dark";

const ThemeContext = createContext<Theme>("light");

export interface ThemeProviderProps {
  theme: Theme;
  children: ReactNode;
  className?: string;
}

/**
 * Scopes the token set for `theme` to its subtree. The app owns the choice
 * (system preference, a stored setting, a toggle) and passes it in.
 */
export function ThemeProvider({ theme, children, className }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={theme}>
      <div data-theme={theme} className={cn("bg-surface text-text font-sans", className)}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
