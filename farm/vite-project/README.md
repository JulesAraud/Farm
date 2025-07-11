# Farm Simulator

Un simulateur de gestion de ferme en Node.js + TypeScript avec une interface web simple. Le jeu vous permet de créer, gérer et transformer vos cultures à travers plusieurs étapes agricoles (labourage, semis, fertilisation, récolte, transformation, vente...).

---

vu que j'utilisai une base de données MySql en Locale sur phpMyAdmin je ne pense pas que vous pourrez y avoir acces c'est donc pour cela que je vous transmet des screen du projet ainsi que le script de la base de données pour la créer

## Installation

### 1. Cloner le projet

```bash
git clone <lien-vers-ton-repo>
cd vite-project

npm install

npx tsx server.ts

http://localhost:3000

Fonctionnalités : 

Création de champs
Champ = id + lot

Bouton : Créer

Labourage
Bouton : Labourer

Tous les champs disponibles sont labourés (délai 4 sec).

Semis
Choisir un champ labouré

Choisir une culture dans la liste (ex. blé, orge, etc.)

Bouton : Semer

Fertilisation
Bouton : Fertiliser

Tous les champs semés sont fertilisés automatiquement (délai 4 sec).

Récolte
Bouton : Récolter

Tous les champs "prêts à récolter" sont récoltés.

La production va dans le stockage de la ferme.

Transformation
Fonctionnement
Choisir une usine disponible

Bouton : Lancer la transformation

Les usines consomment des ressources de stockage_culture et produisent dans produits_transformes.

Capacité : 100 L / sec (simulation avec délai).

Une fois le stock épuisé ou la ferme pleine → l'usine s’arrête.

Usines disponibles (exemples) :
Usine	Intrants	Résultat	Multiplicateur
Moulin à huile	tournesol, olive, canola, riz	huile	x2
Scierie	peuplier	planches	x2
Boulangerie	sucre + farine (égal)	gâteau	x6
Usine de chips	pomme de terre + huile (égal)	chips	x6
Cave à vin	raisin	vin	x2

Affichage en temps réel des usines en cours d'utilisation (quantité produite visible).

Vente
Produits transformés
Liste déroulante : sélection d’un produit (produits_transformes)

Entrée : quantité à vendre

Bouton : Vendre le produit

Gain : 1 pièce par litre vendu

Le revenu est ajouté à revenu_total dans la table ferme.

Rafraîchissement automatique
Les données de la ferme sont mises à jour toutes les 30 secondes.

L’état des champs (liste), usines actives, stock et revenus sont mis à jour automatiquement.

Structure des tables (résumé)
Table ferme
id	stockage	revenu_total

Table champs
| id | lot | culture | state | fertilised | last_action_time |

Table stockage_culture
| culture | quantite |

Table produits_transformes
| produit | quantite |

Table usines
| id | nom | resultat | multiplicateur | quantiteEgale | dispo | quantite_produite | derniere_production |

Remarques techniques
Le projet utilise Node.js, TypeScript, MySQL, et Fetch API côté client.

L'interface web est en HTML + JS pur (avec rafraîchissements auto).

L’application est conçue pour un usage pédagogique/simulation.

Auteurs
Jules (développeur principal)