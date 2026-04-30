"use client";

import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Sparkles, Lock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import { APP_URL } from "@/lib/urls";

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
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
          >
            <a
              href={`${APP_URL}/auth/signup`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-16 px-10 text-xl font-bold w-full sm:w-auto gap-2 inline-flex items-center justify-center rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1"
              )}
            >
              Kostenlos starten
              <ArrowRight className="h-6 w-6" aria-hidden="true" />
            </a>
          </motion.div>

          <motion.div 
            variants={item}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left"
          >
            {[
              { icon: Zap, title: "All-in-One", desc: "Mitglieder, Turniere, Finanzen und mehr — alles an einem Ort.", highlighted: false },
              { icon: Shield, title: "BFSG 2025", desc: "Barrierefrei nach WCAG 2.2 AA umgesetzt. Bereit für die BFSG.", highlighted: false },
              { icon: Lock, title: "Datenschutz", desc: "DSGVO-konform. Hosting in Deutschland, verschlüsselte Daten.", highlighted: false },
              { icon: Users, title: "Mitglieder", desc: "Einfache Verwaltung eurer Mitglieder und Beitragszahlungen.", highlighted: false },
            ].map((feature) => (
              <div
                key={feature.title}
                className={cn(
                  "flex gap-4 p-5 rounded-2xl bg-card border transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                  feature.highlighted && "border-primary/30 bg-primary/5 ring-1 ring-primary/20 shadow-lg shadow-primary/5"
                )}
              >
                <div className="shrink-0">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-1 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
