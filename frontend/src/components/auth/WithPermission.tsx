import React from 'react';
import { Permission } from '../../types/rbac.types';
import { usePermissions } from '../../hooks/usePermissions';

interface WithPermissionProps {
  permission: Permission | Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const WithPermission: React.FC<WithPermissionProps> = ({
  permission,
  children,
  fallback = null
}) => {
  const { hasPermission } = usePermissions();
  
  const hasAccess = hasPermission(permission);
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
