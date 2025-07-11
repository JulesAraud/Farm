-- ⚙️ Création de la base
CREATE DATABASE IF NOT EXISTS farm_simulator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farm_simulator;

-- 🏡 Table ferme
CREATE TABLE IF NOT EXISTS ferme (
  id INT PRIMARY KEY,
  stockage INT DEFAULT 0,
  revenu_total INT DEFAULT 0
);

INSERT INTO ferme (id, stockage, revenu_total) VALUES (1, 0, 0);

-- 🌾 Table des champs
CREATE TABLE IF NOT EXISTS champs (
  id INT PRIMARY KEY,
  lot VARCHAR(50),
  culture VARCHAR(50),
  state VARCHAR(50), -- ex: labouré, semé, fertilisé, prêt à récolter
  fertilised BOOLEAN DEFAULT FALSE,
  last_action_time DATETIME
);

-- 🧺 Stockage des cultures brutes
CREATE TABLE IF NOT EXISTS stockage_culture (
  culture VARCHAR(50) PRIMARY KEY,
  quantite INT DEFAULT 0
);

-- 🏭 Usines de transformation
CREATE TABLE IF NOT EXISTS usines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) UNIQUE,
  resultat VARCHAR(50),
  multiplicateur INT DEFAULT 1,
  quantiteEgale BOOLEAN DEFAULT FALSE,
  dispo TINYINT(1), -- NULL = disponible, 1 = en fonctionnement
  quantite_produite INT DEFAULT 0,
  derniere_production DATETIME
);

-- 🔗 Intrants associés aux usines
CREATE TABLE IF NOT EXISTS usines_intrants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usine_id INT,
  intrant VARCHAR(50),
  FOREIGN KEY (usine_id) REFERENCES usines(id) ON DELETE CASCADE
);

-- 🧴 Produits transformés stockés
CREATE TABLE IF NOT EXISTS produits_transformes (
  produit VARCHAR(50) PRIMARY KEY,
  quantite INT DEFAULT 0
);

-- 📦 Remplir produits_transformes (produits possibles)
INSERT INTO produits_transformes (produit, quantite) VALUES
('huile', 0),
('planches', 0),
('wagons', 0),
('jouets', 0),
('farine', 0),
('sucre', 0),
('tissu', 0),
('vêtements', 0),
('gâteau', 0),
('chips', 0),
('vin', 0);

-- 🧱 Insérer les usines de base
INSERT INTO usines (nom, resultat, multiplicateur, quantiteEgale)
VALUES
('Moulin à huile', 'huile', 2, FALSE),
('Scierie', 'planches', 2, FALSE),
('Fabrique de wagons', 'wagons', 4, FALSE),
('Usine de jouets', 'jouets', 3, FALSE),
('Moulin à grains', 'farine', 2, FALSE),
('Raffinerie de sucre', 'sucre', 2, FALSE),
('Filature', 'tissu', 2, FALSE),
('Atelier de couture', 'vêtements', 2, FALSE),
('Boulangerie', 'gâteau', 6, TRUE),
('Usine de chips', 'chips', 6, TRUE),
('Cave à vin', 'vin', 2, FALSE);

-- 🔌 Relier les intrants aux usines
INSERT INTO usines_intrants (usine_id, intrant) VALUES
(1, 'tournesol'), (1, 'olive'), (1, 'canola'), (1, 'riz'),
(2, 'peuplier'),
(3, 'planches'),
(4, 'planches'),
(5, 'blé'), (5, 'orge'), (5, 'sorgho'),
(6, 'betterave'), (6, 'canne à sucre'),
(7, 'coton'),
(8, 'tissu'),
(9, 'sucre'), (9, 'farine'),
(10, 'pomme de terre'), (10, 'huile'),
(11, 'raisin');

-- ✅ Stockage culture initialisé à 0
INSERT INTO stockage_culture (culture, quantite) VALUES
('blé', 0), ('orge', 0), ('soja', 0), ('avoine', 0), ('canola', 0),
('raisin', 0), ('olive', 0), ('pomme de terre', 0), ('betterave', 0),
('coton', 0), ('maïs', 0), ('tournesol', 0), ('canne à sucre', 0),
('légumes', 0), ('épinard', 0), ('pois', 0), ('haricots verts', 0), ('peuplier', 0);
