import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { adminRequest, getAdminToken, logoutAdmin } from '../../utils/admin/api';

const ADMIN_LOGIN_ROUTE = '/panel-admin/login';

export default function useAdminAuth() {
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    let active = true;
    const isLoginPage = router.pathname === ADMIN_LOGIN_ROUTE;

    const syncAdminAuth = async () => {
      const token = getAdminToken();

      if (!token) {
        if (!active) return;
        setAdmin(null);
        setLoading(false);
        if (!isLoginPage) {
          router.replace(ADMIN_LOGIN_ROUTE);
        }
        return;
      }

      try {
        const storedAdmin = localStorage.getItem('admin');
        if (storedAdmin && active) {
          setAdmin(JSON.parse(storedAdmin));
        }
      } catch (error) {}

      const response = await adminRequest('/profile', { method: 'GET' });
      if (!active) return;

      if (!response?.success || !response?.data) {
        logoutAdmin();
        setAdmin(null);
        setLoading(false);
        if (!isLoginPage) {
          router.replace(ADMIN_LOGIN_ROUTE);
        }
        return;
      }

      try {
        localStorage.setItem('admin', JSON.stringify(response.data));
      } catch (error) {}

      setAdmin(response.data);
      setLoading(false);
    };

    const handleAuthChange = (event) => {
      if (event?.type === 'storage' && event.key && !event.key.startsWith('admin')) {
        return;
      }

      if (!active) return;
      setLoading(true);
      syncAdminAuth();
    };

    setLoading(true);
    syncAdminAuth();

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('admin-token-changed', handleAuthChange);

    return () => {
      active = false;
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('admin-token-changed', handleAuthChange);
    };
  }, [router, router.isReady, router.pathname]);

  return { loading, user: admin, admin, setAdmin };
}
