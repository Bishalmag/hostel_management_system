/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./views/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your theme colors
        'neutral-primary': '#ffffff',
        'neutral-secondary-soft': '#f3f4f6',
        'neutral-tertiary': '#e5e7eb',
        'neutral-tertiary-medium': '#d1d5db',
        'neutral-primary-medium': '#f9fafb',
        'heading': '#111827',
        'body': '#6b7280',
        'brand': '#3b82f6',
        'fg-brand': '#2563eb',
        'default': '#e5e7eb',
        'default-medium': '#d1d5db',
      },
      borderRadius: {
        'base': '0.5rem',
      },
      borderWidth: {
        'default': '1px',
      }
    },
  },
  plugins: [],
}