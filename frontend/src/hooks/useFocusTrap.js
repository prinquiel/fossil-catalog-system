import { useEffect, useRef } from 'react';

/**
 * @param {boolean} active
 */
export function useFocusTrap(active) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active || !containerRef.current) return undefined;

    const root = containerRef.current;
    const getFocusable = () =>
      /** @type {HTMLElement[]} */ (
        Array.from(
          root.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null || root.contains(el))
      );

    const previous = /** @type {HTMLElement | null} */ (document.activeElement);
    const nodes = getFocusable();
    if (nodes.length) nodes[0].focus();

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const list = getFocusable();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [active]);

  return containerRef;
}
