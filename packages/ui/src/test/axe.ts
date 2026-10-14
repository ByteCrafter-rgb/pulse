import { configureAxe } from "jest-axe";

// jsdom can't compute layout or colors; contrast is checked by the Storybook a11y addon instead.
export const axe = configureAxe({
  rules: {
    "color-contrast": { enabled: false },
  },
});
