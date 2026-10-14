import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const colors = [
  "surface",
  "surface-subtle",
  "surface-raised",
  "text",
  "text-muted",
  "border",
  "border-strong",
  "accent",
  "accent-subtle",
  "success",
  "warning",
  "danger",
  "focus",
] as const;

const spacing = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;
const radii = ["sm", "md", "lg", "full"] as const;
const shadows = ["sm", "md", "lg"] as const;
const textSizes = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-2xl">
      <h2 className="mb-md text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function TokenGallery() {
  return (
    <div>
      <Section title="Color">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-md">
          {colors.map((name) => (
            <div key={name} className="rounded-md border border-border p-sm">
              <div
                className="mb-sm h-12 rounded-sm border border-border"
                style={{ background: `var(--pulse-color-${name})` }}
              />
              <code className="font-mono text-xs">--pulse-color-{name}</code>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Spacing">
        {spacing.map((name) => (
          <div key={name} className="mb-xs flex items-center gap-md">
            <code className="w-40 font-mono text-xs">--pulse-space-{name}</code>
            <div className="h-3 bg-accent" style={{ width: `var(--pulse-space-${name})` }} />
          </div>
        ))}
      </Section>
      <Section title="Typography">
        {textSizes.map((name) => (
          <p key={name} style={{ fontSize: `var(--pulse-text-${name})` }}>
            text-{name}: The quick brown fox
          </p>
        ))}
      </Section>
      <Section title="Radius and shadow">
        <div className="flex flex-wrap gap-lg">
          {radii.map((name) => (
            <div
              key={name}
              className="flex h-20 w-20 items-center justify-center border border-border-strong text-xs"
              style={{ borderRadius: `var(--pulse-radius-${name})` }}
            >
              {name}
            </div>
          ))}
          {shadows.map((name) => (
            <div
              key={name}
              className="flex h-20 w-20 items-center justify-center rounded-md bg-surface-raised text-xs"
              style={{ boxShadow: `var(--pulse-shadow-${name})` }}
            >
              shadow-{name}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

const meta = {
  title: "Foundations/Tokens",
  component: TokenGallery,
  tags: ["!autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TokenGallery>;

export default meta;

export const All: StoryObj<typeof meta> = {};
