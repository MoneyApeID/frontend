module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-black': '#050608',
        'brand-charcoal': '#0B0D12',
        'brand-surface': '#11131A',
        'brand-surface-soft': '#1A1D26',
        'brand-gold': '#E8C152',
        'brand-gold-soft': '#F5E4AF',
        'brand-gold-deep': '#B9891F',
        'brand-emerald': '#4CD6C4',
      },
      boxShadow: {
        'brand-glow': '0 0 45px rgba(232, 193, 82, 0.25)',
      },
    },
  },
  plugins: [],
}
