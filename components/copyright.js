import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';

export default function Copyright() {
  const [applicationData, setApplicationData] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedApplication = localStorage.getItem('application');
    if (storedApplication) {
      try {
        const parsed = JSON.parse(storedApplication);
        setApplicationData({
          company: parsed.company || parsed.name || 'Money Rich',
        });
      } catch (e) {
        setApplicationData({ company: 'Money Rich' });
      }
    } else {
      setApplicationData({ company: 'Money Rich' });
    }
  }, []);

  const companyName = applicationData?.company || 'Money Rich';

  return (
    <div className="text-center text-white/40 text-xs flex items-center justify-center gap-1.5">
      <Icon icon="mdi:copyright" className="w-3 h-3" />
      <span>{new Date().getFullYear()} {companyName}. All rights reserved.</span>
    </div>
  );
}
