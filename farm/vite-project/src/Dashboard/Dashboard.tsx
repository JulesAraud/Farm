import React from 'react';
import { ChampsList } from './ChampsList';
import { VehiclesPanel } from './VehiclesPanel';
import { StockagePanel } from './StockagePanel';
import { UsinesPanel } from './UsinesPanel';

export const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      <div className="col-span-2">
        <h2 className="text-xl font-bold mb-2">🌾 Champs</h2>
        <ChampsList />
      </div>

      <div className="col-span-1">
        <h2 className="text-xl font-bold mb-2">🚜 Matériel</h2>
        <VehiclesPanel />
        <h2 className="text-xl font-bold mt-4 mb-2">📦 Stockage</h2>
        <StockagePanel />
      </div>

      <div className="col-span-1">
        <h2 className="text-xl font-bold mb-2">🏭 Usines</h2>
        <UsinesPanel />
      </div>
    </div>
  );
};
