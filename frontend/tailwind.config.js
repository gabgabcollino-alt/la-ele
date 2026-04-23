/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                tbx: {
                    bg: "#0A0A0A",
                    surface: "#141414",
                    elevated: "#1F1F1F",
                    line: "rgba(255,255,255,0.08)",
                    purple: "#5865F2",
                },
            },
            fontFamily: {
                graffiti: ['"Permanent Marker"', '"Bangers"', "cursive"],
                bangers: ['"Bangers"', "cursive"],
                marker: ['"Permanent Marker"', "cursive"],
                body: ['"Poppins"', "system-ui", "sans-serif"],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
                "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
                "glow-pulse": {
                    "0%,100%": { boxShadow: "0 0 10px rgba(255,255,255,0.05)" },
                    "50%": { boxShadow: "0 0 20px rgba(255,255,255,0.18)" },
                },
                flicker: {
                    "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": { opacity: "0.95" },
                    "20%, 24%, 55%": { opacity: "0.4" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "glow-pulse": "glow-pulse 3s ease-in-out infinite",
                flicker: "flicker 4s linear infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
