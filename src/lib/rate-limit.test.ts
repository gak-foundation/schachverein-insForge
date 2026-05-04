import { describe, it, expect, vi } from "vitest";
import { checkRateLimit, getClientIP, enforceRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  it("sollte ersten Request erlauben", () => {
    const result = checkRateLimit("t1-ip", 5, 60000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("sollte mehrere Requests innerhalb des Limits erlauben", () => {
    const r1 = checkRateLimit("t2-ip", 3, 60000);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit("t2-ip", 3, 60000);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit("t2-ip", 3, 60000);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("sollte Requests über dem Limit blockieren", () => {
    checkRateLimit("t3-ip", 2, 60000);
    checkRateLimit("t3-ip", 2, 60000);
    const result = checkRateLimit("t3-ip", 2, 60000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("sollte nach Ablauf des Fensters zurücksetzen", () => {
    vi.useFakeTimers();
    checkRateLimit("t4-ip", 2, 60000);
    checkRateLimit("t4-ip", 2, 60000);
    vi.advanceTimersByTime(60001);
    const result = checkRateLimit("t4-ip", 2, 60000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(1);
    vi.useRealTimers();
  });

  it("sollte verschiedene IPs unabhängig behandeln", () => {
    checkRateLimit("t5a-ip", 1, 60000);
    checkRateLimit("t5a-ip", 1, 60000);
    const result = checkRateLimit("t5b-ip", 1, 60000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("sollte mit Standardwerten funktionieren", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("t6-ip");
    }
    const result = checkRateLimit("t6-ip");
    expect(result.success).toBe(false);
  });
});

describe("getClientIP", () => {
  it("sollte IP aus X-Forwarded-For extrahieren", () => {
    const r = new Request("http://localhost", { headers: { "x-forwarded-for": "192.168.1.1, 10.0.0.1" } });
    expect(getClientIP(r)).toBe("192.168.1.1");
  });

  it("sollte mit 'unknown-' beginnen ohne Header zurückgeben", () => {
    const ip = getClientIP(new Request("http://localhost"));
    expect(ip).toMatch(/^unknown-[a-z0-9]{8}$/);
  });

  it("sollte einzelne IP erkennen", () => {
    const r = new Request("http://localhost", { headers: { "x-forwarded-for": "10.0.0.1" } });
    expect(getClientIP(r)).toBe("10.0.0.1");
  });
});

describe("enforceRateLimit", () => {
  it("sollte innerhalb des Limits nichts werfen", () => {
    const r = new Request("http://localhost", { headers: { "x-forwarded-for": "e1" } });
    expect(() => enforceRateLimit(r, 5, 60000)).not.toThrow();
  });

  it("sollte bei Überschreitung werfen", () => {
    const r = new Request("http://localhost", { headers: { "x-forwarded-for": "e2" } });
    enforceRateLimit(r, 1, 60000);
    expect(() => enforceRateLimit(r, 1, 60000)).toThrow();
    expect(() => enforceRateLimit(r, 1, 60000)).toThrow(/zu viele anfragen/i);
  });

  it("sollte Status 429 im Error setzen", () => {
    const r = new Request("http://localhost", { headers: { "x-forwarded-for": "e3" } });
    enforceRateLimit(r, 1, 60000);
    try { enforceRateLimit(r, 1, 60000); }
    catch (e: unknown) { expect((e as Error & { status?: number }).status).toBe(429); }
  });
});
