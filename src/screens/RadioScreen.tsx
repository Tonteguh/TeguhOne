import React from 'react';
import { RadioModal } from '../components/RadioModal';

interface RadioScreenProps {
  onBack: () => void;
}

export const RadioScreen: React.FC<RadioScreenProps> = ({ onBack }) => {
  return (
    <div className="pb-8">
      <RadioModal isOpen={true} onClose={onBack} />
    </div>
  );
};
