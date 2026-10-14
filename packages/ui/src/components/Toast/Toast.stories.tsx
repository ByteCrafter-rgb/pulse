import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, within } from "storybook/test";
import { Button } from "../Button";
import { ToastProvider, useToast, type ToastOptions } from "./Toast";

function Demo({ toasts }: { toasts: Array<{ label: string; toast: ToastOptions }> }) {
  const { show } = useToast();
  return (
    <div className="flex flex-wrap gap-sm">
      {toasts.map(({ label, toast }) => (
        <Button key={label} variant="secondary" onClick={() => show(toast)}>
          {label}
        </Button>
      ))}
    </div>
  );
}

const meta = {
  title: "Components/Toast",
  component: ToastProvider,
  parameters: {
    docs: {
      description: {
        component:
          "Wrap the app in `ToastProvider` and call `useToast().show()` from event handlers. " +
          "Danger toasts go to an assertive `role=alert` region; everything else uses a polite " +
          "`role=status` region. Hovering or focusing a toast pauses its timer.",
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: (args) => (
    <ToastProvider {...args}>
      <Demo
        toasts={[
          { label: "Info", toast: { title: "Scraper restarted" } },
          {
            label: "Success",
            toast: {
              title: "Service added",
              description: "kv-store is now polled every 5s",
              variant: "success",
            },
          },
          {
            label: "Warning",
            toast: { title: "Slow responses", description: "p95 above 500 ms", variant: "warning" },
          },
          {
            label: "Danger",
            toast: { title: "Scrape failed", description: "Connection refused", variant: "danger" },
          },
        ]}
      />
    </ToastProvider>
  ),
};

export const WithAction: Story = {
  render: (args) => (
    <ToastProvider {...args}>
      <Demo
        toasts={[
          {
            label: "Remove service",
            toast: { title: "Service removed", action: { label: "Undo", onClick: () => {} } },
          },
        ]}
      />
    </ToastProvider>
  ),
};

const renderPersistent: Story["render"] = (args) => (
  <ToastProvider {...args}>
    <Demo
      toasts={[
        {
          label: "Show persistent",
          toast: { title: "Postgres unreachable", variant: "danger", duration: null },
        },
      ]}
    />
  </ToastProvider>
);

export const Persistent: Story = {
  render: renderPersistent,
};

export const LongContent: Story = {
  render: (args) => (
    <ToastProvider {...args}>
      <Demo
        toasts={[
          {
            label: "Show long",
            toast: {
              title: "Alert rule triggered for payments-gateway-eu-west-1",
              description:
                "Error rate has been above 5% for the last 10 minutes across 3 consecutive windows.",
              variant: "warning",
            },
          },
        ]}
      />
    </ToastProvider>
  ),
};

export const AnnouncesAndDismisses: Story = {
  render: renderPersistent,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Show persistent" }));
    const alert = await screen.findByRole("alert");
    await expect(within(alert).getByText("Postgres unreachable")).toBeInTheDocument();
    await userEvent.tab();
    await userEvent.keyboard("{Escape}");
    await expect(within(alert).queryByText("Postgres unreachable")).toBeNull();
  },
};
