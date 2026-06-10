import React, { useEffect, useState } from 'react';
import { GlassCard, ActionButton, Badge } from '../components/StyledComponents';
import axios from 'axios';

interface RescueContactsProps {
  onCall: () => void;
}

interface FirContact {
  id: string;
  region: string;
  facilityName: string;
  type: string;
  frequencies: string[];
  telephone: string;
  aftn: string;
  source: string;
}

export default function RescueContacts({ onCall }: RescueContactsProps) {
  const [contacts, setContacts] = useState<FirContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 呼叫後端我們建立的整合爬蟲 API 路徑
    axios.get('/api/contacts')
      .then(res => {
        if (res.data.success) {
          setContacts(res.data.data);
        }
      })
      .catch(err => {
        console.error("Failed to fetch live contacts:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // UI 呈現邏輯配置（對應不同的單位賦予視覺樣式）
  const getUiConfig = (type: string, index: number) => {
    if (type === 'RCC') {
      return {
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGLxrSSSQ1LdNN7vHh8Wd6_NW1VA44f4_c3hUXFy-lpA5ihbhoATp_Jamaqd11VAVpE3qPNx-4eS-v9xaWGmJpgGSSvukFPZJbpzXA_KXd8EW3pVzaCgL8--Q9NxO2XOHrMeLpPt5IFM3YYxziZ-kqLVKK-QhEDnG1fxY5wwrsYMwuKKqnnjL8B5P7uoNpP641GXI9bEwDXzSkdJ3KiPRksAKb1l_8pxW-Idtr34Lkh3oajoegVET-aEVK_Y7MgceyyER52vLxC1oJ",
        status: "On Call",
        statusColor: "secondary",
        active: true,
        btnLabel: "Direct Line",
        btnIcon: "call",
        btnClass: "bg-surface text-secondary",
        offset: "md:mt-4",
        bgImg: "bg-tertiary-container"
      };
    } else if (type === 'MED') {
      return {
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKav4-Af3U3K5U2Z8o_4dMSONWcIiwO4B80JePe6LfDnLa4GPV1evEj45SBU1-UKrvMfs7mB0by6fTuCUJasctolVpBEk2UhMM0jXQdwjTe_Cohinc_rGzrEYoPKILACQi42EsMz8e1a1HVIDtsFvKKJkN57Uv0FN00TbRPkY3eVWTeVnqkSPkufhcd6LRMuQ_SNdbS3JgAt9EfO_-H9VfQ6JwPv3hDYefv5rrCN4g686_CpgP4PqeK2PXuMrcnyjZOeUXVp-2FyUl",
        status: "Active",
        statusColor: "secondary",
        active: true,
        btnLabel: "Med-Call",
        btnIcon: "emergency",
        btnClass: "bg-secondary text-on-secondary",
        offset: "",
        bgImg: "bg-primary-container"
      };
    } else {
      // 預設 (TECH or ACC or others)
      return {
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaLTSyZe7bIDDymdNJeuafp91CwrWKBA9iDtjBdgU3JahEOeXVKa_CtlanGrsBuzscFy7GEyw9uAwd_K13GD3EszQk9R-LXMg1EIvLTBMh_0waGdrY_38e-27i1qMTIlflI4VPjhCowfSYjdfm_Y36LWB2vHtH18X0R6zYaM1_B4yuab7Xsh_aIVJmySPaPj_BdBysq0hBAfbKs2a-9PI-5kM2ed0d0pbS83yDuU4JHAb9AFyAfFTsb9Q3djz5uxetRG1Fu4-mORq5",
        status: "Standby",
        statusColor: "primary",
        active: false,
        btnLabel: "Contact",
        btnIcon: "build",
        btnClass: "bg-surface text-primary",
        offset: index % 2 === 0 ? "md:mt-8" : "md:mt-4",
        bgImg: "bg-tertiary-container"
      };
    }
  };

  return (
    <div className="pt-6 pb-20">
      <div className="mb-8">
        <h1 className="text-[24px] md:text-[32px] font-bold text-on-surface mb-2">Emergency Contacts</h1>
        <p className="text-[18px] font-medium text-on-surface-variant">
          Live synchronized data from eAIP resources globally.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-outline gap-4">
           <span className="material-symbols-outlined text-[48px] animate-spin">refresh</span>
           <p className="text-lg">Scraping Data from CAA databases...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          {contacts.map((contact, index) => {
            const config = getUiConfig(contact.type, index);
            return (
              <GlassCard key={contact.id} className={`flex flex-col items-center text-center relative transition-transform hover:-translate-y-1 duration-300 ${config.offset}`}>
                
                <div className="absolute top-4 right-4">
                  <Badge active={config.active} color={config.statusColor as any}>{config.status}</Badge>
                </div>

                <div className={`w-24 h-24 rounded-full mb-4 shadow-[inset_0_4px_8px_rgba(0,0,0,0.1)] border-4 border-surface overflow-hidden ${config.bgImg} relative`}>
                  <img src={config.image} alt={contact.facilityName} className="w-full h-full object-cover" />
                </div>

                <h3 className="text-[20px] font-semibold text-on-surface mb-1 flex items-center justify-center gap-1">
                  {contact.facilityName}
                </h3>
                <p className="text-[14px] font-medium text-secondary tracking-wide mb-1 uppercase">
                  {contact.region}
                </p>
                <div className="text-[14px] font-medium text-on-surface-variant mb-6 flex flex-col gap-1 items-center">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">call</span> {contact.telephone}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">settings_input_antenna</span> {contact.aftn}</span>
                </div>

                <ActionButton onClick={onCall} className={config.btnClass}>
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>{config.btnIcon}</span>
                  <span>{config.btnLabel}</span>
                </ActionButton>
                
                <div className="w-full text-center mt-4 border-t border-outline/20 pt-2">
                   <p className="text-[10px] text-tertiary">Source: {contact.source}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
