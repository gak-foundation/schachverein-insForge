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
