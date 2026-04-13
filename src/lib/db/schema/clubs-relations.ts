import { relations } from "drizzle-orm";
import { clubs } from "./clubs";
import { clubMemberships, clubInvitations } from "./members";
import { seasons } from "./seasons";
import { teams } from "./teams";
import { tournaments } from "./tournaments";
import { events } from "./events";
import { documents, newsletters } from "./documents";
import { contributionRates } from "./finance";

export const clubsRelations = relations(clubs, ({ many }) => ({
  memberships: many(clubMemberships),
  seasons: many(seasons),
  teams: many(teams),
  tournaments: many(tournaments),
  events: many(events),
  payments: many(contributionRates),
  documents: many(documents),
  contributionRates: many(contributionRates),
  newsletters: many(newsletters),
  invitations: many(clubInvitations),
}));
