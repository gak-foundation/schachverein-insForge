export interface TournamentTemplate {
  id: string;
  name: string;
  type: string;
  numberOfRounds: number;
  timeControl: string;
  description: string;
}

export const TOURNAMENT_TEMPLATES: TournamentTemplate[] = [
  {
    id: "vereinsmeisterschaft",
    name: "Vereinsmeisterschaft",
    type: "swiss",
    numberOfRounds: 7,
    timeControl: "90min+30s",
    description: "Jaehrliche Vereinsmeisterschaft im Schweizer System mit 7 Runden.",
  },
  {
    id: "blitz",
    name: "Blitz-Turnier",
    type: "blitz",
    numberOfRounds: 13,
    timeControl: "3min+2s",
    description: "Schnelles Blitzturnier mit 3 Minuten + 2 Sekunden pro Zug.",
  },
  {
    id: "schnellschach",
    name: "Schnellschach-Open",
    type: "rapid",
    numberOfRounds: 5,
    timeControl: "15min+10s",
    description: "Offenes Schnellschachturnier — jeder ist willkommen.",
  },
];
