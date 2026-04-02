import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types/rbac.types';

export const usePermissions = () => {
  const { hasPermission, user } = useAuth();

  const checkPermission = (permission: Permission | Permission[]): boolean => {
    if (Array.isArray(permission)) {
      return permission.some(p => hasPermission(p));
    }
    return hasPermission(permission);
  };

  return {
    hasPermission: checkPermission,
    userRole: user?.role,
    userPermissions: user?.permissions || []
  };
};
