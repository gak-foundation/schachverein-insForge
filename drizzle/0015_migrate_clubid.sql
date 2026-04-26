-- Migration Script: Populate clubId from clubMemberships to members and auth_user
-- Run AFTER the schema migration that added clubId columns

-- 1. Migrate members.clubId from club_memberships (take primary/active membership)
UPDATE members
SET club_id = (
  SELECT cm.club_id
  FROM club_memberships cm
  WHERE cm.member_id = members.id
  ORDER BY cm.is_primary DESC, cm.joined_at ASC
  LIMIT 1
)
WHERE club_id IS NULL;

-- 2. Migrate auth_user.clubId from club_memberships via memberId
UPDATE auth_user
SET club_id = (
  SELECT cm.club_id
  FROM club_memberships cm
  WHERE cm.member_id = auth_user.member_id
  ORDER BY cm.is_primary DESC, cm.joined_at ASC
  LIMIT 1
)
WHERE club_id IS NULL AND member_id IS NOT NULL;

-- 3. For auth_user without member_id but with activeClubId, use activeClubId
UPDATE auth_user
SET club_id = active_club_id
WHERE club_id IS NULL AND active_club_id IS NOT NULL;

-- 4. Log users that still have no clubId (orphaned or incomplete accounts)
SELECT id, email, member_id, club_id, active_club_id
FROM auth_user
WHERE club_id IS NULL AND is_super_admin = false;

-- 5. Log members that still have no clubId
SELECT m.id, m.email, m.club_id
FROM members m
WHERE m.club_id IS NULL;
