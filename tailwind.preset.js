/**
 * @blackpaw/ui — Tailwind Preset
 *
 * Each app's tailwind.config.js extends this preset:
 *
 *   import blackpawPreset from '@blackpaw/ui/tailwind'
 *   export default { presets: [blackpawPreset], content: [...] }
 *
 * The preset wires Hakiqa brand tokens into Tailwind's color/font/radius
 * system so you can use classes like bg-hk-navy, text-hk-cyan, etc.
 */

export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Urbanist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Urbanist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      colors: {
        /* Hakiqa brand */
        'hk-cyan':   'hsl(var(--hk-cyan)  / <alpha-value>)',
        'hk-teal':   'hsl(var(--hk-teal)  / <alpha-value>)',
        'hk-orange': 'hsl(var(--hk-orange)/ <alpha-value>)',
        'hk-navy':   'hsl(var(--hk-navy)  / <alpha-value>)',
        'hk-bg':     'hsl(var(--hk-bg)    / <alpha-value>)',

        /* Blackpaw brand */
        'bp-green':  'hsl(var(--bp-green) / <alpha-value>)',
        'bp-light-blue':    'hsl(var(--bp-light-blue) / <alpha-value>)',
        'bp-electric-blue': 'hsl(var(--bp-electric-blue) / <alpha-value>)',
        'bp-purple':        'hsl(var(--bp-purple) / <alpha-value>)',
        'bp-violet':        'hsl(var(--bp-violet) / <alpha-value>)',
        'bp-coral':         'hsl(var(--bp-coral) / <alpha-value>)',
        'bp-coral-rose':    'hsl(var(--bp-coral-rose) / <alpha-value>)',
        'bp-dark-navy':     'hsl(var(--bp-dark-navy) / <alpha-value>)',
        'bp-deep-navy':     'hsl(var(--bp-deep-navy) / <alpha-value>)',
        'bp-offwhite':      'hsl(var(--bp-corporate-offwhite) / <alpha-value>)',

        /* Semantic signals */
        'signal-red':   'hsl(var(--signal-red)   / <alpha-value>)',
        'signal-amber': 'hsl(var(--signal-amber) / <alpha-value>)',
        'signal-green': 'hsl(var(--signal-green) / <alpha-value>)',
        'signal-blue':  'hsl(var(--signal-blue)  / <alpha-value>)',

        /* Radix UI / shadcn compatible tokens */
        background:  'hsl(var(--background)  / <alpha-value>)',
        foreground:  'hsl(var(--foreground)  / <alpha-value>)',
        card:        'hsl(var(--card)         / <alpha-value>)',
        popover:     'hsl(var(--popover)      / <alpha-value>)',
        primary:     'hsl(var(--primary)      / <alpha-value>)',
        secondary:   'hsl(var(--secondary)    / <alpha-value>)',
        muted:       'hsl(var(--muted)        / <alpha-value>)',
        accent:      'hsl(var(--accent)       / <alpha-value>)',
        destructive: 'hsl(var(--destructive)  / <alpha-value>)',
        border:      'hsl(var(--border)       / <alpha-value>)',
        input:       'hsl(var(--input)        / <alpha-value>)',
        ring:        'hsl(var(--ring)         / <alpha-value>)',

        /* Brand-aware semantic aliases */
        'brand-accent': 'hsl(var(--color-accent) / <alpha-value>)',
        'brand-focus':  'hsl(var(--color-accent-h) / <alpha-value>)',
        'brand-hero':   'hsl(var(--color-hero) / <alpha-value>)',
        'brand-ink':    'hsl(var(--color-ink) / <alpha-value>)',
      },

      borderRadius: {
        sm:   'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },

      transitionDuration: {
        fast:  'var(--duration-fast)',
        base:  'var(--duration-base)',
        enter: 'var(--duration-enter)',
        slow:  'var(--duration-slow)',
      },

      transitionTimingFunction: {
        spring: 'var(--ease-spring)',
        'ease-out-smooth': 'var(--ease-out)',
      },

      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },

      animation: {
        shimmer:   'shimmer 1.4s ease-in-out infinite',
        'fade-in': 'fade-in 0.2s var(--ease-out) both',
        'slide-up':'slide-up 0.25s var(--ease-spring) both',
      },
    },
  },

  plugins: [],
}
