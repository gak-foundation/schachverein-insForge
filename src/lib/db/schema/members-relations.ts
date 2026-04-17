import { relations } from "drizzle-orm";
import { members, clubMemberships, clubInvitations } from "./members";
import { teamMemberships } from "./teams";
import { tournamentParticipants, games } from "./tournaments";
import { documents } from "./documents";
import { payments, contributionRates } from "./finance";
import { availability, dwzHistory } from "./members-extended";
import { clubs } from "./clubs";

export const membersRelations = relations(members, ({ many, one }) => ({
  parent: one(members, {
    fields: [members.parentId],
    references: [members.id],
    relationName: "parent",
  }),
  children: many(members, { relationName: "parent" }),
  clubMemberships: many(clubMemberships),
  teamMemberships: many(teamMemberships),
  tournamentParticipations: many(tournamentParticipants),
  gamesAsWhite: many(games, {
    relationName: "white",
  }),
  gamesAsBlack: many(games, {
    relationName: "black",
  }),
  payments: many(payments),
  dwzEntries: many(dwzHistory),
  availabilityEntries: many(availability),
  uploadedDocuments: many(documents),
  contributionRate: one(contributionRates, {
    fields: [members.contributionRateId],
    references: [contributionRates.id],
  }),
}));

export const clubMembershipsRelations = relations(clubMemberships, ({ one }) => ({
  club: one(clubs, {
    fields: [clubMemberships.clubId],
    references: [clubs.id],
    relationName: "memberships",
  }),
  member: one(members, {
    fields: [clubMemberships.memberId],
    references: [members.id],
  }),
  inviter: one(members, {
    fields: [clubMemberships.invitedBy],
    references: [members.id],
  }),
}));

export const clubInvitationsRelations = relations(clubInvitations, ({ one }) => ({
  club: one(clubs, {
    fields: [clubInvitations.clubId],
    references: [clubs.id],
  }),
  inviter: one(members, {
    fields: [clubInvitations.invitedBy],
    references: [members.id],
  }),
}));
