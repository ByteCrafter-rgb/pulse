import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during server rendering and hydration, true afterwards. Portals need `document`. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
