"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showStrength?: boolean;
  showRequirements?: boolean;
  className?: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  { label: "Mindestens 8 Zeichen", test: (p) => p.length >= 8 },
  { label: "Großbuchstabe (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "Kleinbuchstabe (a-z)", test: (p) => /[a-z]/.test(p) },
  { label: "Zahl (0-9)", test: (p) => /[0-9]/.test(p) },
  { label: "Sonderzeichen (!@#$...)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function calculateStrength(password: string): number {
  if (!password) return 0;
  const passed = requirements.filter((r) => r.test(password)).length;
  return (passed / requirements.length) * 100;
}

function getStrengthColor(strength: number): string {
  if (strength < 40) return "bg-red-500";
  if (strength < 60) return "bg-orange-500";
  if (strength < 80) return "bg-yellow-500";
  return "bg-green-500";
}

function getStrengthLabel(strength: number): string {
  if (strength < 40) return "Schwach";
  if (strength < 60) return "Mittel";
  if (strength < 80) return "Gut";
  return "Stark";
}

export function PasswordInput({
  id = "password",
  name = "password",
  value,
  onChange,
  placeholder = "••••••••",
  disabled = false,
  showStrength = true,
  showRequirements = true,
  className,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const strength = useMemo(() => calculateStrength(value), [value]);
  const strengthColor = getStrengthColor(strength);
  const strengthLabel = getStrengthLabel(strength);

  const toggleVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Input wrapper */}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Passwort"
          aria-describedby={showRequirements ? "password-requirements" : undefined}
          className={cn(
            "h-11 w-full rounded-xl border bg-white/5 px-4 pr-12 text-sm text-white",
            "placeholder:text-slate-500",
            "focus:border-white/30 focus:bg-white/[0.07] focus:outline-none focus:ring-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-200",
            isFocused ? "border-white/30" : "border-white/10"
          )}
        />

        {/* Toggle visibility button */}
        <button
          type="button"
          onClick={toggleVisibility}
          disabled={disabled}
          tabIndex={-1}
          aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2",
            "p-1.5 rounded-lg",
            "text-slate-400 hover:text-white",
            "hover:bg-white/10",
            "transition-colors duration-150",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={showPassword ? "eye" : "eye-off"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              {showPassword ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>

      {/* Strength indicator */}
      {showStrength && value && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Passwortstärke</span>
            <span
              className={cn(
                "font-medium",
                strength < 40 && "text-red-400",
                strength >= 40 && strength < 60 && "text-orange-400",
                strength >= 60 && strength < 80 && "text-yellow-400",
                strength >= 80 && "text-green-400"
              )}
            >
              {strengthLabel}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
            <motion.div
              className={cn("h-full rounded-full", strengthColor)}
              initial={{ width: 0 }}
              animate={{ width: `${strength}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}

      {/* Requirements checklist */}
      {showRequirements && (
        <motion.div
          id="password-requirements"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-1.5"
        >
          <p className="text-xs text-slate-500">Anforderungen:</p>
          <ul className="space-y-1">
            {requirements.map((req, index) => {
              const isMet = req.test(value);
              return (
                <motion.li
                  key={req.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-center gap-2 text-xs transition-colors duration-200",
                    isMet ? "text-green-400" : "text-slate-500"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full transition-colors duration-200",
                      isMet ? "bg-green-500/20" : "bg-slate-700"
                    )}
                  >
                    {isMet ? (
                      <Check className="h-2.5 w-2.5" />
                    ) : (
                      <X className="h-2.5 w-2.5" />
                    )}
                  </span>
                  {req.label}
                </motion.li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
