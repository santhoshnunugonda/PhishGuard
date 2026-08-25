'use client';

import dynamic from "next/dynamic";
import { VisualEditsMessenger } from "orchids-visual-edits";

const GlobalChatbot = dynamic(() => import("@/components/global-chatbot").then(mod => mod.GlobalChatbot), {
  ssr: false,
});

export function GlobalComponents() {
  return (
    <>
      <GlobalChatbot />
      <VisualEditsMessenger />
    </>
  );
}
