import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
 theme: {
    extend: {
    //   fontFamily: {
    //     arabic: ['var(--font-tajawal)'],
    //   },
    },
  },
  plugins: [],
};

export default config;
