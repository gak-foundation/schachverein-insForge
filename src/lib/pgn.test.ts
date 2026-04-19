import { describe, it, expect } from "vitest";
import { parsePgn, extractEcoFromPgn, splitPgnGames } from "./pgn";

describe("pgn utils", () => {
  const samplePgn = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2023.10.12"]
[Round "?"]
[White "Player1"]
[Black "Player2"]
[Result "1-0"]
[ECO "C00"]

1. e4 e6 2. d4 d5 3. Be3 dxe4 4. Nd2 Nf6 5. f3 exf3 6. Ngxf3 Be7 7. Bd3 O-O 8. O-O
b6 9. Qe1 Bb7 10. Qh4 Nbd7 11. Ne5 g6 12. Bh6 Nxe5 13. dxe5 Nd7 14. Qf4 Nc5 15.
Bxf8 Qxf8 16. Be4 Nxe4 17. Nxe4 Bxe4 18. Qxe4 Rd8 19. Rad1 Bc5+ 20. Kh1 a5 21.
c3 Qe7 22. Qf3 Rxd1 23. Rxd1 Kg7 24. Qf4 h6 25. h3 g5 26. Qe4 Qe8 27. b3 Be7 28.
Kh2 Qb5 29. c4 Qc5 30. Rd7 c6 31. Rc7 b5 32. Rxc6 Qa3 33. cxb5 Qxa2 34. b6 Qxb3
35. Qc4 Qe3 36. b7 Qxe5+ 37. g3 Bd6 38. Qc3 Qxc3 39. Rxc3 a4 40. Rc8 a3 41. b8=Q
Bxb8 42. Rxb8 f5 43. Ra8 Kf6 44. Rxa3 h5 45. Kg2 g4 46. h4 1-0`;

  it("should parse a valid PGN", () => {
    const results = parsePgn(samplePgn);
    expect(results.length).toBe(1);
    const result = results[0];
    expect(result.white).toBe("Player1");
    expect(result.result).toBe("1-0");
    expect(result.moves).toBeGreaterThan(0);
  });

  it("should extract ECO code", () => {
    const eco = extractEcoFromPgn(samplePgn);
    expect(eco).toBe("C00");
  });

  it("should split multiple games", () => {
    const multiPgn = samplePgn + "\n\n" + samplePgn;
    const games = splitPgnGames(multiPgn);
    expect(games.length).toBe(2);
  });

  it("should handle invalid PGN gracefully", () => {
    const results = parsePgn("not a pgn");
    expect(results.length).toBe(0);
  });
});
