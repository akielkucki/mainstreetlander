import {isMobileMenuOpen} from "../../lib/stores.ts";
import {useStore} from "@nanostores/preact";

export default function MobileNavButton() {

    const $isMobileMenuOpen = useStore(isMobileMenuOpen);

    return (
            <button
                type="button"
                onClick={() => isMobileMenuOpen.set(!$isMobileMenuOpen)}
                aria-label="Open menu"
                aria-expanded={$isMobileMenuOpen}
                aria-controls="mobile-drawer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink cursor-pointer md:hidden"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
    );
};

