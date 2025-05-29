// NutriGuide Brand Colors
export const brandColors = {
  // Primary Colors
  softRose: '#F7CAC9',
  charcoalGray: '#4A4A4A', 
  coral: '#F88379',
  sageGreen: '#A8CBB7',
  warmSand: '#F5EBDD',
  
  // Semantic Colors
  primary: '#F88379', // Coral
  secondary: '#A8CBB7', // Sage Green
  accent: '#F7CAC9', // Soft Rose
  background: '#F5EBDD', // Warm Sand
  text: '#4A4A4A', // Charcoal Gray
  
  // State Colors
  success: '#A8CBB7', // Sage Green for success states
  warning: '#F88379', // Coral for warning states
  error: '#F88379', // Coral for error states
  info: '#A8CBB7', // Sage Green for info states
  
  // PWA Specific
  pwa: {
    background: '#F5EBDD', // Warm Sand
    theme: '#F88379', // Coral
    loading: '#F88379', // Coral
    installer: {
      background: '#F5EBDD', // Warm Sand
      border: '#F7CAC9', // Soft Rose
      button: '#F88379', // Coral
      buttonSecondary: '#A8CBB7', // Sage Green
    },
    offline: {
      online: '#A8CBB7', // Sage Green
      offline: '#F88379', // Coral
    }
  }
} as const

// CSS Custom Properties for Tailwind
export const brandColorsCss = {
  '--color-soft-rose': '#F7CAC9',
  '--color-charcoal-gray': '#4A4A4A',
  '--color-coral': '#F88379',
  '--color-sage-green': '#A8CBB7',
  '--color-warm-sand': '#F5EBDD',
} as const

// Tailwind Color Classes
export const brandColorClasses = {
  softRose: 'text-[#F7CAC9] bg-[#F7CAC9] border-[#F7CAC9]',
  charcoalGray: 'text-[#4A4A4A] bg-[#4A4A4A] border-[#4A4A4A]',
  coral: 'text-[#F88379] bg-[#F88379] border-[#F88379]',
  sageGreen: 'text-[#A8CBB7] bg-[#A8CBB7] border-[#A8CBB7]',
  warmSand: 'text-[#F5EBDD] bg-[#F5EBDD] border-[#F5EBDD]',
} as const 