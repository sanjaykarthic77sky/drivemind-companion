import React from 'react';
import { DriveProvider } from './context/DriveContext';
import { CockpitLayout } from './components/cockpit/CockpitLayout';

export const App: React.FC = () => {
  return (
    <DriveProvider>
      <CockpitLayout />
    </DriveProvider>
  );
};

export default App;
