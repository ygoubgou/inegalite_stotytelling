# Inégalités Mondiales — Visualisation Interactive

Une exploration visuelle de l'évolution des richesses et inégalités à travers le monde de 1980 à 2024.

**Auteurs : GOUBGOU Yamba Arsène & MOHAMMED Faruk Ahmed Riyan**  
*Projet de visualisation de données — Portfolio ENSAE*

---

## Aperçu

![Screenshot](screenshots/hero.png)

Ce projet offre une expérience de data storytelling interactive, comparable aux visualisations du Financial Times ou du New York Times. Il permet d'explorer les données économiques mondiales à travers des graphiques dynamiques, des cartes interactives et une narration guidée.

---

## Fonctionnalités

### Visualisations Principales

- **Scatter Plot** — PIB vs Indice de Gini avec bulles proportionnelles à la population
- **Animation temporelle** — Évolution des pays de 1980 à 2024
- **Trajectoires de groupe** — Comparaison G7 / BRICS / Autres
- **Carte mondiale** — Vue géographique avec bulles colorées par niveau d'inégalité
- **Répartition des revenus** — Barres empilées (Top 10%, Classe moyenne, Bottom 50%)
- **Focus Chine** — Trajectoire économique animée
- **Comparaison USA vs France** — Deux modèles économiques face à face
- **Paradoxe de Simpson** — Démonstration statistique avec régressions
- **Croissance vs Inégalités** — Analyse des changements 1980-2024

### Système de Filtres Global

- Slider d'année (1980–2024)
- Sélection de groupes (G7 / BRICS / Autres)
- Recherche et sélection de pays
- Choix des variables (PIB, Gini, Top 10%, etc.)
- Toggle échelle linéaire / logarithmique
- Basculement vue Scatter / Carte

### Panneau d'Insights

- Pays au PIB le plus élevé
- Pays au Gini le plus élevé
- Plus forte hausse d'inégalités
- Corrélation PIB/Gini en temps réel

### Mode Exploration

- Création libre de visualisations
- Animation temporelle personnalisée
- Export en PNG

### Événements Historiques

Annotations contextuelles sur les graphiques :
- 1991 : Chute de l'URSS
- 2001 : Entrée de la Chine à l'OMC
- 2008 : Crise financière mondiale
- 2020 : Pandémie COVID-19

---

## Technologies

- **D3.js v7** — Visualisations SVG interactives
- **TopoJSON** — Cartographie mondiale
- **Intersection Observer API** — Scrollytelling
- **HTML5 / CSS3** — Interface responsive
- **JavaScript ES6+** — Architecture modulaire

---

## Structure du Projet

```
public/
├── index.html          # Page principale
├── styles.css          # Styles CSS
├── README.md           # Documentation
├── js/
│   └── main.js         # Logique D3.js
├── data/
│   └── combined_data.csv  # Données économiques
└── screenshots/        # Captures d'écran
```

---

## Format des Données

Le fichier `combined_data.csv` doit contenir les colonnes suivantes :

| Colonne | Description |
|---------|-------------|
| Year | Année (1980–2024) |
| Country | Nom du pays |
| GDP_per_capita | PIB par habitant ($) |
| Gini_Index | Indice de Gini (0–1) |
| Top_10_Income_Share | Part des revenus du Top 10% |
| Bottom_50_Income_Share | Part des revenus du Bottom 50% |
| Top_10_Wealth_Share | Part du patrimoine du Top 10% |
| Total_Population | Population totale |
| Group | Groupe (1=G7, 2=BRICS, 3=Autres) |

---

## Sources des Données

- **World Bank** — Indicateurs économiques mondiaux
- **World Inequality Database** — Distribution des revenus et du patrimoine

---

## Contact

**GOUBGOU Yamba Arsène & MOHAMMAD Faruk Ahmed Riyan**  
Projet réalisé dans le cadre du cours de data storytelling à l'ENSAE

---

*Data Storytelling Project — 2026*
