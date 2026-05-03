export type SubscriptionPlan = "free" | "pro";

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "trialing"
  | "paused";

export type AddonId =
  | "finance"
  | "tournament_pro"
  | "professional"
  | "communication"
  | "storage_plus";

export type AddonStatus = "active" | "past_due" | "canceled" | "trialing";

export type ClubMemberStatus = "active" | "inactive" | "pending";

export type MemberRole =
  | "user"
  | "admin"
  | "vorstand"
  | "spielleiter"
  | "jugendwart"
  | "kassenwart"
  | "trainer"
  | "mitglied"
  | "eltern";

export type GameResult = "1-0" | "0-1" | "1/2-1/2" | "+-" | "-+" | "+/+";

export type TournamentType =
  | "swiss"
  | "round_robin"
  | "rapid"
  | "blitz"
  | "team_match"
  | "club_championship";

export type MembershipStatus = "active" | "inactive" | "resigned" | "honorary";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "overdue"
  | "cancelled"
  | "refunded"
  | "collected";

export type SeasonType =
  | "bundesliga"
  | "bezirksliga"
  | "kreisklasse"
  | "club_internal";

export type AvailabilityStatus = "available" | "unavailable" | "maybe";

export type DocumentCategory = "statute" | "protocol" | "certificate" | "other";

export type ContributionFrequency = "yearly" | "quarterly" | "monthly";

export type MatchStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export type PageStatus = "draft" | "published" | "scheduled" | "archived";

export type PageLayout = "default" | "wide" | "landing";

export type ApplicationStatus = "pending" | "approved" | "rejected" | "waitlisted";

export type ApplicationType = "waitlist" | "contact" | "pilot";
