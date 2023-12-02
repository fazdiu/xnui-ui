import nuiUI from "nui-ui/tailwindcss";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html"],
  theme: {
    extend: {},
  },
  plugins: [nuiUI()],
};
