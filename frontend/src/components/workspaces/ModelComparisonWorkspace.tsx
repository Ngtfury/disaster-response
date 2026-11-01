'use client';

import React, { useState } from 'react';
import { 
  GitCompare, 
  TrendingDown, 
  AlertCircle, 
  ShieldCheck, 
  HelpCircle, 
  Layers, 
  BarChart2, 
  X,
  Download,
  CheckCircle2
} from 'lucide-react';
import { BENCHMARK_EVENTS } from '@/data/mockData';
import { ModelBenchmark } from '@/types';

export const ModelComparisonWorkspace: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>(BENCHMARK_EVENTS[0].id);
  const [showMatrixModal, setShowMatrixModal] = useState<boolean>(false);

  const currentBenchmark: ModelBenchmark = 
    BENCHMARK_EVENTS.find(b => b.id === selectedEventId) || BENCHMARK_EVENTS[0];

  const handleExportCSV = () => {
    const rows = [
      ["Benchmark Event", currentBenchmark.eventName],
      ["Test Sample Size", currentBenchmark.sampleCount],
      ["Overall Generalization Gap", `${currentBenchmark.overallGap}%`],
      ["Random Split Disaster Accuracy", `${currentBenchmark.disasterAccuracy.randomSplit}%`],
      ["Unseen Disaster Accuracy", `${currentBenchmark.disasterAccuracy.unseenDisaster}%`],
      ["Accuracy Drop", `${currentBenchmark.disasterAccuracy.drop}%`],
      ["Random Split Severity F1", `${currentBenchmark.severityF1.randomSplit}%`],
      ["Unseen Disaster Severity F1", `${currentBenchmark.severityF1.unseenDisaster}%`],
      ["Severity Drop", `${currentBenchmark.severityF1.drop}%`],
      ["Kendall's Tau Rank Stability", currentBenchmark.explanationTrust.kendallTau],
      [],
      ["Category", "Random Split F1", "Unseen Disaster F1", "Gap"],
      ...currentBenchmark.categoryPerformance.map(c => [c.category, `${c.randomSplit}%`, `${c.unseenDisaster}%`, `${c.gap}%`])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dhv_benchmark_${currentBenchmark.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Evaluation Protocol • DHV Benchmark Suite
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Does the AI still work when tested on a brand-new disaster it never saw during training?
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard ML random splits test on the same disasters seen in training (in-distribution). 
              <strong className="text-slate-800 font-semibold"> Disaster-Holdout Validation (DHV)</strong> tests true real-world generalization to new emergencies.
            </p>
          </div>

          {/* Generalization Penalty Box */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center shrink-0 min-w-[180px]">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
              Overall Gap
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight my-0.5">
              {currentBenchmark.overallGap}%
            </div>
            <span className="text-[11px] font-medium text-rose-800">
              Generalization penalty
            </span>
          </div>
        </div>

        {/* Disaster Event Selector Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-600 whitespace-nowrap">Held-out Disaster Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              {BENCHMARK_EVENTS.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.eventName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-medium flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Export Benchmark CSV</span>
            </button>
            <span>Test Sample: <strong className="text-slate-700">{currentBenchmark.sampleCount.toLocaleString()} tweets</strong></span>
            <span className="flex items-center space-x-1.5 hidden md:inline-flex">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>In-Distribution vs OOD</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Disaster Type Accuracy */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Classification
              </p>
              <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                Disaster Type Accuracy
              </h3>
              <p className="text-[11px] text-slate-500">Macro-averaged F1 Score</p>
            </div>
            <span className="text-slate-400 text-xs font-mono">*</span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Random Split</span>
              </span>
              <span className="text-2xl font-extrabold text-blue-600">
                {currentBenchmark.disasterAccuracy.randomSplit}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${currentBenchmark.disasterAccuracy.randomSplit}%` }}
              />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs text-slate-500 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Unseen Disaster</span>
              </span>
              <span className="text-sm font-bold text-slate-700">
                {currentBenchmark.disasterAccuracy.unseenDisaster}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-400 rounded-full" 
                style={{ width: `${currentBenchmark.disasterAccuracy.unseenDisaster}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="inline-flex items-center space-x-1 text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-semibold">
              <TrendingDown className="w-3 h-3" />
              <span>{currentBenchmark.disasterAccuracy.drop}% generalization drop on novel events</span>
            </span>
          </div>
        </div>

        {/* Card 2: Severity Prediction */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Prioritization
              </p>
              <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                Severity Prediction
              </h3>
              <p className="text-[11px] text-slate-500">Weighted F1 Score</p>
            </div>
            <span className="text-slate-400 text-xs font-mono">Δ</span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Random Split</span>
              </span>
              <span className="text-2xl font-extrabold text-blue-600">
                {currentBenchmark.severityF1.randomSplit}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${currentBenchmark.severityF1.randomSplit}%` }}
              />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs text-slate-500 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Unseen Disaster</span>
              </span>
              <span className="text-sm font-bold text-slate-700">
                {currentBenchmark.severityF1.unseenDisaster}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-400 rounded-full" 
                style={{ width: `${currentBenchmark.severityF1.unseenDisaster}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="inline-flex items-center space-x-1 text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-semibold">
              <TrendingDown className="w-3 h-3" />
              <span>{currentBenchmark.severityF1.drop}% drop on urgent vs non-urgent</span>
            </span>
          </div>
        </div>

        {/* Card 3: Explanation Trust */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Explainability
              </p>
              <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                Explanation Trust
              </h3>
              <p className="text-[11px] text-slate-500">Kendall’s Tau Feature Rank (τ)</p>
            </div>
            <span className="text-slate-400 text-xs font-mono">τ</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                {currentBenchmark.explanationTrust.kendallTau.toFixed(2)}
                <span className="text-xs font-normal text-slate-400"> / 1.00</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {currentBenchmark.explanationTrust.attributionStability} Word Shift
              </p>
            </div>

            {/* Circular Gauge Representation */}
            <div className="relative w-12 h-12 flex items-center justify-center rounded-full border-4 border-blue-500/20 border-t-blue-600">
              <span className="text-[11px] font-bold text-blue-700">
                {Math.round(currentBenchmark.explanationTrust.kendallTau * 100)}%
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-snug">
            {currentBenchmark.explanationTrust.shiftDescription}
          </div>
        </div>
      </div>

      {/* Performance by Disaster Type Comparison Chart */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Performance by Disaster Type
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparing Random Split (train/test on same events) vs. Unseen Disaster Holdout across categories.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 text-xs font-medium">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-blue-600"></span>
              <span className="text-slate-700">Random Split Model</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-blue-200 border border-blue-300"></span>
              <span className="text-slate-700">Unseen Disaster Model</span>
            </div>
          </div>
        </div>

        {/* Grouped Bar Visualizer */}
        <div className="pt-6 pb-2 px-2">
          <div className="grid grid-cols-4 gap-6 items-end h-64 border-b border-slate-200 pb-2">
            {currentBenchmark.categoryPerformance.map((cat, idx) => (
              <div key={idx} className="flex flex-col items-center h-full justify-end space-y-2">
                <div className="w-full flex justify-center items-end space-x-2 sm:space-x-3 h-full">
                  {/* Random Split Bar */}
                  <div className="w-7 sm:w-10 bg-blue-600 rounded-t-lg transition-all duration-500 relative group flex items-start justify-center pt-2"
                    style={{ height: `${cat.randomSplit}%` }}
                  >
                    <span className="text-[10px] font-bold text-white opacity-90">
                      {cat.randomSplit}%
                    </span>
                  </div>

                  {/* Unseen Disaster Bar */}
                  <div className="w-7 sm:w-10 bg-blue-200 border-t border-x border-blue-300 rounded-t-lg transition-all duration-500 relative group flex items-start justify-center pt-2"
                    style={{ height: `${cat.unseenDisaster}%` }}
                  >
                    <span className="text-[10px] font-bold text-blue-900">
                      {cat.unseenDisaster}%
                    </span>
                  </div>
                </div>

                {/* Category Label */}
                <div className="text-center pt-1">
                  <span className="block text-xs font-bold text-slate-800">{cat.category}</span>
                  <span className="inline-block text-[11px] font-semibold text-rose-600 mt-0.5">
                    {cat.gap}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 pt-2 px-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Core Vulnerability Takeaway Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-blue-50/70 border border-blue-200 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                Core Vulnerability Takeaway
              </h4>
              <p className="text-xs text-blue-900 mt-0.5 leading-relaxed">
                {currentBenchmark.coreVulnerabilityTakeaway}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowMatrixModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 text-xs font-bold shadow-xs whitespace-nowrap transition-all cursor-pointer"
          >
            <span>Inspect Error Confusion Matrix</span>
            <BarChart2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Confusion Matrix Modal */}
      {showMatrixModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Unseen Disaster Confusion Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  {currentBenchmark.eventName} (Holdout Evaluation)
                </p>
              </div>
              <button 
                onClick={() => setShowMatrixModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Matrix Table */}
            <div className="space-y-2">
              <div className="grid grid-cols-5 text-center text-xs font-bold text-slate-600 pb-1">
                <span className="text-left text-slate-400 text-[10px]">Actual \ Pred</span>
                {currentBenchmark.confusionMatrix.labels.map((lbl, i) => (
                  <span key={i}>{lbl}</span>
                ))}
              </div>

              {currentBenchmark.confusionMatrix.matrix.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-5 items-center text-center text-xs">
                  <span className="font-bold text-slate-700 text-left truncate">
                    {currentBenchmark.confusionMatrix.labels[rIdx]}
                  </span>
                  {row.map((val, cIdx) => {
                    const isDiagonal = rIdx === cIdx;
                    return (
                      <span 
                        key={cIdx} 
                        className={`p-2 rounded-md font-mono font-medium ${
                          isDiagonal 
                            ? 'bg-blue-600 text-white font-bold' 
                            : val > 10 
                              ? 'bg-rose-100 text-rose-800' 
                              : 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        {val}%
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              Off-diagonal entries highlight misclassifications caused by unfamiliar disaster vocabulary when migrating from train to novel test distributions.
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowMatrixModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
