"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export function useMouseParallax(intensity = 20) {
  const containerRef = useRef(null);
  const layerRefs = useRef([]);

  const registerLayer = useCallback((index) => {
    return (node) => {
      layerRefs.current[index] = node;
    };
  }, []);

  const handleMove = useCallback(
    (event) => {
      if (typeof window === "undefined") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const x = (event.clientX / window.innerWidth - 0.5) * intensity;
      const y = (event.clientY / window.innerHeight - 0.5) * intensity;

      const transforms = [
        `translate(${x * -0.5}px, ${y * -0.5}px)`,
        `translate(${x * 0.4}px, ${y * 0.4}px)`,
        `translate(calc(-50% + ${x * 0.2}px), ${y * 0.2}px)`,
        `translate(${x * 0.08}px, ${y * 0.08}px)`,
      ];

      transforms.forEach((transform, index) => {
        const layer = layerRefs.current[index];
        if (layer) {
          layer.style.transform = transform;
        }
      });
    },
    [intensity],
  );

  return { containerRef, registerLayer, handleMove };
}

export function useVideoVisibility(videoRef) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [videoRef]);
}

export function useAnimatedCounter(target, duration = 1800, active = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return undefined;

    let start = null;
    let frame = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(eased * target));

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target, duration, active]);

  return value;
}
