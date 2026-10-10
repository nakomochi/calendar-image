import { MediaQuery } from 'svelte/reactivity';

// Matches Tailwind's `md` breakpoint. Below it the editor uses the mobile layout.
export const desktop = new MediaQuery('(min-width: 768px)');
