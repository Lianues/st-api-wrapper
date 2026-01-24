export {};

// Minimal ambient declarations so TS doesn't fight the runtime environment.
// If you later develop inside the SillyTavern repo, you can replace this with their global typings.

declare global {
  interface Window {
    SillyTavern: any;
    toastr: any;
    ST_API?: any;
  }

  const SillyTavern: any;
  const toastr: any;
}
