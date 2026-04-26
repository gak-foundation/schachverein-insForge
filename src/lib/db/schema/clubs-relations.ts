import { relations } from "drizzle-orm";
import { clubs } from "./clubs";
import { clubAddons } from "./club_addons";
import { clubMemberships, clubInvitations } from "./members";
import { seasons } from "./seasons";
import { teams } from "./teams";
import { tournaments } from "./tournaments";
import { events } from "./events";
import { documents, newsletters } from "./documents";
import { contributionRates, payments, sepaExports } from "./finance";
import { games } from "./tournaments";
import { mediaAssets, pages } from "./cms";

export const clubsRelations = relations(clubs, ({ many }) => ({
  memberships: many(clubMemberships, { relationName: "memberships" }),
  addons: many(clubAddons),
  seasons: many(seasons),
  teams: many(teams, { relationName: "club_teams" }),
  tournaments: many(tournaments),
  events: many(events),
  payments: many(payments),
  contributionRates: many(contributionRates),
  sepaExports: many(sepaExports),
  documents: many(documents),
  newsletters: many(newsletters),
  invitations: many(clubInvitations),
  games: many(games),
  mediaAssets: many(mediaAssets),
  pages: many(pages),
}));
