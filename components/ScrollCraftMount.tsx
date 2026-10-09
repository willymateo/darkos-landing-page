"use client";

import Script from "next/script";
import { useEffect } from "react";
import { seam } from "@/lib/seam";

type Instance = { destroy(): void };
declare global {
  interface Window {
    ScrollCraft?: { mount(root: Element): Instance; instances: Instance[] };
  }
}

// The engine is a plain script that reads data-sc-* off the rendered markup.
// It mounts once React has hydrated, and tears down if the page unmounts.
export default function ScrollCraftMount() {
  useEffect(() => {
    seam.start();
    return () => {
      window.ScrollCraft?.instances.slice().forEach((i) => i.destroy());
    };
  }, []);

  return (
    <Script
      src="/scrollcraft.js"
      strategy="afterInteractive"
      onReady={() => {
        if (window.ScrollCraft && !window.ScrollCraft.instances.length) window.ScrollCraft.mount(document.body);
      }}
    />
  );
}
