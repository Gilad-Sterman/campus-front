// Role-based permission utilities for frontend

export const ROLES = {
  STUDENT: 'student',
  CONCIERGE: 'concierge',
  ADMIN_VIEW: 'admin_view',
  ADMIN_EDIT: 'admin_edit',
  ADMIN: 'admin' // Legacy admin role
};

export const ROLE_HIERARCHY = {
  [ROLES.STUDENT]: 0,
  [ROLES.CONCIERGE]: 1,
  [ROLES.ADMIN_VIEW]: 2,
  [ROLES.ADMIN_EDIT]: 3,
  [ROLES.ADMIN]: 3 // Same level as admin_edit
};

/**
 * Check if user has permission to perform an action
 * @param {string} userRole - Current user's role
 * @param {string[]} requiredRoles - Array of roles that can perform the action
 * @returns {boolean} - Whether user has permission
 */
export const hasPermission = (userRole, requiredRoles) => {
  if (!userRole || !requiredRoles || requiredRoles.length === 0) {
    return false;
  }

  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  
  return requiredRoles.some(role => {
    const requiredLevel = ROLE_HIERARCHY[role] || 0;
    return userLevel >= requiredLevel;
  });
};

/**
 * Check if user can edit (admin_edit or admin roles only)
 * @param {string} userRole - Current user's role
 * @returns {boolean} - Whether user can edit
 */
export const canEdit = (userRole) => {
  return hasPermission(userRole, [ROLES.ADMIN_EDIT, ROLES.ADMIN]);
};

/**
 * Check if user can view admin panel (admin_view, admin_edit, admin, concierge)
 * @param {string} userRole - Current user's role
 * @returns {boolean} - Whether user can view admin panel
 */
export const canViewAdmin = (userRole) => {
  return hasPermission(userRole, [ROLES.ADMIN_VIEW, ROLES.ADMIN_EDIT, ROLES.ADMIN, ROLES.CONCIERGE]);
};

/**
 * Check if user is admin (any admin role)
 * @param {string} userRole - Current user's role
 * @returns {boolean} - Whether user is admin
 */
export const isAdmin = (userRole) => {
  return hasPermission(userRole, [ROLES.ADMIN_VIEW, ROLES.ADMIN_EDIT, ROLES.ADMIN]);
};

/**
 * Check if user is concierge
 * @param {string} userRole - Current user's role
 * @returns {boolean} - Whether user is concierge
 */
export const isConcierge = (userRole) => {
  return userRole === ROLES.CONCIERGE;
};

/**
 * Get user's permission level description
 * @param {string} userRole - Current user's role
 * @returns {string} - Permission level description
 */
export const getPermissionLevel = (userRole) => {
  switch (userRole) {
    case ROLES.ADMIN_EDIT:
    case ROLES.ADMIN:
      return 'Full Admin Access';
    case ROLES.ADMIN_VIEW:
      return 'Read-Only Admin Access';
    case ROLES.CONCIERGE:
      return 'Concierge Access';
    case ROLES.STUDENT:
      return 'Student Access';
    default:
      return 'No Access';
  }
};
