export interface LichessProfile {
  username: string;
  perfs: {
    blitz?: { rating: number };
    rapid?: { rating: number };
    classical?: { rating: number };
  };
  id: string;
}

export async function fetchLichessProfile(username: string): Promise<LichessProfile | null> {
  try {
    const response = await fetch(`https://lichess.org/api/user/${username}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Lichess API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching Lichess profile:", error);
    return null;
  }
}

export function getBestLichessRating(profile: LichessProfile): number | null {
  const ratings = [
    profile.perfs.classical?.rating,
    profile.perfs.rapid?.rating,
    profile.perfs.blitz?.rating,
  ].filter((r): r is number => r !== undefined);

  if (ratings.length === 0) return null;
  return Math.max(...ratings);
}

export async function fetchLichessGames(username: string, limit = 10): Promise<any[]> {
  try {
    const response = await fetch(`https://lichess.org/api/games/user/${username}?max=${limit}&opening=true`, {
      headers: {
        Accept: "application/x-ndjson",
      },
    });

    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.statusText}`);
    }

    const text = await response.text();
    if (!text) return [];

    return text
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
  } catch (error) {
    console.error("Error fetching Lichess games:", error);
    return [];
  }
}
