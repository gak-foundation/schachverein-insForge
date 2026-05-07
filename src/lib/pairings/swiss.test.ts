import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({
  exec: vi.fn(),
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  readFile: vi.fn(),
  rm: vi.fn(),
  parseTRF: vi.fn(),
}));

vi.mock("child_process", () => ({
  exec: (...args: any[]) => mocks.exec(...args),
}));

vi.mock("fs/promises", () => ({
  mkdir: (...args: any[]) => mocks.mkdir(...args),
  writeFile: (...args: any[]) => mocks.writeFile(...args),
  readFile: (...args: any[]) => mocks.readFile(...args),
  rm: (...args: any[]) => mocks.rm(...args),
}));

vi.mock("@/lib/trf/parser", () => ({
  parseTRF: (...args: any[]) => mocks.parseTRF(...args),
}));

vi.mock("util", () => ({
  promisify: (fn: any) => fn,
}));

// Must import AFTER mocks
import { generateSwissPairings, type SwissPairingOptions } from "./swiss";

describe("generateSwissPairings", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.USE_DOCKER_PAIRINGS;
  });

  afterEach(() => {
    delete process.env.USE_DOCKER_PAIRINGS;
  });

  const baseOptions: SwissPairingOptions = {
    system: "dutch",
    round: 3,
  };

  function setupSuccessMocks(games: any[] = []) {
    mocks.exec.mockResolvedValue({ stdout: "", stderr: "" });
    mocks.readFile.mockResolvedValue("dummy trf output");
    mocks.parseTRF.mockReturnValue({
      tournament: { name: "Test", numberOfRounds: 5 },
      players: [],
      games,
    });
  }

  it("sollte erfolgreich Paarungen für die angegebene Runde generieren", async () => {
    setupSuccessMocks([
      { round: 3, whiteId: "1", blackId: "2", result: null },
      { round: 3, whiteId: "3", blackId: "4", result: null },
    ]);

    const result = await generateSwissPairings("trf content", baseOptions);

    expect(result.success).toBe(true);
    expect(result.pairings).toHaveLength(2);
    expect(result.pairings).toEqual([
      { whiteId: "1", blackId: "2", board: 1 },
      { whiteId: "3", blackId: "4", board: 2 },
    ]);
    expect(result.trfOutput).toBe("dummy trf output");
  });

  it("sollte nur Paarungen für die angeforderte Runde zurückgeben", async () => {
    setupSuccessMocks([
      { round: 1, whiteId: "1", blackId: "2", result: null },
      { round: 2, whiteId: "3", blackId: "4", result: null },
      { round: 3, whiteId: "5", blackId: "6", result: null },
    ]);

    const result = await generateSwissPairings("trf", { system: "dutch", round: 2 });

    expect(result.success).toBe(true);
    expect(result.pairings).toHaveLength(1);
    expect(result.pairings![0]).toEqual({ whiteId: "3", blackId: "4", board: 1 });
  });

  it("sollte leere Paarungen zurückgeben wenn keine Spiele für die Runde existieren", async () => {
    setupSuccessMocks([{ round: 1, whiteId: "1", blackId: "2", result: null }]);

    const result = await generateSwissPairings("trf", { system: "dutch", round: 5 });

    expect(result.success).toBe(true);
    expect(result.pairings).toEqual([]);
  });

  it("sollte bbpPairings mit korrekten Argumenten aufrufen (dutch)", async () => {
    setupSuccessMocks([]);

    await generateSwissPairings("trf", { system: "dutch", round: 1 });

    expect(mocks.exec).toHaveBeenCalledTimes(1);
    const cmd = mocks.exec.mock.calls[0][0];
    expect(cmd).toMatch(/^bbpPairings --dutch/);
    expect(cmd).toContain("-o");
  });

  it("sollte bbpPairings mit korrekten Argumenten aufrufen (dubov)", async () => {
    setupSuccessMocks([]);

    await generateSwissPairings("trf", { system: "dubov", round: 1 });

    const cmd = mocks.exec.mock.calls[0][0];
    expect(cmd).toMatch(/^bbpPairings --dubov/);
  });

  it("sollte bbpPairings mit korrekten Argumenten aufrufen (lim)", async () => {
    setupSuccessMocks([]);

    await generateSwissPairings("trf", { system: "lim", round: 1 });

    const cmd = mocks.exec.mock.calls[0][0];
    expect(cmd).toMatch(/^bbpPairings --lim/);
  });

  it("sollte -u Flag übergeben wenn allowUnrated true", async () => {
    setupSuccessMocks([]);

    await generateSwissPairings("trf", { system: "dutch", round: 1, allowUnrated: true });

    const cmd = mocks.exec.mock.calls[0][0];
    expect(cmd).toContain(" -u");
  });

  it("sollte -a Flag übergeben wenn accelerate true", async () => {
    setupSuccessMocks([]);

    await generateSwissPairings("trf", { system: "dutch", round: 1, accelerate: true });

    const cmd = mocks.exec.mock.calls[0][0];
    expect(cmd).toContain(" -a");
  });

  it("sollte Docker-Kommando verwenden wenn USE_DOCKER_PAIRINGS=true", async () => {
    process.env.USE_DOCKER_PAIRINGS = "true";
    setupSuccessMocks([]);

    await generateSwissPairings("trf", { system: "dutch", round: 1 });

    const cmd = mocks.exec.mock.calls[0][0];
    expect(cmd).toContain("docker compose");
    expect(cmd).toContain("bbpPairings --dutch");
  });

  it("sollte Fehler zurückgeben wenn bbpPairings fehlschlägt", async () => {
    mocks.exec.mockRejectedValue(new Error("Command not found"));

    const result = await generateSwissPairings("trf", baseOptions);

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors![0]).toContain("Pairing engine failed");
    expect(result.errors![0]).toContain("Command not found");
  });

  it("sollte Fehler zurückgeben bei unerwartetem Fehler", async () => {
    mocks.mkdir.mockRejectedValue(new Error("Disk full"));

    const result = await generateSwissPairings("trf", baseOptions);

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors![0]).toBe("Disk full");
  });

  it("sollte temporäre Dateien schreiben und aufräumen", async () => {
    setupSuccessMocks([]);

    await generateSwissPairings("my trf content", baseOptions);

    expect(mocks.writeFile).toHaveBeenCalledTimes(1);
    expect(mocks.writeFile).toHaveBeenCalledWith(
      expect.stringContaining("input-"),
      "my trf content",
      "utf-8"
    );

    expect(mocks.rm).toHaveBeenCalledTimes(2);
  });

  it("sollte temporäre Dateien aufräumen auch bei bbpPairings-Fehler", async () => {
    mocks.exec.mockRejectedValue(new Error("fail"));

    await generateSwissPairings("trf", baseOptions);

    expect(mocks.rm).toHaveBeenCalledTimes(2);
  });

  it("sollte das Verzeichnis rekursiv erstellen", async () => {
    setupSuccessMocks([]);

    await generateSwissPairings("trf", baseOptions);

    expect(mocks.mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it("sollte den Timeout von 30 Sekunden setzen", async () => {
    setupSuccessMocks([]);

    await generateSwissPairings("trf", baseOptions);

    expect(mocks.exec).toHaveBeenCalledWith(expect.any(String), { timeout: 30000 });
  });
});
