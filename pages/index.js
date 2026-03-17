// pages/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { checkAuth } from '../utils/auth';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAuthenticated = checkAuth();
            if (isAuthenticated) {
                router.replace('/dashboard');
            } else {
                router.replace('/login');
            }
        }
    }, [router]);
    return (
        <>
            <Head>
                <title>Money Rich - Platform Layanan Digital</title>
                <meta name="description" content="Money Rich - Platform digital modern untuk berbagai kebutuhan layanan Anda." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
        </>
    );
}
