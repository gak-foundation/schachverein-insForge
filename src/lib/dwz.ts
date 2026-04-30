export interface DeWisMember {
  dwz: number;
  dwzId: string;
  name: string;
}

/**
 * Fetches DWZ data from the official DSB (Deutscher Schachbund) DeWIS API in CSV format.
 */
export async function fetchDwzData(dwzId: string): Promise<DeWisMember | null> {
  if (!dwzId || dwzId.length < 5) return null;

  try {
    // DSB DeWIS CSV API URL
    const url = `https://www.schachbund.de/php/dewis/spieler.php?pkz=${dwzId}&format=csv`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "CheckMateManager/1.0 (Club Management Software)",
      },
    });

    if (!response.ok) {
      console.error(`DSB API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const text = await response.text();
    if (!text || text.includes("<html>")) {
      return null;
    }

    // The CSV uses "|" as separator
    // Structure of first row (header): id|nachname|vorname|titel|dwz|dwzindex|fideid|fideelo|fidetitel|fidenation
    const lines = text.split("\n");
    if (lines.length < 2) return null;

    const dataRow = lines[1].split("|");
    if (dataRow.length < 5) return null;

    const lastName = dataRow[1];
    const firstName = dataRow[2];
    const dwzValue = parseInt(dataRow[4], 10);

    if (isNaN(dwzValue)) {
      return null;
    }

    return {
      dwzId,
      dwz: dwzValue,
      name: `${firstName} ${lastName}`.trim(),
    };
  } catch (error) {
    console.error("Error fetching DWZ data:", error);
    return null;
  }
}

/**
 * Fetches all members of a club from DSB DeWIS CSV API.
 * @param zps The 5-digit club ID (e.g., '60101')
 */
export async function fetchClubMembersFromDsb(zps: string) {
  if (!zps || zps.length !== 5) {
    throw new Error("Ungültige ZPS (muss 5-stellig sein)");
  }

  try {
    const url = `https://www.schachbund.de/php/dewis/verein.php?zps=${zps}&format=csv`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "CheckMateManager/1.0 (Club Management Software)",
      },
    });

    if (!response.ok) {
      throw new Error(`DSB API Fehler: ${response.status}`);
    }

    const text = await response.text();
    if (!text || text.includes("<html>")) {
      throw new Error("Keine Daten vom DSB erhalten. Ist die ZPS korrekt?");
    }

    const lines = text.split("\n");
    if (lines.length < 2) return [];

    // Skip header: id|nachname|vorname|titel|dwz|dwzindex|fideid|fideelo|fidetitel|fidenation
    return lines.slice(1)
      .map(line => {
        const columns = line.split("|");
        if (columns.length < 5) return null;
        
        return {
          dwzId: columns[0],
          lastName: columns[1],
          firstName: columns[2],
          dwz: parseInt(columns[4], 10) || null,
          role: "mitglied"
        };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null && m.lastName !== "");
  } catch (error) {
    console.error("Error fetching DSB club members:", error);
    throw error;
  }
}
