'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Layers, 
  Copy,
  Check,
  Download,
  Share2
} from 'lucide-react';
import { PRESET_TWEETS, analyzeTweetLocally } from '@/data/mockData';
import { PredictionResult, SplitRegime } from '@/types';

interface AnalyzeTweetWorkspaceProps {
  initialTweetText?: string;
}

export const AnalyzeTweetWorkspace: React.FC<AnalyzeTweetWorkspaceProps> = ({
  initialTweetText
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_TWEETS[0].id);
  const [tweetText, setTweetText] = useState<string>(
    initialTweetText || PRESET_TWEETS[0].text
  );
  const [splitRegime, setSplitRegime] = useState<SplitRegime>('random');
  const [attributionMethod, setAttributionMethod] = useState<'shap' | 'ig'>('shap');
  const [activeTokenTooltip, setActiveTokenTooltip] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Analysis result state
  const [result, setResult] = useState<PredictionResult>(() => 
    analyzeTweetLocally(initialTweetText || PRESET_TWEETS[0].text, 'random')
  );

  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = PRESET_TWEETS.find(p => p.id === presetId);
    if (found) {
      setTweetText(found.text);
      setResult(analyzeTweetLocally(found.text, splitRegime));
    }
  };

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setResult(analyzeTweetLocally(tweetText, splitRegime));
      setIsAnalyzing(false);
    }, 250);
  };

  const handleToggleSplit = (regime: SplitRegime) => {
    setSplitRegime(regime);
    setResult(analyzeTweetLocally(tweetText, regime));
  };

  const handleToggleMethod = (method: 'shap' | 'ig') => {
    setAttributionMethod(method);
    // When switching to IG, adjust weights slightly to show gradient path integration vs Shapley values
    setResult(prev => ({
      ...prev,
      tokens: prev.tokens.map(t => ({
        ...t,
        score: method === 'ig' ? parseFloat((t.score * 0.92).toFixed(2)) : t.score,
        tooltip: method === 'ig' ? `Integrated Gradient: +${(t.score * 0.92).toFixed(2)}` : t.tooltip
      }))
    }));
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(tweetText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportJSON = () => {
    const report = {
      timestamp: new Date().toISOString(),
      tweetPayload: tweetText,
      evaluationSplit: splitRegime === 'dhv' ? 'Disaster-Holdout Validation (DHV)' : 'Standard Random Split',
      attributionMethod: attributionMethod === 'shap' ? 'SHAP (Shapley Additive exPlanations)' : 'Integrated Gradients',
      classification: {
        predictedDisasterType: result.disasterType,
        confidencePercent: result.confidence,
        matchesGroundTruth: result.matchesGroundTruth,
        secondaryProbabilities: result.secondaryProbabilities
      },
      urgencyTriage: {
        severityLevel: result.severityLevel,
        urgencyLabel: result.urgencyLabel,
        triagePriority: result.triagePriority,
        rationale: result.triageRationale
      },
      tokenAttributions: result.tokens.filter(t => t.score > 0).map(t => ({
        word: t.word.trim(),
        score: t.score,
        type: t.type
      })),
      generalCrisisWords: result.generalThreatWords,
      locationShortcuts: result.shortcutWords,
      generalizabilityScore: result.generalizabilityScore,
      dhvGeneralizationPenalty: result.dhvPenalty
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tweet_diagnostic_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const currentPreset = PRESET_TWEETS.find(p => p.id === selectedPresetId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            Workspace 02 • Inference &amp; Token Attribution
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Tweet Diagnostic Studio
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Diagnostic Report</span>
          </button>
          <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200 flex items-center space-x-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Engine: Hybrid DeBERTa-v3 / SVM Explainer</span>
          </div>
        </div>
      </div>

      {/* SECTION 01: Select or Paste a Tweet */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center">
                01
              </span>
              <h3 className="font-semibold text-slate-900 text-base">
                Select or Paste a Disaster Tweet
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-7">
              Test real-time disaster classification and token-level explainability models.
            </p>
          </div>

          {/* Validation Split Switcher */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => handleToggleSplit('random')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                splitRegime === 'random'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Standard Random Split
            </button>
            <button
              onClick={() => handleToggleSplit('dhv')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                splitRegime === 'dhv'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unseen Disaster Holdout (DHV)
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Preset Crisis Record
          </label>
          <select
            value={selectedPresetId}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            {PRESET_TWEETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.title}
              </option>
            ))}
          </select>
        </div>

        {/* Raw Tweet Payload Text Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="uppercase tracking-wider">Raw Tweet Payload</span>
            <span>{tweetText.length} / 280 chars</span>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              placeholder="Paste or type a disaster message here..."
              className="w-full text-sm font-normal text-slate-900 bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                {currentPreset?.location && (
                  <span className="inline-flex items-center space-x-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{currentPreset.location}</span>
                  </span>
                )}
                {currentPreset?.timeAgo && (
                  <span className="text-[11px] text-slate-400">
                    {currentPreset.timeAgo}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCopyText}
                  className="flex items-center space-x-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setTweetText('')}
                  className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button & Tokenizer Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Tokenizer mapped: {result.tokens.length} sub-word units</span>
          </div>
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm shadow-blue-500/25 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'Analyzing Tokens...' : 'Analyze Tweet'}</span>
          </button>
        </div>
      </section>

      {/* SECTION 02: Classification Outcomes */}
      <section className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center">
            02
          </span>
          <h3 className="font-semibold text-slate-900 text-base">
            Classification Outcomes
          </h3>
        </div>
        <p className="text-xs text-slate-500 pl-7 -mt-2">
          Calibrated probability distributions and immediate threat triage.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Card 1: Primary Disaster Type */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Primary Disaster Type
                </p>
                <div className="flex items-center space-x-2.5 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">
                    Predicted: {result.disasterType}
                  </h4>
                </div>
              </div>

              {result.matchesGroundTruth && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Matches Ground Truth</span>
                </span>
              )}
            </div>

            {/* Confidence Progress Meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Certainty Level</span>
                <span className="text-blue-700 font-semibold">{result.confidence}% Confidence</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, result.confidence)}%` }}
                />
              </div>
            </div>

            {/* Secondary Probabilities */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              {result.secondaryProbabilities.map((prob, i) => (
                <div key={i} className="text-center">
                  <span className="block text-slate-400">{prob.category}</span>
                  <span className="font-semibold text-slate-700">{prob.probability}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Severity Classification */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Severity Classification
                </p>
                <div className="flex items-center space-x-2.5 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">
                    Urgency: {result.urgencyLabel}
                  </h4>
                </div>
              </div>

              <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${
                result.severityLevel === 'L3'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : result.severityLevel === 'L2'
                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <span>{result.severityLevel === 'L3' ? 'Rescue Required' : result.triagePriority}</span>
              </span>
            </div>

            {/* Triage Tier Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>Critical Triage Grade</span>
                <span className="font-semibold text-rose-700">{result.triagePriority}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-2">
                <div className={`rounded-full ${result.severityLevel >= 'L0' ? 'bg-amber-300' : 'bg-slate-200'}`} />
                <div className={`rounded-full ${result.severityLevel >= 'L1' ? 'bg-amber-500' : 'bg-slate-200'}`} />
                <div className={`rounded-full ${result.severityLevel >= 'L2' ? 'bg-orange-500' : 'bg-slate-200'}`} />
                <div className={`rounded-full ${result.severityLevel === 'L3' ? 'bg-rose-600' : 'bg-slate-200'}`} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Level 0 (Info)</span>
                <span>Level 1 (Caution)</span>
                <span>Level 2 (High)</span>
                <span>Level 3 (Critical)</span>
              </div>
            </div>

            {/* Triage Rationale */}
            <div className="pt-2 border-t border-slate-100 flex items-start space-x-2 text-[11px] text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{result.triageRationale}</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03: Why Did the AI Predict This? */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center">
                03
              </span>
              <h3 className="font-semibold text-slate-900 text-base">
                Why Did the AI Predict This?
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-7">
              Token importance scores highlighting feature influence on the prediction.
            </p>
          </div>

          {/* Explainability Method Pills */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => handleToggleMethod('shap')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                attributionMethod === 'shap'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SHAP Values (Token Attribution)
            </button>
            <button
              onClick={() => handleToggleMethod('ig')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                attributionMethod === 'ig'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Integrated Gradients
            </button>
          </div>
        </div>

        {/* Attribution Map Box */}
        <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Attribution Map (Hover over highlighted words for impact score)</span>
            </div>
            <span className="text-slate-400">Baseline: Neutral Mask</span>
          </div>

          {/* Interactive Token Stream */}
          <div className="p-4 bg-white rounded-xl border border-slate-200/90 text-sm md:text-base leading-loose font-serif select-text min-h-[90px] flex flex-wrap items-center gap-1.5">
            {result.tokens.map((token) => {
              if (token.type === 'threat') {
                return (
                  <span
                    key={token.id}
                    title={token.tooltip}
                    onMouseEnter={() => setActiveTokenTooltip(token.tooltip || null)}
                    onMouseLeave={() => setActiveTokenTooltip(null)}
                    className="inline-block px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 font-semibold border border-rose-300 shadow-xs cursor-help transition-transform hover:scale-105"
                  >
                    {token.word}
                  </span>
                );
              } else if (token.type === 'shortcut') {
                return (
                  <span
                    key={token.id}
                    title={token.tooltip}
                    onMouseEnter={() => setActiveTokenTooltip(token.tooltip || null)}
                    onMouseLeave={() => setActiveTokenTooltip(null)}
                    className="inline-block px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-semibold border border-blue-300 shadow-xs cursor-help transition-transform hover:scale-105"
                  >
                    {token.word}
                  </span>
                );
              }
              return (
                <span key={token.id} className="text-slate-800">
                  {token.word}
                </span>
              );
            })}
          </div>

          {/* Attribution Legend */}
          <div className="flex flex-wrap items-center justify-between pt-1 text-xs text-slate-600 gap-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-rose-200 border border-rose-400" />
                <span>General Disaster / Threat Signals (High Positive)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-blue-200 border border-blue-400" />
                <span>Entity / Location Shortcuts (Risk of Overfitting)</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 italic">
              {activeTokenTooltip || 'Interactive tooltips active'}
            </span>
          </div>
        </div>

        {/* Feature Breakdown: General Words vs Spurious Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* General Disaster Words */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>General Disaster Words Used</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Keywords: <span className="font-semibold">{result.generalThreatWords.join(', ') || 'None detected'}</span>. Indicates robust, generalizable signals that translate reliably across novel disaster geographies and future emergencies.
            </p>
            <div className="pt-1 flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span>Model Generalizability Score:</span>
              <span className="font-mono text-sm">{result.generalizabilityScore} / 10</span>
            </div>
          </div>

          {/* Event-Specific Shortcut Words */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-800">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Event-Specific Shortcut Words</span>
            </div>
            <p className="text-xs text-blue-900 leading-relaxed">
              Keywords: <span className="font-semibold">{result.shortcutWords.join(', ') || 'None detected'}</span>. These act as potential spurious shortcuts. If trained exclusively on a single disaster, the model risks overfitting to regional proper nouns.
            </p>
            <div className="pt-1 flex items-center justify-between text-xs font-semibold text-blue-800">
              <span>DHV Generalization Penalty:</span>
              <span className="font-mono text-sm text-rose-600">-{result.dhvPenalty}%</span>
            </div>
          </div>
        </div>

        {/* Influence Distribution Horizontal Bar Chart */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700">
            <span className="font-bold">Aggregated Influence Distribution</span>
            <span className="text-slate-400">Top 5 contributing tokens ({attributionMethod.toUpperCase()})</span>
          </div>

          <div className="space-y-2">
            {result.topContributors.map((item, index) => {
              const widthPct = Math.min(100, (item.score / 0.5) * 100);
              const isThreat = item.type === 'threat';
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-700 font-semibold">{item.token}</span>
                    <span className={isThreat ? 'text-rose-600' : 'text-blue-600'}>
                      +{item.score.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isThreat ? 'bg-rose-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
