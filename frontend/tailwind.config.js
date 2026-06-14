export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#080808",
        canvas: "#ffffff",
        hairline: "#d8d8d8",
        body: "#363636",
        mute: "#898989",
        purple: "#7a3dff",
        pink: "#ed52cb",
        blue: "#3b89ff",
        blueInfo: "#146ef5",
        orange: "#ff6b00",
        green: "#00d722",
        yellow: "#ffae13",
        red: "#ee1d36",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
      },
      fontFamily: {
        sans: ["Inter", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
