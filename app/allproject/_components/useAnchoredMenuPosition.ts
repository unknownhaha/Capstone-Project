import {
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

const MENU_WIDTH = 168;
const MENU_HEIGHT = 152;
const VIEWPORT_PAD = 8;

/** Fixed menu coords from anchor; flips horizontal alignment when it would clip off-screen left. */
export function useAnchoredMenuPosition(
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

      let left = rect.right - MENU_WIDTH;
      if (left < VIEWPORT_PAD) {
        left = rect.left;
      }
      left = Math.max(
        VIEWPORT_PAD,
        Math.min(left, window.innerWidth - MENU_WIDTH - VIEWPORT_PAD)
      );

      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward =
        spaceBelow < MENU_HEIGHT + 8 && rect.top > MENU_HEIGHT;
      let top = openUpward
        ? rect.top - MENU_HEIGHT - 4
        : rect.bottom + 4;
      top = Math.max(
        VIEWPORT_PAD,
        Math.min(top, window.innerHeight - MENU_HEIGHT - VIEWPORT_PAD)
      );

      setStyle({
        position: "fixed",
        top,
        left,
        width: MENU_WIDTH,
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
