/**
 * MobileNav — hamburger button + full-screen overlay menu for small screens.
 *
 * Hydrated as an island because it owns interactive state (open/closed),
 * focus + scroll locking, and AnimatePresence/stagger animations CSS can't
 * cleanly express. Desktop nav links are static HTML in Nav.astro.
 */
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react';
import { useEffect, useRef } from 'preact/hooks';
import { navLinks, CONTACT_ANCHOR } from '../../lib/content';
import {isMobileMenuOpen} from "../../lib/stores.ts";
import {useStore} from "@nanostores/preact";

export default function MobileNav() {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const $isMobileMenuOpen = useStore(isMobileMenuOpen);

  // Lock background scroll, move focus into the menu, and allow Escape to close.
  useEffect(() => {
    if (!$isMobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && isMobileMenuOpen.set(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [$isMobileMenuOpen]);

  // Panel orchestrates the children: fade the overlay in, then stagger items.
  const panel: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.25, when: 'beforeChildren', delayChildren: 0.12, staggerChildren: 0.07 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2, when: 'afterChildren', staggerChildren: 0.04, staggerDirection: -1 },
    },
  };

  // Each nav item rises + fades; y is dropped for reduced-motion users.
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 28 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 32 } },
    exit: { opacity: 0, y: reduce ? 0 : 12, transition: { duration: 0.15 } },
  };

  return (
    <>


      <AnimatePresence>
        {$isMobileMenuOpen && (
          <motion.div
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            class="fixed inset-0 z-50 h-full flex flex-col overflow-hidden bg-bg px-6 py-5 md:hidden"
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Decorative brand shapes (aria-hidden). */}
            <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
              <div class="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/10 blur-2xl"></div>
              <div class="absolute -bottom-20 -left-12 h-64 w-64 rounded-full bg-secondary/15 blur-2xl"></div>
            </div>

            {/* Top bar */}
            <div class="relative flex items-center justify-between">
              <span class="font-display text-lg font-semibold tracking-tight">
                MainStreet<span class="text-accent">Lander</span>
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={() => isMobileMenuOpen.set(!$isMobileMenuOpen)}
                aria-label="Close menu"
                class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </button>
            </div>

            {/* Big staggered nav links */}
            <nav class="relative flex flex-1 flex-col justify-center gap-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => isMobileMenuOpen.set(!$isMobileMenuOpen)}
                  variants={item}
                  class={`group relative flex items-baseline gap-4 py-2 font-display text-5xl sm:text-7xl font-semibold tracking-tight text-ink
                    after:absolute after:left-0 after:bottom-2 after:-z-10 after:h-[0.4em] after:w-full after:rounded-sm after:bg-accent/30
                    after:origin-left after:scale-x-0 after:-rotate-1 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)]
                    hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:after:transition-none`}
                >
                  <span class="font-body text-sm font-normal text-muted tabular-nums transition-colors group-hover:text-accent">
                    0{i + 1}
                  </span>
                  {link.label}
                </motion.a>
              ))}
            </nav>

            {/* CTA + contact, last in the stagger */}
            <motion.div variants={item} class="relative flex flex-col gap-4">
              <a
                href={CONTACT_ANCHOR}
                onClick={() => isMobileMenuOpen.set(false)}
                class="inline-flex items-center justify-center rounded-full bg-accent px-6 py-4 text-lg font-medium text-white transition-colors hover:bg-accent-deep"
              >
                Get Started
              </a>
              <p class="text-center text-sm text-muted">Doylestown &amp; Bucks County · Sites live in a day</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
