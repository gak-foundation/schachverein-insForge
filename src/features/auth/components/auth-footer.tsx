"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface AuthFooterProps {
  backLink?: {
    label: string;
    href: string;
  };
  links?: FooterLink[];
  className?: string;
}

export function AuthFooter({
  backLink,
  links,
  className,
}: AuthFooterProps) {
  const defaultLinks: FooterLink[] = [
    { label: "Hilfe", href: "/help" },
    { label: "Datenschutz", href: "/privacy" },
    { label: "Impressum", href: "/imprint" },
  ];

  const footerLinks = links ?? defaultLinks;

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className={cn(
        "flex flex-col items-center gap-6",
        "pt-6 border-t border-white/10",
        className
      )}
    >
      {/* Back to home link */}
      {backLink && (
        <motion.div
          whileHover={{ x: -4 }}
          transition={{ duration: 0.15 }}
        >
          <Link
            href={backLink.href}
            className={cn(
              "group flex items-center gap-2",
              "text-sm text-slate-400",
              "hover:text-white",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:rounded-lg focus-visible:px-2"
            )}
          >
            <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            {backLink.label}
          </Link>
        </motion.div>
      )}

      {/* Links */}
      {footerLinks.length > 0 && (
        <nav aria-label="Footer Navigation">
          <ul className="flex flex-wrap items-center justify-center gap-4">
            {footerLinks.map((link, index) => (
              <motion.li
                key={link.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "text-xs text-slate-500",
                      "hover:text-slate-300",
                      "underline-offset-2 hover:underline",
                      "transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:rounded focus-visible:px-1"
                    )}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className={cn(
                      "text-xs text-slate-500",
                      "hover:text-slate-300",
                      "underline-offset-2 hover:underline",
                      "transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:rounded focus-visible:px-1"
                    )}
                  >
                    {link.label}
                  </Link>
                )}
              </motion.li>
            ))}
          </ul>
        </nav>
      )}

      {/* Copyright */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-slate-600"
      >
        &copy; {new Date().getFullYear()} Schachverein
      </motion.p>
    </motion.footer>
  );
}
