/**
 * @blackpaw/ui — Tailwind Preset
 *
 * Each app's tailwind.config.js extends this preset:
 *
 *   import blackpawPreset from '@blackpaw/ui/tailwind'
 *   export default { presets: [blackpawPreset], content: [...] }
 *
 * Every color/radius/duration/easing below resolves to a custom property
 * that is actually defined in src/tokens/brand.css — the --bp-*/--color-*
 * canonical layer. (This preset previously pointed at --hk-*/--signal-*/
 * shadcn-style names — --background, --card, --primary, --radius,
 * --duration-base, etc. — that brand.css never defined, so every class
 * below silently rendered with no color/radius/motion. See AGENTS.md.)
 */

export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Urbanist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Urbanist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        urbanist: ['Urbanist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        newsreader: ['Newsreader', 'Georgia', 'serif'],
        manrope: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      fontWeight: {
        // Numeric keys so `font-600` / `font-800` (used by KpiStat's hero/plain
        // variants) generate real classes, alongside the standard names.
        600: '600',
        800: '800',
      },

      colors: {
        /* Hakiqa/Blackpaw brand primaries — raw layer, use sparingly */
        'hk-cyan':   'hsl(var(--bp-cyan)   / <alpha-value>)',
        'hk-teal':   'hsl(var(--bp-teal)   / <alpha-value>)',
        'hk-orange': 'hsl(var(--bp-orange) / <alpha-value>)',
        'hk-navy':   'hsl(var(--bp-navy)   / <alpha-value>)',
        'bp-green':  'hsl(var(--bp-green)  / <alpha-value>)',

        /* Semantic signals — match .status-*/.chip.* in components.css exactly */
        'signal-red':   'hsl(var(--bp-danger)  / <alpha-value>)',
        'signal-amber': 'hsl(var(--bp-warning) / <alpha-value>)',
        'signal-green': 'hsl(var(--bp-success) / <alpha-value>)',
        'signal-blue':  'hsl(var(--bp-info)    / <alpha-value>)',

        /* Radix UI / shadcn-shaped utility names, aliased onto the real
           semantic layer so bg-card / text-foreground / bg-muted etc. (used
           by EmptyState, MetricCard, Skeleton, ViewToggle today) resolve to
           an actual brand color instead of an undefined custom property. */
        background:          'hsl(var(--color-bg)      / <alpha-value>)',
        foreground:          'hsl(var(--color-ink)     / <alpha-value>)',
        card:                'hsl(var(--color-surface) / <alpha-value>)',
        'card-foreground':   'hsl(var(--color-ink)     / <alpha-value>)',
        popover:             'hsl(var(--color-surface) / <alpha-value>)',
        primary:             'hsl(var(--color-accent)  / <alpha-value>)',
        'primary-foreground':'hsl(0 0% 100%            / <alpha-value>)',
        secondary:           'hsl(var(--bp-navy)       / <alpha-value>)',
        'secondary-foreground': 'hsl(0 0% 100%         / <alpha-value>)',
        muted:               'hsl(var(--color-border)  / <alpha-value>)',
        'muted-foreground':  'hsl(var(--color-muted)   / <alpha-value>)',
        accent:              'hsl(var(--color-accent-h)/ <alpha-value>)',
        'accent-foreground': 'hsl(var(--color-ink)     / <alpha-value>)',
        destructive:         'hsl(var(--bp-danger)     / <alpha-value>)',
        'destructive-foreground': 'hsl(0 0% 100%       / <alpha-value>)',
        border:              'hsl(var(--color-border)  / <alpha-value>)',
        input:               'hsl(var(--color-border)  / <alpha-value>)',
        ring:                'hsl(var(--color-accent)  / <alpha-value>)',
      },

      borderRadius: {
        xs:   'var(--bp-radius-xs)',
        sm:   'var(--bp-radius-sm)',
        DEFAULT: 'var(--bp-radius)',
        md:   'var(--bp-radius-md)',
        lg:   'var(--bp-radius-lg)',
        xl:   'var(--bp-radius-xl)',
        pill: 'var(--bp-radius-pill)',
      },

      transitionDuration: {
        fast:  'var(--bp-dur-fast)',
        base:  'var(--bp-dur-base)',
        enter: 'var(--bp-dur-enter)',
        slow:  'var(--bp-dur-slow)',
      },

      transitionTimingFunction: {
        spring: 'var(--bp-ease-spring)',
        'ease-out-smooth': 'var(--bp-ease-out)',
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
        'fade-in': 'fade-in 0.2s var(--bp-ease-out) both',
        'slide-up':'slide-up 0.25s var(--bp-ease-spring) both',
      },
    },
  },

  plugins: [],
}
