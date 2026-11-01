'use client';

import React from 'react';
import { X, BookOpen, ExternalLink, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

interface ResearchDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchDocModal: React.FC<ResearchDocModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
              Research &amp; Methodology
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              When Splits Matter: Interpreting Disaster Tweet Classification Models
            </h3>
            <p className="text-xs text-slate-500">
              Published in IEEE International Conference on Data Mining Workshops (ICDMW 2025)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Abstract */}
        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
            Abstract &amp; Core Finding
          </h4>
          <p className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 italic font-serif">
            "Machine learning models are increasingly used to classify disaster-related tweets, supporting real-time decision-making during crises. However, common evaluation practices such as random data splits inflate performance by allowing disaster-specific vocabulary to leak between training and testing sets. We propose Disaster-Holdout Validation (DHV), extending Leave-One-Disaster-Out (LODO). Our results show that DHV-trained models emphasize context-specific and generalizable features, while random splits favor spurious location shortcuts."
          </p>
        </div>

        {/* Key Architectural Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-blue-900">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>Disaster-Holdout Validation (DHV)</span>
            </div>
            <p className="text-blue-900/80 leading-relaxed text-[11px]">
              Trains models on N-1 historical disasters and evaluates strictly on an unseen event, exposing true out-of-distribution generalization drop (-14.7% F1).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-emerald-900">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>SHAP &amp; Token Attribution</span>
            </div>
            <p className="text-emerald-900/80 leading-relaxed text-[11px]">
              Computes game-theoretic Shapley contributions for individual tokens, separating genuine physical threats from event-specific shortcut words.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-amber-900">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>Kendall's Tau Rank Stability</span>
            </div>
            <p className="text-amber-900/80 leading-relaxed text-[11px]">
              Measures feature rank consistency across splits. Low correlation (τ = 0.58) reveals how random splits distort the model's learned representation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-purple-900">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>UN OCHA Triage Standard</span>
            </div>
            <p className="text-purple-900/80 leading-relaxed text-[11px]">
              Classifies messages into 4 urgency tiers: L0 Informational, L1 Caution, L2 Medium Need, and L3 Critical Rescue with sub-90s SLA trigger.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono text-[11px]">DOI: 10.1109/ICDMW69685.2025.00363</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors cursor-pointer"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};

