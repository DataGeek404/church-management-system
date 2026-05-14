import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Hook to protect pages based on user role
 * @param {string[]} allowedRoles - Array of roles allowed to access the page
 */
export function useRoleAccess(allowedRoles = []) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      // Not logged in, redirect to login
      router.push('/login');
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // User role not allowed, redirect to dashboard
      router.push('/dashboard');
    }
  }, [user, router, allowedRoles]);

  return user;
}

