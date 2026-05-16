declare namespace React {
  type ReactNode = any;
  type ChangeEvent<T = Element> = any;
  type KeyboardEvent<T = Element> = any;
}

declare module 'react' {
  export type ReactNode = React.ReactNode;
  export function useState<S>(initialState: S | (() => S)):
    [S, (value: S | ((prev: S) => S)) => void];
  export function useRef<T>(initial: T | null): { current: T | null };
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export const StrictMode: any;
  const React: any;
  export default React;
}

declare module 'react-dom/client' {
  export function createRoot(el: any): { render(node: any): void };
}
declare module 'react/jsx-runtime';
declare module '@tailwindcss/vite';
declare module '@vitejs/plugin-react';
declare module 'vite';
declare module 'motion/react';
declare module 'motion';
declare module 'lucide-react';
declare module '*.css';
declare module '*.md?raw';

// Removed explicit `process` and `__dirname` declarations to avoid
// conflicts with existing Node/TypeScript lib typings.

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
