"use client";

import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number] } },
};

export function HeroSection() {
  return (
    <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-primary/10 rounded-full blur-[120px] opacity-40 motion-reduce:blur-none animate-pulse duration-[10s]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={item} className="mb-6">
            <img
              src="/logo-256.png"
              alt="schach.studio Logo"
              width={128}
              height={128}
              className="mx-auto h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 drop-shadow-xl"
            />
          </motion.div>

          <motion.div variants={item}>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider mb-6 border border-primary/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Sparkles className="h-4 w-4 fill-current animate-pulse" aria-hidden="true" />
              <span>100% Kostenlos für alle Vereine</span>
            </div>
          </motion.div>

          <motion.h1 
            variants={item}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold font-heading mb-6 tracking-tight leading-[1.1] text-foreground"
          >
            Dein Verein. Deine Website. <span className="text-primary italic">Ein</span> System
            <span className="text-accent animate-pulse">.</span>
          </motion.h1>

          <motion.p 
            variants={item}
            className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Die einzige Software, die deine interne Verwaltung automatisch in eine professionelle Website verwandelt. 
            <strong className="text-foreground"> Nie wieder Doppeltpflege.</strong>
          </motion.p>

          <motion.div 
            variants={item}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="/auth/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-16 px-10 text-xl font-bold w-full sm:w-auto gap-2 inline-flex items-center justify-center rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1"
              )}
            >
              Kostenlos starten
              <ArrowRight className="h-6 w-6" aria-hidden="true" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
