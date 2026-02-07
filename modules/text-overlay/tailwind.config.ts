import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/editor/**/*.{ts,tsx}", "./editor.html"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
