import { useState, useCallback } from "react";

export const useResizable = (initialWidth: number) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        setWidth((prevWidth) => mouseMoveEvent.movementX + prevWidth);
      }
    },
    [isResizing]
  );

  return { width, startResizing, stopResizing, resize };
};
