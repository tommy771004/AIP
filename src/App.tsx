import { useState } from 'react';
import Navigation from './components/Navigation';
import { Container } from './components/StyledComponents';
import Dashboard from './views/Dashboard';
import SectorsMap from './views/SectorsMap';
import RescueContacts from './views/RescueContacts';
import ActiveCall from './views/ActiveCall';
import { TabType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('sos');
  const [isCallActive, setIsCallActive] = useState(false);

  if (isCallActive) {
    return <ActiveCall onEndCall={() => setIsCallActive(false)} />;
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans selection:bg-secondary-container">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <Container>
        {activeTab === 'sos' && <Dashboard onTriggerSOS={() => setIsCallActive(true)} />}
        {activeTab === 'sectors' && <SectorsMap />}
        {activeTab === 'rescue' && <RescueContacts onCall={() => setIsCallActive(true)} />}
        {activeTab === 'chat' && (
            <div className="flex flex-col items-center justify-center h-64 text-outline mt-20">
              <span className="material-symbols-outlined text-[64px] mb-4">chat_bubble_outline</span>
              <span className="text-xl font-bold">安全對話模組</span>
              <span className="text-sm">正在連線至安全通訊終端...</span>
            </div>
        )}
      </Container>
    </div>
  );
}
