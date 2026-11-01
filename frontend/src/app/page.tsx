'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { AnalyzeTweetWorkspace } from '@/components/workspaces/AnalyzeTweetWorkspace';
import { ModelComparisonWorkspace } from '@/components/workspaces/ModelComparisonWorkspace';
import { ExplanationTrustWorkspace } from '@/components/workspaces/ExplanationTrustWorkspace';
import { DatasetWorkspace } from '@/components/workspaces/DatasetWorkspace';
import { AlertCircle, ArrowRight, Upload } from 'lucide-react';

export default function Home() {
  // Starts on dataset upload on initial localhost load, without preloaded data
  const [activeWorkspace, setActiveWorkspace] = useState<string>('dataset');
  const [selectedTweetForAnalysis, setSelectedTweetForAnalysis] = useState<string | undefined>(undefined);
  const [datasetCount, setDatasetCount] = useState<number>(0);
  const [isDatasetLoaded, setIsDatasetLoaded] = useState<boolean>(false);

  const getWorkspaceTitle = () => {
    switch (activeWorkspace) {
      case 'dataset':
        return 'Workspace 01 • Dataset Upload & Live Categorization';
      case 'analyze':
        return 'Workspace 02 • Tweet Diagnostic Studio';
      case 'comparison':
        return 'Workspace 03 • Model Comparison & Benchmark';
      case 'trust':
        return 'Workspace 04 • Explanation Trust Check';
      default:
        return 'Workspace';
    }
  };

  const handleSelectTweetForAnalysis = (text: string) => {
    setSelectedTweetForAnalysis(text);
    setActiveWorkspace('analyze');
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeWorkspace={activeWorkspace} 
        onSelectWorkspace={setActiveWorkspace}
        datasetCount={datasetCount}
        isDatasetLoaded={isDatasetLoaded}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar currentTitle={getWorkspaceTitle()} />

        {/* Global Reminder Banner when dataset is not yet uploaded */}
        {!isDatasetLoaded && activeWorkspace !== 'dataset' && (
          <div className="bg-amber-50 border-b border-amber-200 px-8 py-2.5 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>No dataset loaded yet:</strong> You are currently viewing offline baseline demos. Upload a CSV dataset to activate live cross-disaster validation.
              </span>
            </div>
            <button
              onClick={() => setActiveWorkspace('dataset')}
              className="inline-flex items-center space-x-1 font-bold text-blue-700 hover:text-blue-900 underline ml-4 shrink-0 cursor-pointer"
            >
              <span>Go to Dataset Upload</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Workspace Body */}
        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
          {activeWorkspace === 'dataset' && (
            <DatasetWorkspace 
              onSelectTweetForAnalysis={handleSelectTweetForAnalysis}
              onUpdateDatasetCount={setDatasetCount}
              onDatasetLoadedStateChange={setIsDatasetLoaded}
            />
          )}

          {activeWorkspace === 'analyze' && (
            <AnalyzeTweetWorkspace 
              key={selectedTweetForAnalysis || 'default'}
              initialTweetText={selectedTweetForAnalysis} 
            />
          )}

          {activeWorkspace === 'comparison' && (
            <ModelComparisonWorkspace />
          )}

          {activeWorkspace === 'trust' && (
            <ExplanationTrustWorkspace />
          )}
        </main>
      </div>
    </div>
  );
}
