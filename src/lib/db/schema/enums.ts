import { pgEnum } from "drizzle-orm/pg-core";

export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "free",
  "pro",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "canceled",
  "trialing",
  "paused",
]);

export const addonIdEnum = pgEnum("addon_id", [
  "finance",
  "tournament_pro",
  "professional",
  "communication",
  "storage_plus",
]);

export const addonStatusEnum = pgEnum("addon_status", [
  "active",
  "past_due",
  "canceled",
  "trialing",
]);

export const clubMemberStatusEnum = pgEnum("club_member_status", [
  "active",
  "inactive",
  "pending",
]);

export const memberRoleEnum = pgEnum("member_role", [
  "user",
  "admin",
  "vorstand",
  "sportwart",
  "jugendwart",
  "kassenwart",
  "trainer",
  "mitglied",
  "eltern",
]);

export const gameResultEnum = pgEnum("game_result", [
  "1-0",
  "0-1",
  "1/2-1/2",
  "+-",
  "-+",
  "+/+",
]);

export const tournamentTypeEnum = pgEnum("tournament_type", [
  "swiss",
  "round_robin",
  "rapid",
  "blitz",
  "team_match",
  "club_championship",
]);

export const membershipStatusEnum = pgEnum("membership_status", [
  "active",
  "inactive",
  "resigned",
  "honorary",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "overdue",
  "cancelled",
  "refunded",
  "collected",
]);

export const seasonTypeEnum = pgEnum("season_type", [
  "bundesliga",
  "bezirksliga",
  "kreisklasse",
  "club_internal",
]);

export const availabilityStatusEnum = pgEnum("availability_status", [
  "available",
  "unavailable",
  "maybe",
]);

export const documentCategoryEnum = pgEnum("document_category", [
  "statute",
  "protocol",
  "certificate",
  "other",
]);

export const contributionFrequencyEnum = pgEnum("contribution_frequency", [
  "yearly",
  "quarterly",
  "monthly",
]);

export const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);

export const pageStatusEnum = pgEnum("page_status", [
  "draft",
  "published",
  "scheduled",
  "archived",
]);

export const pageLayoutEnum = pgEnum("page_layout", [
  "default",
  "wide",
  "landing",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "approved",
  "rejected",
  "waitlisted",
]);

export const applicationTypeEnum = pgEnum("application_type", [
  "waitlist",
  "contact",
  "pilot",
]);
