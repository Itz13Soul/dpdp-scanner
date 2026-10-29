"use client";

import dynamic from "next/dynamic";

const RadarScene = dynamic(() => import("./RadarScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-white/5" />,
});

export default function RadarLoader(props: { nodes: { category: string }[] }) {
  return <RadarScene {...props} />;
}
