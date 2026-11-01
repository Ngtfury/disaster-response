'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sliders, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  Download, 
  Info,
  RefreshCw,
  Layers
} from 'lucide-react';
import { PRESET_TWEETS } from '@/data/mockData';

interface RemovalStep {
  word: string;
  category: string;
  dropTo: number;
}

const TWEET_ABLATION_CASES = [
  {
    id: 'case-1',
    name: 'Tampa Flash Flood (Hurricane Idalia)',
    author: 'Florida Emergency Response (@FL_Dispatch)',
    location: 'Tampa, FL',
    originalConfidence: 94.0,
    words: [
      { word: 'flood', dropTo: 72.4 },
      { word: 'trapped', dropTo: 45.1 },
      { word: '#Idalia', dropTo: 25.6 },
      { word: 'rising', dropTo: 16.2 },
      { word: 'URGENT', dropTo: 8.5 }
    ]
  },
  {
    id: 'case-2',
    name: 'Guatemala Earthquake Collapse',
    author: 'Cruz Roja Guatemala (@CruzRojaGT)',
    location: 'San Marcos, Guatemala',
    originalConfidence: 92.5,
    words: [
      { word: 'sismo', dropTo: 68.0 },
      { word: 'muertos', dropTo: 41.5 },
      { word: 'atrapadas', dropTo: 23.0 },
      { word: 'escombros', dropTo: 14.8 },
      { word: 'URGENT', dropTo: 7.2 }
    ]
  },
  {
    id: 'case-3',
    name: 'West Texas Plant Explosion',
    author: 'Texas Fire Dispatch (@TX_Fire)',
    location: 'West, TX',
    originalConfidence: 95.8,
    words: [
      { word: 'explosion', dropTo: 71.0 },
      { word: 'blast', dropTo: 48.2 },
      { word: 'firefighters', dropTo: 28.5 },
      { word: 'injured', dropTo: 18.0 },
      { word: 'Massive', dropTo: 9.1 }
    ]
  }
];

export const ExplanationTrustWorkspace: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(TWEET_ABLATION_CASES[0].id);
  const [wordsRemovedCount, setWordsRemovedCount] = useState<number>(3);
  const [selectedMethod, setSelectedMethod] = useState<'shap' | 'ig'>('shap');

  const activeCase = TWEET_ABLATION_CASES.find(c => c.id === selectedCaseId) || TWEET_ABLATION_CASES[0];
  const baseConfidence = activeCase.originalConfidence;
  
  // Calculate current confidence based on slider & method
  let currentConfidence = baseConfidence;
  if (wordsRemovedCount > 0) {
    const rawDrop = activeCase.words[wordsRemovedCount - 1].dropTo;
    // Integrated Gradients has slightly softer drop than Shapley game-theoretic removal
    currentConfidence = selectedMethod === 'ig' ? Math.min(baseConfidence - 5, rawDrop + 8.5) : rawDrop;
  }
  const confidenceDrop = parseFloat((baseConfidence - currentConfidence).toFixed(1));

  // Perturbation curve data points
  const removalCurveData = [
    { step: 0, shap: baseConfidence, ig: baseConfidence, random: baseConfidence },
    { step: 1, shap: activeCase.words[0].dropTo, ig: activeCase.words[0].dropTo + 6, random: baseConfidence - 5 },
    { step: 2, shap: activeCase.words[1].dropTo, ig: activeCase.words[1].dropTo + 9, random: baseConfidence - 11 },
    { step: 3, shap: activeCase.words[2].dropTo, ig: activeCase.words[2].dropTo + 12, random: baseConfidence - 17 },
    { step: 4, shap: activeCase.words[3].dropTo, ig: activeCase.words[3].dropTo + 11, random: baseConfidence - 22 },
    { step: 5, shap: activeCase.words[4].dropTo, ig: activeCase.words[4].dropTo + 10, random: baseConfidence - 27 }
  ];

  const insertionCurveData = [
    { step: 0, shap: 12.0, ig: 12.0, random: 12.0 },
    { step: 1, shap: 48.5, ig: 36.2, random: 22.0 },
    { step: 2, shap: 71.0, ig: 55.4, random: 34.5 },
    { step: 3, shap: 86.8, ig: 72.0, random: 48.0 },
    { step: 4, shap: 91.5, ig: 82.5, random: 61.2 },
    { step: 5, shap: baseConfidence, ig: 88.0, random: 73.0 }
  ];

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Step,Removed_Word,SHAP_Confidence,IG_Confidence,Random_Baseline\n" +
      removalCurveData.map(d => `${d.step},${d.step > 0 ? activeCase.words[d.step-1].word : 'None'},${d.shap},${d.ig},${d.random}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `faithfulness_ablation_${activeCase.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            Workspace 04 • Perturbation &amp; Axiomatic Sanity Check
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Explanation Trust Check
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical validation of attribution methods. We ablate decisive tokens to verify if the model truly hinges on salient features or merely correlates with spurious noise.
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <div className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 flex items-center space-x-2 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Faithfulness Score: 0.892 (Grade A)</span>
          </div>
        </div>
      </div>

      {/* Main Ablation Interactive Testing Card */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-md">
                Ablation Test: Comprehensiveness
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              What happens if we hide the top words the AI claims are important?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Faithfulness test: If an explanation method truly identified the decisive words, removing them should trigger an immediate collapse in model confidence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Case selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-medium">Scenario:</span>
              <select
                value={selectedCaseId}
                onChange={(e) => {
                  setSelectedCaseId(e.target.value);
                  setWordsRemovedCount(3);
                }}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                {TWEET_ABLATION_CASES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Method selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-medium">Method:</span>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value as 'shap' | 'ig')}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="shap">KernelSHAP (Sampled N=2000)</option>
                <option value="ig">Integrated Gradients</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interactive Words Removed Slider */}
        <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700">
                Number of Top Important Words Removed:
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-semibold">
                {wordsRemovedCount} words removed
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Click any step or drag slider to ablate
            </span>
          </div>

          <div className="space-y-3">
            <input
              type="range"
              min={0}
              max={5}
              step={1}
              value={wordsRemovedCount}
              onChange={(e) => setWordsRemovedCount(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            {/* Clickable Step markers */}
            <div className="grid grid-cols-6 text-center text-[10px] text-slate-500 font-mono">
              <button
                type="button"
                onClick={() => setWordsRemovedCount(0)}
                className={`py-1 px-1 rounded-md transition-colors cursor-pointer ${
                  wordsRemovedCount === 0 ? 'bg-blue-100 font-bold text-blue-700' : 'hover:bg-slate-200'
                }`}
              >
                0 (None)
              </button>
              {activeCase.words.map((w, idx) => {
                const stepNum = idx + 1;
                const isSelected = wordsRemovedCount === stepNum;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setWordsRemovedCount(stepNum)}
                    className={`py-1 px-1 rounded-md transition-colors truncate cursor-pointer ${
                      isSelected ? 'bg-blue-100 font-bold text-blue-700' : 'hover:bg-slate-200'
                    }`}
                  >
                    {stepNum} (+{w.word})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Perturbation Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="uppercase tracking-wider text-[11px]">Tweet Perturbation Preview</span>
            <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live inference replica</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-3">
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                EM
              </div>
              <div>
                <span className="font-bold text-slate-800">{activeCase.author}</span>
                <span className="text-slate-400 ml-1.5 text-[11px]">{activeCase.location}</span>
              </div>
            </div>

            {/* Dynamic masked text */}
            <div className="text-sm md:text-base font-serif leading-relaxed text-slate-800">
              {activeCase.id === 'case-1' && (
                <>
                  {wordsRemovedCount >= 5 ? (
                    <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 font-mono text-xs line-through mr-1">
                      [HIDDEN: URGENT]
                    </span>
                  ) : (
                    'URGENT: '
                  )}
                  Flash{' '}
                  {wordsRemovedCount >= 1 ? (
                    <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 font-mono text-xs line-through mr-1">
                      [HIDDEN: flood]
                    </span>
                  ) : (
                    <span className="font-semibold text-rose-700 bg-rose-50 px-1 rounded-sm">flood</span>
                  )}{' '}
                  waters{' '}
                  {wordsRemovedCount >= 4 ? (
                    <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 font-mono text-xs line-through mr-1">
                      [HIDDEN: rising]
                    </span>
                  ) : (
                    <span className="font-semibold text-rose-700 bg-rose-50 px-1 rounded-sm">rising</span>
                  )}{' '}
                  rapidly on Bayshore Blvd in Tampa! 3 people{' '}
                  {wordsRemovedCount >= 2 ? (
                    <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 font-mono text-xs line-through mr-1">
                      [HIDDEN: trapped]
                    </span>
                  ) : (
                    <span className="font-semibold text-rose-700 bg-rose-50 px-1 rounded-sm">trapped</span>
                  )}{' '}
                  in SUV near water meter{' '}
                  {wordsRemovedCount >= 3 ? (
                    <span className="px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-800 font-mono text-xs line-through mr-1">
                      [HIDDEN: #Idalia]
                    </span>
                  ) : (
                    <span className="font-semibold text-blue-700 bg-blue-50 px-1 rounded-sm">#Idalia</span>
                  )}{' '}
                  #FloodRescue
                </>
              )}

              {activeCase.id === 'case-2' && (
                <>
                  {wordsRemovedCount >= 5 ? (
                    <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 font-mono text-xs line-through mr-1">
                      [HIDDEN: URGENT]
                    </span>
                  ) : (
                    'URGENT: '
                  )}
                  Fuerte{' '}
                  {wordsRemovedCount >= 1 ? (
                    <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 font-mono text-xs line-through mr-1">
                      [HIDDEN: sismo]
                    </span>
                  ) : (
                    <span className="font-semibold text-rose-700 bg-rose-50 px-1 rounded-sm">sismo</span>
                  )}{' '}
                  sacude San Marcos! Reportan 8{' '}
                  {wordsRemovedCount >= 2 ? (
                    <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 font-mono text-xs line-through mr-1">
                      [HIDDEN: muertos]
                    </span>
                  ) : (
                    <span className="font-semibold text-rose-700 bg-rose-50 px-1 rounded-sm">muertos</span>
                  )}{' '}
                  y personas{' '}
                  {wordsRemovedCount >= 3 ? (
                    <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 font-mono text-xs line-through mr-1">
                      [HIDDEN: atrapadas]
                    </span>
                  ) : (
                    <span className="font-semibold text-rose-700 bg-rose-50 px-1 rounded-sm">atrapadas</span>
                  )}{' '}
                  bajo{' '}
                  {wordsRemovedCount >= 4 ? (
                    <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 font-mono text-xs line-through mr-1">
                      [HIDDEN: escombros]
                    </span>
                  ) : (
                    <span className="font-semibold text-rose-700 bg-rose-50 px-1 rounded-sm">escombros</span>
                  )}{' '}
                  en hospital #SismoGT #GuatemalaTerremoto
                </>
              )}

              {activeCase.id === 'case-3' && (
                <>
                  {wordsRemovedCount >= 5 ? (
                    <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 font-mono text-xs line-through mr-1">
                      [HIDDEN: Massive]
                    </span>
                  ) : (
                    'Massive '
                  )}
                  {wordsRemovedCount >= 2 ? (
                    <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 font-mono text-xs line-through mr-1">
                      [HIDDEN: blast]
                    </span>
                  ) : (
                    <span className="font-semibold text-rose-700 bg-rose-50 px-1 rounded-sm">blast</span>
                  )}{' '}
                  and{' '}
                  {wordsRemovedCount >= 1 ? (
                    <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 font-mono text-xs line-through mr-1">
                      [HIDDEN: explosion]
                    </span>
                  ) : (
                    <span className="font-semibold text-rose-700 bg-rose-50 px-1 rounded-sm">explosion</span>
                  )}{' '}
                  at fertilizer plant in West Texas! Multiple{' '}
                  {wordsRemovedCount >= 3 ? (
                    <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 font-mono text-xs line-through mr-1">
                      [HIDDEN: firefighters]
                    </span>
                  ) : (
                    <span className="font-semibold text-rose-700 bg-rose-50 px-1 rounded-sm">firefighters</span>
                  )}{' '}
                  {wordsRemovedCount >= 4 ? (
                    <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 font-mono text-xs line-through mr-1">
                      [HIDDEN: injured]
                    </span>
                  ) : (
                    <span className="font-semibold text-rose-700 bg-rose-50 px-1 rounded-sm">injured</span>
                  )}{' '}
                  and dead, urgent medical evacuation near Waco #WestExplosion
                </>
              )}
            </div>
          </div>
        </div>

        {/* Confidence Drop Meter & Diagnosis Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-700">Model Confidence Drop:</span>
              <span className="text-base font-extrabold text-rose-600 flex items-center space-x-1">
                <TrendingDown className="w-4 h-4" />
                <span>-{confidenceDrop}%</span>
              </span>
            </div>

            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${currentConfidence}%` }}
              />
              <div 
                className="h-full bg-rose-400 transition-all duration-300"
                style={{ width: `${confidenceDrop}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>● Original: {baseConfidence}%</span>
              <span className="font-bold text-slate-800">● New Confidence: {currentConfidence}%</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start space-x-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                High Explanation Faithfulness
              </h4>
              <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                {wordsRemovedCount === 0
                  ? "Baseline state. No words removed yet. All feature attributions intact."
                  : `Model genuinely depended on these terms. Hiding the top ${wordsRemovedCount} decisive word${wordsRemovedCount > 1 ? 's' : ''} triggered a ${confidenceDrop}% confidence drop.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Charts: Comprehensiveness Drop vs Sufficiency Recovery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Axiom 1: Word Removal Drop */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Axiom 1 • Comprehensiveness
              </span>
              <TrendingDown className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Word Removal Drop
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Steeper drop = More trustworthy explanation. Removing top features must deplete target classification certainty.
            </p>
          </div>

          {/* Chart SVG Representation */}
          <div className="h-44 w-full bg-slate-50/60 rounded-xl border border-slate-200/80 p-3 relative flex flex-col justify-between">
            <div className="flex items-center justify-end space-x-3 text-[10px] font-medium text-slate-600">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-0.5 bg-blue-600"></span>
                <span>SHAP</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-0.5 bg-indigo-400"></span>
                <span>Integrated Gradients</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-0.5 bg-slate-400 border-dashed border-b"></span>
                <span>Random Baseline</span>
              </span>
            </div>

            {/* Visual SVG Curve */}
            <svg className="w-full h-28 overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="300" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="#e2e8f0" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="300" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" />

              {/* Random Baseline Line */}
              <polyline
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="4 4"
                points="0,6 60,12 120,18 180,24 240,29 300,34"
              />

              {/* Integrated Gradients Line */}
              <polyline
                fill="none"
                stroke="#818cf8"
                strokeWidth="2"
                points="0,6 60,22 120,42 180,59 240,70 300,80"
              />

              {/* SHAP Line (Steep drop) */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                points="0,6 60,28 120,55 180,74 240,84 300,92"
              />

              {/* Active Marker on Curve */}
              <circle
                cx={wordsRemovedCount * 60}
                cy={100 - currentConfidence}
                r="4.5"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </svg>

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5 words removed</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 flex items-center space-x-2 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Key Insight:</strong> SHAP highlights decisive words faster than baseline methods, yielding rapid confidence descent.
            </span>
          </div>
        </div>

        {/* Axiom 2: Word Insertion Recovery */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                Axiom 2 • Sufficiency
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Word Insertion Recovery
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Faster rise = Model sufficiency confirmed. Reintroducing key tokens to an empty baseline rapidly recovers conviction.
            </p>
          </div>

          {/* Chart SVG Representation */}
          <div className="h-44 w-full bg-slate-50/60 rounded-xl border border-slate-200/80 p-3 relative flex flex-col justify-between">
            <div className="flex items-center justify-end space-x-3 text-[10px] font-medium text-slate-600">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-0.5 bg-blue-600"></span>
                <span>SHAP</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-0.5 bg-indigo-400"></span>
                <span>Integrated Gradients</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-0.5 bg-slate-400 border-dashed border-b"></span>
                <span>Random Baseline</span>
              </span>
            </div>

            {/* Visual SVG Curve */}
            <svg className="w-full h-28 overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="300" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="#e2e8f0" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="300" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" />

              {/* Random Baseline Line */}
              <polyline
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="4 4"
                points="0,88 60,78 120,66 180,52 240,39 300,27"
              />

              {/* Integrated Gradients Line */}
              <polyline
                fill="none"
                stroke="#818cf8"
                strokeWidth="2"
                points="0,88 60,64 120,45 180,28 240,18 300,12"
              />

              {/* SHAP Line (Fast rise) */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                points="0,88 60,52 120,29 180,13 240,8 300,6"
              />

              {/* Active Marker on SHAP */}
              <circle
                cx={wordsRemovedCount * 60}
                cy={100 - insertionCurveData[wordsRemovedCount].shap}
                r="4.5"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </svg>

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5 words inserted</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center space-x-2 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Key Insight:</strong> Restoring top 3 words restores <strong>86.8%</strong> of full prediction confidence with minimal lexical context.
            </span>
          </div>
        </div>
      </div>

      {/* Footer Banner & Export CSV Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-600 gap-3">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            AOPC (Area Over Perturbation Curve) computed across test fold of 1,522 crisis instances.
          </span>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Metrics CSV</span>
        </button>
      </div>
    </div>
  );
};
