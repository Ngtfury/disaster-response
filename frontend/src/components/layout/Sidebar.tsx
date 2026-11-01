'use client';

import React, { useState } from 'react';
import { 
  FileSearch, 
  GitCompare, 
  ShieldCheck, 
  Database, 
  BookOpen, 
  Layers
} from 'lucide-react';
import { ResearchDocModal } from '@/components/modals/ResearchDocModal';

interface SidebarProps {
  activeWorkspace: string;
  onSelectWorkspace: (workspaceId: string) => void;
  datasetCount?: number;
  isDatasetLoaded?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeWorkspace,
  onSelectWorkspace,
  datasetCount = 0,
  isDatasetLoaded = false
}) => {
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const navItems = [
    {
      id: 'dataset',
      label: '1. Dataset Upload & Overview',
      icon: Database,
      desc: 'Corpus & Live Categorization'
    },
    {
      id: 'analyze',
      label: '2. Analyze a Tweet',
      icon: FileSearch,
      desc: 'Inference & Token Attribution'
    },
    {
      id: 'comparison',
      label: '3. Model Comparison',
      icon: GitCompare,
      desc: 'Generalization & Split Gap'
    },
    {
      id: 'trust',
      label: '4. Explanation Trust Check',
      icon: ShieldCheck,
      desc: 'Perturbation & Faithfulness'
    }
  ];

  return (
    <>
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen shrink-0 sticky top-0 select-none">
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 text-sm tracking-tight leading-tight">
                Disaster Tweet AI
              </h1>
              <p className="text-xs text-slate-500 font-medium">Explainer v1.2</p>
            </div>
          </div>

          {/* Workspaces Section */}
          <div className="px-3 py-4">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Workspaces
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeWorkspace === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectWorkspace(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-blue-50/80 text-blue-700 font-semibold shadow-xs border border-blue-200/60'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Info Box */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center space-x-2">
              {isDatasetLoaded ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-semibold text-slate-800">Models Active</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="text-[11px] font-semibold text-amber-800">Awaiting Dataset</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {isDatasetLoaded 
                ? 'DeBERTa-v3 & Linear SVM calibrated on crisis splits'
                : 'Upload CSV to trigger live classification pipeline'}
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] border-t border-slate-100 text-slate-500">
              <span className="font-mono text-[10px] text-slate-600">
                {isDatasetLoaded ? `${datasetCount.toLocaleString()} tweets` : '0 tweets'}
              </span>
              <button 
                onClick={() => setIsDocsOpen(true)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                <span>Paper Docs</span>
                <BookOpen className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Docs Modal */}
      <ResearchDocModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </>
  );
};
