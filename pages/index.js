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
                <title>Money Rich - Exclusive Investment Hub</title>
                <meta name="description" content="Money Rich - Platform investasi eksklusif dengan strategi modern dan aman." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
        </>
    );
}
