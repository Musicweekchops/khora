/**
 * Design Tokens - Apple-Inspired Design System
 * 
 * Sistema de diseño consistente para toda la aplicación.
 * Basado en principios de diseño de Apple: simplicidad, claridad, profundidad.
 */

export const designTokens = {
  // ============================================
  // COLORES
  // ============================================
  colors: {
    // Primary (Blue)
    primary: {
      50: '#E5F1FF',
      100: '#CCE3FF',
      200: '#99C7FF',
      300: '#66ABFF',
      400: '#338FFF',
      500: '#007AFF', // Main
      600: '#0062CC',
      700: '#004999',
      800: '#003166',
      900: '#001933',
    },
    
    // Success (Green)
    success: {
      50: '#E8F8EC',
      100: '#D1F1D9',
      200: '#A3E3B3',
      300: '#75D58D',
      400: '#47C767',
      500: '#34C759', // Main
      600: '#2A9F47',
      700: '#1F7735',
      800: '#155023',
      900: '#0A2811',
    },
    
    // Warning (Orange)
    warning: {
      50: '#FFF4E5',
      100: '#FFE9CC',
      200: '#FFD399',
      300: '#FFBD66',
      400: '#FFA733',
      500: '#FF9500', // Main
      600: '#CC7700',
      700: '#995900',
      800: '#663B00',
      900: '#331E00',
    },
    
    // Destructive (Red)
    destructive: {
      50: '#FFE8E6',
      100: '#FFD1CD',
      200: '#FFA39B',
      300: '#FF7569',
      400: '#FF4737',
      500: '#FF3B30', // Main
      600: '#CC2F26',
      700: '#99231D',
      800: '#661713',
      900: '#330C0A',
    },
    
    // Neutrals (Gray Scale)
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
  },
  
  // ============================================
  // TIPOGRAFÍA
  // ============================================
  typography: {
    fontFamily: {
      sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'system-ui', 'sans-serif'],
      mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Courier New', 'monospace'],
    },
    
    fontSize: {
      xs: ['12px', { lineHeight: '16px', letterSpacing: '0' }],
      sm: ['14px', { lineHeight: '20px', letterSpacing: '0' }],
      base: ['16px', { lineHeight: '24px', letterSpacing: '0' }],
      lg: ['18px', { lineHeight: '28px', letterSpacing: '0' }],
      xl: ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
      '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
      '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
      '4xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
      '5xl': ['48px', { lineHeight: '1', letterSpacing: '-0.03em' }],
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // ============================================
  // ESPACIADO (Escala 4px)
  // ============================================
  spacing: {
    0: '0',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  },
  
  // ============================================
  // BORDER RADIUS
  // ============================================
  borderRadius: {
    none: '0',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },
  
  // ============================================
  // SHADOWS (Elevación)
  // ============================================
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
  
  // ============================================
  // ANIMACIONES
  // ============================================
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    
    easing: {
      ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy
    },
  },
  
  // ============================================
  // Z-INDEX
  // ============================================
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },
} as const

export type DesignTokens = typeof designTokens
