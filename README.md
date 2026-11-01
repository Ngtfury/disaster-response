# Disaster Tweet AI Explainer (Phase 1 Demo)

Based on the research paper: **"When Splits Matter: Interpreting Disaster Tweet Classification Models"** (IEEE ICDMW 2025).

---

## 🌪️ Overview

During natural disasters and humanitarian crises, real-time social media messages (e.g. tweets) provide vital signals for first responders. However, standard machine learning pipelines evaluate models using **Random Train/Test Splits**, which leak disaster-specific hashtags, location names, and proper nouns into both training and test data.
- **The Problem:** Models appear to have high accuracy (89%+ F1), but actually learn **spurious location shortcuts** (e.g., `#Idalia`, `Tampa`, `Waco`, `San Marcos`). When tested on an unseen disaster, performance drops by **14.7%**.
- **The Solution:** **Disaster-Holdout Validation (DHV)** trains on past disasters and evaluates on completely held-out new events, forcing the AI to rely on generalizable, life-saving distress signals (`trapped`, `rising waters`, `flood`, `casualties`).

---

## 🚀 Live Demo Application

The full Next.js 16 app is running locally:
- **Local URL:** [http://localhost:3000](http://localhost:3000)

### 4 Interactive Workspaces

1. **Workspace 01: Tweet Diagnostic Studio (`/`)**
   - Live tweet analysis with real-time token attribution.
   - Dual split toggle: **Standard Random Split** vs. **Unseen Disaster Holdout (DHV)**.
   - Color-coded tokens: Warm red for emergency signals, cool blue for entity/location shortcuts.
   - Urgency Triage (Levels L0–L3) with dispatch recommendations.
   - Influence distribution bar chart.

2. **Workspace 02: Model Comparison & Generalization Benchmark**
   - Compares Random Split against Unseen Disaster Holdout across multiple disaster events (Hurricane Ian, Guatemala Earthquake, Philippines Floods, West Texas Explosion).
   - Visual grouped bar charts for F1 scores.
   - Kendall’s Tau ($\tau$) attribution consistency ranking.
   - Interactive Error Confusion Matrix modal.

3. **Workspace 03: Explanation Trust Check (Perturbation & Faithfulness)**
   - Interactive **Word Removal Slider** (0 to 5 words).
   - Live tweet perturbation preview showing dynamic masked tokens `[HIDDEN: flood]`, `[HIDDEN: trapped]`, etc.
   - Dynamic confidence drop gauge and faithfulness grade.
   - Dual verification curves: **Comprehensiveness (Removal Drop)** and **Sufficiency (Insertion Recovery)**.
   - Export metrics to CSV.

4. **Workspace 04: Dataset Overview, Severity Rules & Custom CSV Upload**
   - Preloaded dataset of **10,824+ human-annotated crisis tweets** (`data/disaster_tweets.csv`).
   - Dynamic class distribution and severity breakdown.
   - **Custom CSV Upload:** Drag-and-drop or select any CSV file to instantly parse, calculate statistics, and view tweets.
   - **One-Click Diagnostic Studio Integration:** Click **"Analyze in Studio"** on any tweet row in the table to immediately load and analyze it in Workspace 01!
   - UN OCHA 2023 Humanitarian Taxonomy table with Level 0 to Level 3 guidelines.

---

## 🛠️ Quick Start & Commands

```bash
# Navigate to the frontend directory
cd frontend

# Run the development server
npm run dev

# Open your browser
http://localhost:3000

# Build for production
npm run build
```

---

## 📁 Project Structure

```text
disasterresponse/
├── data/
│   ├── disaster_tweets_raw.csv         # Original raw corpus
│   └── disaster_tweets.csv             # Cleaned & standardized dataset (10,824 records)
├── frontend/
│   ├── public/data/
│   │   └── disaster_tweets.csv         # Served directly to browser for download & preview
│   └── src/
│       ├── app/                        # Next.js app router & layout
│       ├── components/
│       │   ├── layout/                 # Sidebar & Navbar
│       │   └── workspaces/             # 4 Workspace views matching the UI mockups
│       ├── data/                       # Datasets, benchmarks, local attribution engine
│       └── types/                      # TypeScript definitions
├── scripts/
│   └── prepare_dataset.py              # Data cleaning and taxonomy mapping script
└── When_Splits_Matter_...pdf           # Research proposal paper
```

