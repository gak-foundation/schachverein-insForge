import { relations } from "drizzle-orm";
import { clubs } from "./clubs";
import { members } from "./members";
import { seasons } from "./seasons";
import { teams, boardOrders, teamMemberships } from "./teams";
import { matches } from "./matches";

export const teamsRelations = relations(teams, ({ one, many }) => ({
  club: one(clubs, {
    fields: [teams.clubId],
    references: [clubs.id],
    relationName: "club_teams",
  }),
  season: one(seasons, {
    fields: [teams.seasonId],
    references: [seasons.id],
  }),
  captain: one(members, {
    fields: [teams.captainId],
    references: [members.id],
  }),
  boardOrders: many(boardOrders),
  teamMemberships: many(teamMemberships),
  homeMatches: many(matches, { relationName: "homeMatches" }),
  awayMatches: many(matches, { relationName: "awayMatches" }),
}));

export const boardOrdersRelations = relations(boardOrders, ({ one }) => ({
  team: one(teams, {
    fields: [boardOrders.teamId],
    references: [teams.id],
  }),
  season: one(seasons, {
    fields: [boardOrders.seasonId],
    references: [seasons.id],
  }),
  member: one(members, {
    fields: [boardOrders.memberId],
    references: [members.id],
  }),
}));

export const teamMembershipsRelations = relations(
  teamMemberships,
  ({ one }) => ({
    team: one(teams, {
      fields: [teamMemberships.teamId],
      references: [teams.id],
    }),
    member: one(members, {
      fields: [teamMemberships.memberId],
      references: [members.id],
    }),
    season: one(seasons, {
      fields: [teamMemberships.seasonId],
      references: [seasons.id],
    }),
  }),
);
