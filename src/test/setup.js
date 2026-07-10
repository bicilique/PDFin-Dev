import "@testing-library/jest-dom/vitest";

if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }

    observe(target) {
      this.callback([{ isIntersecting: true, target }]);
    }

    disconnect() {}
  };
}
