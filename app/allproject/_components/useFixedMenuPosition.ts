import {
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

const MENU_ESTIMATE_HEIGHT = 152;

/** Position a dropdown with `position: fixed` so it escapes overflow scroll parents. */
export function useFixedMenuPosition(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>
) {
  const [style, setStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setStyle({});
      return;
    }

    const update = () => {
      const el = anchorRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward =
        spaceBelow < MENU_ESTIMATE_HEIGHT + 8 &&
        rect.top > MENU_ESTIMATE_HEIGHT;
      const top = openUpward
        ? rect.top - MENU_ESTIMATE_HEIGHT - 4
        : rect.bottom + 4;
      const width = Math.max(168, rect.width);
      const left = Math.min(rect.right - width, window.innerWidth - width - 8);
      const clampedLeft = Math.max(8, left);
      const clampedTop = Math.max(8, Math.min(top, window.innerHeight - MENU_ESTIMATE_HEIGHT - 8));

      setStyle({
        position: "fixed",
        top: clampedTop,
        left: clampedLeft,
        width,
        zIndex: 46,
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef]);

  return style;
}
