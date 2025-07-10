import React from 'react';
import { Champ } from '../model/FarmModels';

const champs: Champ[] = [
  { id: 1, state: 'labouré', culture: 'blé', lot: 'A' },
  { id: 2, state: 'semé', culture: 'orge', lot: 'A' },
];

export const ChampsList: React.FC = () => {
  return (
    <div className="space-y-2">
      {champs.map(champ => (
        <div key={champ.id} className="border rounded p-2 bg-white shadow">
          <p><strong>Champ #{champ.id}</strong> - {champ.state}</p>
          <p>Culture : {champ.culture}</p>
          <div className="mt-2 flex gap-2">
            <button className="bg-blue-500 text-white px-2 py-1 rounded">Labourer</button>
            <button className="bg-green-500 text-white px-2 py-1 rounded">Semer</button>
            <button className="bg-yellow-500 text-white px-2 py-1 rounded">Fertiliser</button>
            <button className="bg-red-500 text-white px-2 py-1 rounded">Récolter</button>
          </div>
        </div>
      ))}
    </div>
  );
};
