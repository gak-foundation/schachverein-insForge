import { describe, it, expect } from "vitest";
import { calculateAge } from "./utils";

describe("calculateAge", () => {
  it("sollte Alter aus Geburtsdatum berechnen", () => {
    const birthDate = "1990-06-15";
    const age = calculateAge(birthDate);
    expect(age).toBeGreaterThanOrEqual(33);
  });

  it("sollte null für null-Eingabe zurückgeben", () => {
    expect(calculateAge(null)).toBeNull();
  });

  it("sollte Date-Objekt akzeptieren", () => {
    const birthDate = new Date("2000-01-01");
    const age = calculateAge(birthDate);
    expect(age).toBeGreaterThanOrEqual(24);
  });

  it("sollte 0 für heutiges Geburtsdatum zurückgeben", () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    expect(calculateAge(dateStr)).toBe(0);
  });
});
