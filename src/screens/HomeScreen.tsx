import React from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { FeatureGrid } from '../components/FeatureGrid';
import { HomeRadioPlayer } from '../components/HomeRadioPlayer';
import { AutomotiveDoctorBanner } from '../components/AutomotiveDoctorBanner';
import { ContentChoices } from '../components/ContentChoices';
import { QuoteBanner } from '../components/QuoteBanner';
import { TabType } from '../types';

interface HomeScreenProps {
  onSelectTab: (tab: TabType) => void;
  onOpenRadioModal: () => void;
  onOpenItem: (type: TabType, id: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectTab,
  onOpenRadioModal,
  onOpenItem,
}) => {
  return (
    <div className="space-y-4 pb-6">
      {/* 1. Hero Scenic Banner */}
      <HeroBanner onExplore={() => onSelectTab('video')} />

      {/* 2. 8 Core Features Grid */}
      <FeatureGrid
        onSelectTab={onSelectTab}
        onOpenRadioModal={onOpenRadioModal}
      />

      {/* 3. Dokter Otomotif - Uji Kompetensi & Edukasi Mesin */}
      <AutomotiveDoctorBanner onStartQuiz={() => onSelectTab('tuning')} />

      {/* 4. Radio Online Card in the middle of Home */}
      <HomeRadioPlayer onOpenFullRadio={onOpenRadioModal} />

      {/* 5. Curated Content Section */}
      <ContentChoices onSelectTab={onSelectTab} onOpenItem={onOpenItem} />

      {/* 6. Quote Banner & P2P Zero-Cost Badge */}
      <QuoteBanner />
    </div>
  );
};
