// lib/access.ts

// Only PUBLIC for dashboard global view
export const dashboardWhere = () => ({ access: "PUBLIC" });

// For team view group-by display:
// - own team: all cards regardless of access
// - other teams: only PUBLIC
export const teamSectionWhere = (
  sectionTeamId: string,
  viewerTeamId: string
) => {
  if (sectionTeamId === viewerTeamId) return { teamId: viewerTeamId }; // both PUBLIC & PRIVATE
  return { teamId: sectionTeamId, access: "PUBLIC" };
};
