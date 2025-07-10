import React from 'react';

export const StockagePanel: React.FC = () => {
  const currentStock = 65000;

  return (
    <div className="bg-white p-3 rounded shadow">
      <p>Capacité actuelle : {currentStock} L</p>
      <p>Espace libre : {100000 - currentStock} L</p>
    </div>
  );
};
