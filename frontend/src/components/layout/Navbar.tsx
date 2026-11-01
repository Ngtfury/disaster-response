'use client';

import React, { useState } from 'react';
import { MessageSquare, User, Cpu, Code2, BookOpen, CheckCircle2 } from 'lucide-react';
import { ResearchDocModal } from '@/components/modals/ResearchDocModal';
import { FeedbackModal } from '@/components/modals/FeedbackModal';

interface NavbarProps {
  currentTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTitle }) => {
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-20">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">Console</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-semibold">{currentTitle}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600 border border-slate-200/60">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Hybrid DeBERTa-v3 / Linear SVM Explainer</span>
          </div>

          <button
            onClick={() => setIsDocsOpen(true)}
            className="flex items-center space-x-1.5 text-xs text-slate-600 hover:text-blue-600 font-medium transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Paper Docs</span>
          </button>

          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">GitHub</span>
          </a>

          <button 
            onClick={() => setIsFeedbackOpen(true)}
            className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Feedback</span>
          </button>

          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="relative w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium text-xs shadow-xs cursor-pointer hover:bg-blue-700 transition-colors"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Model & User Profile Dropdown */}
      {isProfileOpen && (
        <div className="fixed top-14 right-8 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 w-72 space-y-3 animate-in fade-in zoom-in-95 duration-100 text-xs">
          <div className="flex items-center space-x-3 pb-2 border-b border-slate-100">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              AI
            </div>
            <div>
              <p className="font-bold text-slate-900">Disaster Triage Operator</p>
              <p className="text-[11px] text-slate-400">IEEE ICDMW Research Console</p>
            </div>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Classifier Engine:</span>
              <span className="font-semibold text-slate-800">DeBERTa-v3 + SVM</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Split Evaluator:</span>
              <span className="font-semibold text-blue-600">DHV (Leave-One-Disaster-Out)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Attribution Method:</span>
              <span className="font-semibold text-slate-800">Shapley Additive (SHAP)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Environment:</span>
              <span className="font-mono text-emerald-600 font-bold">Client / Server Local</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setIsProfileOpen(false)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-xs font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ResearchDocModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
};
