"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-end overflow-hidden w-full z-10",
        className
      )}
    >
      {/* Lamp glow layer */}
      <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0">
        {/* Left conic beam */}
        <motion.div
          initial={{ opacity: 0.5, width: "10rem" }}
          whileInView={{ opacity: 1, width: "22rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto right-1/2 h-40 overflow-visible w-[22rem] bg-gradient-conic from-green-500 via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute w-full left-0 bg-transparent h-32 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute w-32 h-full left-0 bg-transparent bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>

        {/* Right conic beam */}
        <motion.div
          initial={{ opacity: 0.5, width: "10rem" }}
          whileInView={{ opacity: 1, width: "22rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto left-1/2 h-40 w-[22rem] bg-gradient-conic from-transparent via-transparent to-green-500 text-white [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute w-32 h-full right-0 bg-transparent bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute w-full right-0 bg-transparent h-32 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>

        {/* Center green glow blob */}
        <div className="absolute inset-auto z-50 h-28 w-[22rem] -translate-y-1/2 rounded-full bg-green-500 opacity-30 blur-3xl" />

        {/* Bright center beam */}
        <motion.div
          initial={{ width: "6rem" }}
          whileInView={{ width: "12rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-auto z-30 h-28 w-48 -translate-y-[4rem] rounded-full bg-green-400 blur-2xl opacity-70"
        />

        {/* Thin bright line */}
        <motion.div
          initial={{ width: "10rem" }}
          whileInView={{ width: "22rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-auto z-50 h-0.5 w-[22rem] -translate-y-[5rem] bg-green-400"
        />
      </div>

      {/* Content slot */}
      <div className="relative z-50 flex flex-col items-center -translate-y-6 px-5 w-full">
        {children}
      </div>
    </div>
  );
};
