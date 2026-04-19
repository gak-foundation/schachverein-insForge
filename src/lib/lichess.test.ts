import { describe, it, expect } from "vitest";
import { getBestLichessRating, LichessProfile } from "./lichess";

describe("lichess utils", () => {
  it("should return the highest rating among blitz, rapid, and classical", () => {
    const profile: LichessProfile = {
      username: "testuser",
      id: "testuser",
      perfs: {
        blitz: { rating: 1500 },
        rapid: { rating: 1600 },
        classical: { rating: 1400 },
      },
    };

    expect(getBestLichessRating(profile)).toBe(1600);
  });

  it("should handle missing ratings", () => {
    const profile: LichessProfile = {
      username: "testuser",
      id: "testuser",
      perfs: {
        blitz: { rating: 1500 },
      },
    };

    expect(getBestLichessRating(profile)).toBe(1500);
  });

  it("should return null if no ratings are available", () => {
    const profile: LichessProfile = {
      username: "testuser",
      id: "testuser",
      perfs: {},
    };

    expect(getBestLichessRating(profile)).toBe(null);
  });
});
