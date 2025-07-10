import React from 'react';

export const VehiclesPanel: React.FC = () => {
  return (
    <div className="bg-white p-3 rounded shadow">
      <ul>
        <li>Tracteurs : 5</li>
        <li>Moissonneuses : 2</li>
        <li>Remorques : 3</li>
      </ul>
    </div>
  );
};
