"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NeonGradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    borderSize?: number;
    neonColor?: string;
    className?: string;
}

export function NeonGradientCard({
    children,
    borderSize = 2,
    neonColor = "#FFD700",
    className,
    ...props
}: NeonGradientCardProps) {
    return (
        <div
            className={cn("relative overflow-hidden rounded-xl", className)}
            style={{ padding: borderSize }}
            {...props}
        >
            {/* Moving Gradient Layer */}
            <motion.div
                className="absolute inset-[-100%]"
                animate={{
                    rotate: 360,
                }}
                transition={{
                    repeat: Infinity,
                    duration: 4, // 4 seconds for full rotation
                    ease: "linear",
                }}
                style={{
                    background: `conic-gradient(from 90deg at 50% 50%, transparent 0%, transparent 50%, ${neonColor} 100%)`,
                }}
            />

            {/* Inner Content Layer (The Card itself) */}
            <div className="relative z-10 h-full w-full rounded-[inherit] bg-black/90 backdrop-blur-xl">
                {children}
            </div>
        </div>
    );
}
