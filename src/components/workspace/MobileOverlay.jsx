import React from "react";
import { Icons } from "../icons/PdfinIcons.jsx";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function useBodyScrollLock(active) {
  React.useEffect(() => {
    if (!active || typeof document === "undefined") return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}

function useFocusTrap(active, containerRef, onClose) {
  const lastFocusedRef = React.useRef(null);

  React.useEffect(() => {
    if (!active || typeof document === "undefined") return undefined;
    lastFocusedRef.current = document.activeElement;
    const container = containerRef.current;
    const focusables = container ? [...container.querySelectorAll(FOCUSABLE_SELECTOR)] : [];
    (focusables[0] || container)?.focus?.();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose && onClose();
        return;
      }
      if (event.key !== "Tab" || !container) return;
      const items = [...container.querySelectorAll(FOCUSABLE_SELECTOR)]
        .filter((item) => item.offsetParent !== null || item === document.activeElement);
      if (!items.length) {
        event.preventDefault();
        container.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      lastFocusedRef.current?.focus?.();
    };
  }, [active, containerRef, onClose]);
}

export function MobileDrawer({ open, title, children, onClose, side = "right" }) {
  const panelRef = React.useRef(null);
  useBodyScrollLock(open);
  useFocusTrap(open, panelRef, onClose);

  if (!open) return null;
  const fromRight = side === "right";
  return (
    <div
      className="mobile-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose && onClose();
      }}
    >
      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={fromRight ? "mobile-drawer mobile-drawer--right" : "mobile-drawer"}
      >
        <div className="mobile-overlay__header">
          <h2>{title}</h2>
          <button type="button" className="mobile-icon-button" aria-label="Tutup" onClick={onClose}>
            {Icons.x(18)}
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function MobileBottomSheet({ open, title, children, onClose }) {
  const panelRef = React.useRef(null);
  useBodyScrollLock(open);
  useFocusTrap(open, panelRef, onClose);

  if (!open) return null;
  return (
    <div
      className="mobile-overlay mobile-overlay--sheet"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose && onClose();
      }}
    >
      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="mobile-bottom-sheet"
      >
        <span className="mobile-bottom-sheet__handle" aria-hidden="true"></span>
        <div className="mobile-overlay__header">
          <h2>{title}</h2>
          <button type="button" className="mobile-icon-button" aria-label="Tutup" onClick={onClose}>
            {Icons.x(18)}
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
