import '../styles/globals.css';
import { useRouter } from 'next/router';
import { UserProvider } from '../contexts/UserContext';

function MyApp({ Component, pageProps }) {
    const router = useRouter();
    const isAdminRoute = router.pathname.startsWith('/panel-admin');

    if (isAdminRoute) {
        return <Component {...pageProps} />;
    }

    return (
        <UserProvider>
            <Component {...pageProps} />
        </UserProvider>
    );
}

export default MyApp;
