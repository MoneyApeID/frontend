// components/BottomNavbar.js
import { Home, User } from 'lucide-react';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';

const navItems = [
  { label: 'Home', icon: Home, href: '/dashboard', key: 'dashboard' },
  { label: 'Hadiah', icon: 'mdi:gift', href: '/bonus-hub', key: 'bonus-hub' },
  { label: 'Rekrut', icon: 'mdi:account-group', href: '/referral', key: 'referral' },
  { label: 'Testimoni', icon: 'mdi:comment-text', href: '/forum', key: 'forum' },
  { label: 'Profil', icon: User, href: '/profile', key: 'profile' },
];

export default function BottomNavbar() {
  const router = useRouter();

  const isActive = (item) => {
    if (item.key === 'dashboard') {
      return router.pathname === '/dashboard' || router.pathname === '/';
    }
    if (item.key === 'bonus-hub') {
      return router.pathname === '/bonus-hub' || router.pathname === '/spin-wheel' || router.pathname === '/task';
    }
    if (item.key === 'referral') {
      return router.pathname === '/referral' || router.pathname?.startsWith('/referral');
    }
    return router.pathname === item.href || router.pathname?.startsWith(item.href);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="relative">
        {/* Floating container with glassmorphism */}
        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-2 py-2.5 flex items-center justify-around shadow-2xl shadow-black/50">
          {navItems.map((item, index) => {
            const active = isActive(item);
            const isCenter = index === 2; // Rekrut is in the center
            
            // Render icon
            const renderIcon = () => {
              if (typeof item.icon === 'string') {
                return <Icon icon={item.icon} className={`w-5 h-5 ${active ? 'text-brand-gold' : 'text-white/60'}`} />;
              }
              const IconComponent = item.icon;
              return (
                <IconComponent
                  className={`w-5 h-5 ${active ? 'text-brand-gold' : 'text-white/60'}`}
                  strokeWidth={active ? 2.3 : 1.8}
                />
              );
            };

            return (
              <button
                key={item.key}
                onClick={() => router.push(item.href)}
                className={`relative flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-xl transition-all duration-300 ${
                  active 
                    ? 'text-brand-gold' 
                    : 'text-white/60 hover:text-white/80'
                } ${isCenter ? 'flex-1 max-w-[20%]' : 'flex-1'}`}
              >
                {/* Active indicator background for center item */}
                {active && isCenter && (
                  <div className="absolute inset-0 bg-brand-gold/20 rounded-xl blur-sm"></div>
                )}
                
                {/* Icon container */}
                <div
                  className={`relative flex items-center justify-center transition-all duration-300 ${
                    active
                      ? isCenter
                        ? 'scale-110'
                        : 'scale-105'
                      : 'scale-100'
                  }`}
                >
                  {renderIcon()}
                </div>
                
                {/* Label */}
                <span className={`text-[10px] font-semibold transition-all duration-300 leading-tight ${
                  active 
                    ? 'text-brand-gold' 
                    : 'text-white/60'
                }`}>
                  {item.label}
                </span>
                
                {/* Active indicator dot */}
                {active && (
                  <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-brand-gold"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
