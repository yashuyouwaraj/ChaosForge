"use client";

import { cloneElement, isValidElement, useEffect, useRef, useState } from "react";

export default function ChartFrame({ children, height = 300 }) {
  const frameRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return undefined;
    }

    const updateSize = () => {
      setWidth(Math.floor(frame.getBoundingClientRect().width));
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(frame);

    return () => observer.disconnect();
  }, [height]);

  return (
    <div
      ref={frameRef}
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        height,
        minWidth: 0,
        minHeight: height,
      }}
    >
      {width > 0 && height > 0 && isValidElement(children)
        ? cloneElement(children, { width, height })
        : null}
    </div>
  );
}
