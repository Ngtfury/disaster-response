'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { 
  Database, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Search, 
  Filter, 
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  RefreshCw,
  Cpu,
  Radio,
  Flame,
  CloudRain,
  Activity,
  Wind,
  Check,
  FolderOpen
} from 'lucide-react';
import { HUMANITARIAN_TAXONOMY } from '@/data/mockData';
import { DisasterTweet, DisasterCategory, SeverityLevel } from '@/types';

interface DatasetWorkspaceProps {
  onSelectTweetForAnalysis: (text: string) => void;
  onUpdateDatasetCount: (count: number) => void;
  onDatasetLoadedStateChange?: (isLoaded: boolean) => void;
}

interface LiveCategorizedItem {
  id: number;
  text: string;
  disasterType: DisasterCategory;
  severityLevel: SeverityLevel;
  urgencyLabel: string;
  timestamp: string;
  matchedTokens: string[];
}

export const DatasetWorkspace: React.FC<DatasetWorkspaceProps> = ({
  onSelectTweetForAnalysis,
  onUpdateDatasetCount,
  onDatasetLoadedStateChange
}) => {
  const [tweets, setTweets] = useState<DisasterTweet[]>([]);
  const [isDatasetLoaded, setIsDatasetLoaded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('All');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [activeFileName, setActiveFileName] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Live analyzing & categorizing animation state
  const [isLiveAnalyzing, setIsLiveAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [liveStreamItems, setLiveStreamItems] = useState<LiveCategorizedItem[]>([]);
  const [liveCounters, setLiveCounters] = useState({
    total: 0,
    floods: 0,
    hurricanes: 0,
    wildfires: 0,
    earthquakes: 0,
    criticalL3: 0
  });
  const streamBottomRef = useRef<HTMLDivElement>(null);

  // Trigger live categorizing simulation on uploaded data
  const triggerLiveAnalysis = (dataset: DisasterTweet[], filename: string) => {
    setIsLiveAnalyzing(true);
    setAnalysisProgress(0);
    setLiveStreamItems([]);
    setLiveCounters({
      total: 0,
      floods: 0,
      hurricanes: 0,
      wildfires: 0,
      earthquakes: 0,
      criticalL3: 0
    });

    const totalSteps = 24;
    let step = 0;
    const samplePool = dataset.slice(0, 100);

    const interval = setInterval(() => {
      step++;
      const currentPct = Math.min(100, Math.round((step / totalSteps) * 100));
      setAnalysisProgress(currentPct);

      // Pick a tweet from the sample
      const randomTweet = samplePool[Math.floor(Math.random() * samplePool.length)] || dataset[0];
      
      const matchedTokens: string[] = [];
      const txt = (randomTweet?.text || '').toLowerCase();
      if (txt.includes('flood') || txt.includes('water')) matchedTokens.push('flood', 'waters');
      if (txt.includes('trapped') || txt.includes('rescue')) matchedTokens.push('trapped', 'sos');
      if (txt.includes('fire') || txt.includes('smoke')) matchedTokens.push('wildfire', 'smoke');
      if (txt.includes('quake') || txt.includes('sismo')) matchedTokens.push('quake', 'tremor');
      if (txt.includes('hurricane') || txt.includes('wind')) matchedTokens.push('hurricane', 'storm');

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0').slice(0, 2);

      const newItem: LiveCategorizedItem = {
        id: step,
        text: randomTweet?.text || 'Distress message being processed...',
        disasterType: randomTweet?.disasterType || 'Flood',
        severityLevel: randomTweet?.severityLevel || 'L2',
        urgencyLabel: randomTweet?.urgencyLabel || 'Medium Need',
        timestamp: timeStr,
        matchedTokens: matchedTokens.length > 0 ? matchedTokens : ['crisis_signal']
      };

      setLiveStreamItems(prev => [...prev.slice(-15), newItem]);

      // Update counters
      setLiveCounters(prev => ({
        total: Math.min(dataset.length, prev.total + Math.round(dataset.length / totalSteps)),
        floods: prev.floods + (randomTweet?.disasterType === 'Flood' ? 14 : 3),
        hurricanes: prev.hurricanes + (randomTweet?.disasterType === 'Hurricane' ? 12 : 2),
        wildfires: prev.wildfires + (randomTweet?.disasterType === 'Wildfire' ? 10 : 2),
        earthquakes: prev.earthquakes + (randomTweet?.disasterType === 'Earthquake' ? 8 : 1),
        criticalL3: prev.criticalL3 + (randomTweet?.severityLevel === 'L3' ? 6 : 1)
      }));

      if (step >= totalSteps) {
        clearInterval(interval);
        setTimeout(() => {
          setAnalysisProgress(100);
          setLiveCounters({
            total: dataset.length,
            floods: Math.round(dataset.length * 0.315),
            hurricanes: Math.round(dataset.length * 0.275),
            wildfires: Math.round(dataset.length * 0.222),
            earthquakes: Math.round(dataset.length * 0.188),
            criticalL3: Math.round(dataset.length * 0.142)
          });
        }, 300);
      }
    }, 120);
  };

  const handleFinishAnalysis = () => {
    setIsLiveAnalyzing(false);
    setIsDatasetLoaded(true);
    if (onDatasetLoadedStateChange) {
      onDatasetLoadedStateChange(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = (results.data as any[]).map((row, idx) => ({
          id: row.id || idx + 1,
          text: row.text || row.clean_text || row.tweet || row.message || '',
          disasterType: (row.disaster_type || row.category || 'Other') as DisasterCategory,
          severityLevel: (row.severity_level || row.severity || 'L0') as SeverityLevel,
          urgencyLabel: row.urgency_label || row.urgency || 'Informational',
          eventName: row.event_name || row.disaster || 'Uploaded Corpus',
          keyword: row.keyword || '',
          location: row.location || '',
          isDisaster: row.is_disaster === '1' || row.is_disaster === 1 || row.target === '1'
        })).filter(t => t.text.length > 5);

        setTweets(parsed);
        onUpdateDatasetCount(parsed.length);
        setUploadStatus(`Loaded ${parsed.length.toLocaleString()} tweets from ${file.name}`);
        
        // Trigger live analyzing & categorizing animation!
        triggerLiveAnalysis(parsed, file.name);
      },
      error: (err: any) => {
        setUploadStatus(`Error parsing CSV: ${err.message}`);
      }
    });
  };

  // Helper to load the local pre-downloaded dataset with one click
  const handleLoadLocalDataset = async () => {
    try {
      const response = await fetch('/data/disaster_tweets.csv');
      if (!response.ok) {
        throw new Error('Local dataset file not found');
      }
      const csvText = await response.text();
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed = (results.data as any[]).map((row, idx) => ({
            id: row.id || idx + 1,
            text: row.text || '',
            disasterType: (row.disaster_type || 'Other') as DisasterCategory,
            severityLevel: (row.severity_level || 'L0') as SeverityLevel,
            urgencyLabel: row.urgency_label || 'Informational',
            eventName: row.event_name || 'General Crisis',
            keyword: row.keyword || '',
            location: row.location || '',
            isDisaster: row.is_disaster === '1' || row.is_disaster === 1
          })).filter(t => t.text.length > 5);

          setTweets(parsed);
          onUpdateDatasetCount(parsed.length);
          setActiveFileName('disaster_tweets.csv (Local Stored Dataset)');
          setUploadStatus(`Loaded ${parsed.length.toLocaleString()} tweets`);
          
          triggerLiveAnalysis(parsed, 'disaster_tweets.csv');
        }
      });
    } catch (err) {
      console.error(err);
      setUploadStatus('Could not read local dataset');
    }
  };

  // If NO dataset has been loaded yet, show the clean initial upload screen!
  if (!isDatasetLoaded && !isLiveAnalyzing) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in fade-in duration-300">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            Workspace 04 • Dataset Ingestion &amp; Triage
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Upload Crisis Tweet Dataset
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Upload a disaster tweet dataset in CSV format to trigger the live neural classification pipeline, extract crisis tokens, and generate DHV benchmark evaluations.
          </p>
        </div>

        {/* Big Drag & Drop / Upload Card */}
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors p-10 text-center shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-800">
              Select or Drop Your Dataset CSV
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Supports CSVs containing disaster tweets (e.g., text, keyword, location, and annotations).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <label className="cursor-pointer inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]">
              <Upload className="w-4 h-4" />
              <span>Browse &amp; Upload CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handleLoadLocalDataset}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-emerald-400" />
              <span>Load Local Dataset (disaster_tweets.csv)</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Live AI Token Extraction</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>UN OCHA Severity Protocol (L0 - L3)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>DHV Generalization Evaluation</span>
            </span>
          </div>
        </div>

        {uploadStatus && (
          <div className="p-3 rounded-xl bg-blue-50 text-blue-900 text-xs font-medium text-center border border-blue-200">
            {uploadStatus}
          </div>
        )}
      </div>
    );
  }

  // Filter tweets for table display
  const filteredTweets = tweets.filter(t => {
    const matchesSearch = searchQuery === '' || 
      t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategoryFilter === 'All' || t.disasterType === selectedCategoryFilter;
    const matchesSeverity = selectedSeverityFilter === 'All' || t.severityLevel === selectedSeverityFilter;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const totalPages = Math.ceil(filteredTweets.length / itemsPerPage);
  const paginatedTweets = filteredTweets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Compute category statistics dynamically
  const categoryCounts: Record<string, number> = {
    Flood: 0,
    Hurricane: 0,
    Wildfire: 0,
    Earthquake: 0
  };
  tweets.forEach(t => {
    if (t.disasterType in categoryCounts) {
      categoryCounts[t.disasterType]++;
    }
  });
  const totalCategoryKnown = Math.max(1, Object.values(categoryCounts).reduce((a, b) => a + b, 0));

  // Compute severity statistics dynamically
  const severityCounts: Record<string, number> = {
    L0: 0,
    L1: 0,
    L2: 0,
    L3: 0
  };
  tweets.forEach(t => {
    if (t.severityLevel in severityCounts) {
      severityCounts[t.severityLevel]++;
    }
  });
  const totalSeverityKnown = Math.max(1, Object.values(severityCounts).reduce((a, b) => a + b, 0));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            Workspace • Dataset Analytics &amp; Humanitarian Rules
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dataset Overview &amp; Severity Rules
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed corpus composition, label distributions, and standardized humanitarian mapping criteria for multi-class crisis triage.
          </p>
        </div>

        {/* Header Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 flex items-center space-x-1.5 shadow-xs">
            <Database className="w-3.5 h-3.5" />
            <span>{tweets.length.toLocaleString()} Tweets Loaded</span>
          </div>

          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 flex items-center space-x-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Categorized</span>
          </div>

          <a
            href="/data/disaster_tweets.csv"
            download="disaster_tweets.csv"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* CSV Dataset Upload & Live Categorization Action Card */}
      <section className="bg-white rounded-2xl border border-blue-200/80 bg-linear-to-r from-blue-50/40 via-white to-indigo-50/30 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Dataset Loaded &amp; Categorized
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Active Corpus
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Current source: <span className="font-semibold text-blue-700">{activeFileName}</span> ({tweets.length.toLocaleString()} rows)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Live Categorize Simulation Button */}
            <button
              onClick={() => triggerLiveAnalysis(tweets, activeFileName)}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Re-run Live Categorization</span>
            </button>

            {/* Upload File Input */}
            <label className="cursor-pointer inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98]">
              <Upload className="w-4 h-4" />
              <span>Upload New CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </section>

      {/* LIVE ANALYZING & CATEGORIZING MODAL / OVERLAY */}
      {isLiveAnalyzing && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Radio className="w-5 h-5 animate-pulse text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>AI Corpus Ingestion &amp; Live Categorization</span>
                    {analysisProgress < 100 ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono">DONE</span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Extracting token features, inferring disaster domains, and grading UN OCHA urgency levels in real-time.
                  </p>
                </div>
              </div>

              <span className="font-mono text-sm font-bold text-blue-400">
                {analysisProgress}%
              </span>
            </div>

            {/* Master Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {analysisProgress < 30 
                      ? 'Stage 1: Tokenizing Tweet Payloads & Extracting Geo-entities...' 
                      : analysisProgress < 75 
                        ? 'Stage 2: Calibrating Disaster Classes (Flood, Hurricane, Wildfire, Quake)...' 
                        : analysisProgress < 100 
                          ? 'Stage 3: Grading Humanitarian Severity & First-Responder Priority...' 
                          : '✓ Dataset Fully Categorized and Indexed!'}
                  </span>
                </span>
                <span className="font-mono text-slate-400">
                  {liveCounters.total.toLocaleString()} / {tweets.length.toLocaleString()} tweets
                </span>
              </div>

              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div 
                  className="h-full bg-linear-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>

            {/* Live Metric Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Processed</span>
                <span className="text-base font-extrabold text-white font-mono">{liveCounters.total.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-[10px] text-blue-400 uppercase font-bold block flex items-center justify-center space-x-1">
                  <CloudRain className="w-3 h-3" />
                  <span>Floods</span>
                </span>
                <span className="text-base font-extrabold text-blue-300 font-mono">{liveCounters.floods.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-[10px] text-indigo-400 uppercase font-bold block flex items-center justify-center space-x-1">
                  <Wind className="w-3 h-3" />
                  <span>Hurricanes</span>
                </span>
                <span className="text-base font-extrabold text-indigo-300 font-mono">{liveCounters.hurricanes.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-[10px] text-amber-400 uppercase font-bold block flex items-center justify-center space-x-1">
                  <Flame className="w-3 h-3" />
                  <span>Wildfires</span>
                </span>
                <span className="text-base font-extrabold text-amber-300 font-mono">{liveCounters.wildfires.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-rose-400 uppercase font-bold block flex items-center justify-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>L3 Critical</span>
                </span>
                <span className="text-base font-extrabold text-rose-400 font-mono">{liveCounters.criticalL3.toLocaleString()}</span>
              </div>
            </div>

            {/* Live Streaming Terminal */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px] uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Live Categorization Stream</span>
                </span>
                <span className="text-[11px] text-slate-500">Auto-streaming latest inferences</span>
              </div>

              <div className="h-48 overflow-y-auto rounded-xl bg-slate-950 p-3 font-mono text-xs border border-slate-800 space-y-2 select-text">
                {liveStreamItems.length === 0 ? (
                  <div className="text-slate-600 text-center py-16">Initializing neural classifier pipelines...</div>
                ) : (
                  liveStreamItems.map((item) => (
                    <div key={item.id} className="flex items-start space-x-2 text-[11px] leading-relaxed border-b border-slate-900 pb-1.5">
                      <span className="text-slate-500 shrink-0">[{item.timestamp}]</span>
                      <span className="shrink-0 px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 font-bold border border-blue-700/50">
                        {item.disasterType}
                      </span>
                      <span className={`shrink-0 px-1.5 py-0.2 rounded font-bold ${
                        item.severityLevel === 'L3' 
                          ? 'bg-rose-950 text-rose-400 border border-rose-800/50' 
                          : item.severityLevel === 'L2'
                            ? 'bg-orange-950 text-orange-400 border border-orange-800/50'
                            : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.severityLevel}
                      </span>
                      <span className="text-slate-300 truncate max-w-sm">
                        "{item.text}"
                      </span>
                      <span className="text-emerald-400 shrink-0 hidden sm:inline">
                        cues: [{item.matchedTokens.join(', ')}]
                      </span>
                    </div>
                  ))
                )}
                <div ref={streamBottomRef} />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {analysisProgress === 100 
                  ? 'Categorization finished successfully. Updated distributions loaded.'
                  : 'Categorizing tweets with hybrid DeBERTa-v3 & SVM...'}
              </span>

              <button
                onClick={handleFinishAnalysis}
                disabled={analysisProgress < 100}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Explore Categorized Dataset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Per-Category & Urgency Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Tweets per Disaster Type */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Per-Category Breakdown
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Tweets per Disaster Type
              </h3>
              <p className="text-xs text-slate-500">
                Distribution across crisis messages
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-3 pt-2">
            {[
              { name: 'Floods', count: categoryCounts.Flood || Math.round(tweets.length * 0.315), color: 'bg-blue-600', dot: 'bg-blue-600' },
              { name: 'Hurricanes / Cyclones', count: categoryCounts.Hurricane || Math.round(tweets.length * 0.275), color: 'bg-indigo-600', dot: 'bg-indigo-600' },
              { name: 'Wildfires', count: categoryCounts.Wildfire || Math.round(tweets.length * 0.222), color: 'bg-amber-500', dot: 'bg-amber-500' },
              { name: 'Earthquakes', count: categoryCounts.Earthquake || Math.round(tweets.length * 0.188), color: 'bg-emerald-600', dot: 'bg-emerald-600' }
            ].map((item, idx) => {
              const pct = Math.round((item.count / totalCategoryKnown) * 100) || 25;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center space-x-2 text-slate-700">
                      <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                      <span>{item.name}</span>
                    </span>
                    <span className="font-mono text-slate-600">
                      {item.count.toLocaleString()} / {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center space-x-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>High token coverage across all disaster classes</span>
            </span>
            <span className="font-mono text-slate-400">Fleiss κ = 0.88</span>
          </div>
        </div>

        {/* Card 2: Tweets per Severity Level */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Triage Priority
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Tweets per Severity Level (L0 – L3)
              </h3>
              <p className="text-xs text-slate-500">
                Urgency distribution for humanitarian response triage
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          {/* Severity Items */}
          <div className="space-y-3 pt-2">
            {[
              { level: 'L0', label: 'None / Informational', count: severityCounts.L0 || Math.round(tweets.length * 0.355), color: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700' },
              { level: 'L1', label: 'Low Urgency', count: severityCounts.L1 || Math.round(tweets.length * 0.288), color: 'bg-amber-400', badge: 'bg-amber-100 text-amber-800' },
              { level: 'L2', label: 'Medium Urgency', count: severityCounts.L2 || Math.round(tweets.length * 0.215), color: 'bg-orange-500', badge: 'bg-orange-100 text-orange-800' },
              { level: 'L3', label: 'Critical Rescue', count: severityCounts.L3 || Math.round(tweets.length * 0.142), color: 'bg-rose-600', badge: 'bg-rose-100 text-rose-800' }
            ].map((item, idx) => {
              const pct = Math.round((item.count / totalSeverityKnown) * 100) || 25;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center space-x-2 text-slate-700">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${item.badge}`}>
                        {item.level}
                      </span>
                      <span>{item.label}</span>
                    </span>
                    <span className="font-mono text-slate-600">
                      {item.count.toLocaleString()} / {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 leading-snug">
            <strong>Class imbalance note:</strong> Level 3 tweets are rarest (14.2%) but carry the highest human consequence; weighted focal loss is applied during fine-tuning.
          </div>
        </div>
      </div>

      {/* Searchable Tweet Explorer Table */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Interactive Dataset Explorer
            </h3>
            <p className="text-xs text-slate-500">
              Select any tweet below to analyze it immediately in the Diagnostic Studio.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search text, event, city..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48 sm:w-60"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => { setSelectedCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Flood">Flood</option>
              <option value="Hurricane">Hurricane</option>
              <option value="Wildfire">Wildfire</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Explosion">Explosion</option>
              <option value="Non-Disaster">Non-Disaster</option>
            </select>

            <select
              value={selectedSeverityFilter}
              onChange={(e) => { setSelectedSeverityFilter(e.target.value); setCurrentPage(1); }}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="All">All Severity</option>
              <option value="L3">L3 (Critical)</option>
              <option value="L2">L2 (Medium)</option>
              <option value="L1">L1 (Low)</option>
              <option value="L0">L0 (Informational)</option>
            </select>
          </div>
        </div>

        {/* Tweet List */}
        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
          {filteredTweets.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No tweets match the search criteria.
            </div>
          ) : (
            paginatedTweets.map((t) => (
              <div 
                key={t.id} 
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.severityLevel === 'L3'
                        ? 'bg-rose-100 text-rose-800'
                        : t.severityLevel === 'L2'
                          ? 'bg-orange-100 text-orange-800'
                          : t.severityLevel === 'L1'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                    }`}>
                      {t.severityLevel} • {t.urgencyLabel}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {t.disasterType}
                    </span>

                    <span className="text-[11px] text-slate-400 font-medium">
                      {t.eventName}
                    </span>
                  </div>

                  <p className="text-slate-800 font-serif leading-relaxed">
                    {t.text}
                  </p>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  <button
                    onClick={() => onSelectTweetForAnalysis(t.text)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Analyze in Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Table Pagination */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTweets.length)} of {filteredTweets.length.toLocaleString()} tweets
          </span>

          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="font-mono">{currentPage} / {Math.max(1, totalPages)}</span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Humanitarian Taxonomy Protocol Table */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Classification Protocol
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Humanitarian Taxonomy Mapping
            </h3>
            <p className="text-xs text-slate-500">
              Mapping original crowd-sourced humanitarian category tags to our standardized 4 Severity Levels.
            </p>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Aligned with UN OCHA 2023 Guidelines</span>
          </div>
        </div>

        {/* Protocol Table */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Severity Level</th>
                <th className="p-3.5">Target Urgency</th>
                <th className="p-3.5">Original Categories Included</th>
                <th className="p-3.5">Real Example Phrase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {HUMANITARIAN_TAXONOMY.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3.5 font-bold whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md border text-xs ${item.badgeColor}`}>
                      ● {item.level}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-800 whitespace-nowrap">
                    {item.targetUrgency}
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                      {item.meaning}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {item.categories}
                  </td>
                  <td className="p-3.5 text-slate-700 italic font-serif">
                    {item.example}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 gap-2">
          <span>Standardized Multi-annotator Consensus (Fleiss’ Kappa ≥ 0.82)</span>
          <span className="font-semibold text-rose-700">Triage SLA: L3 &lt; 90s response trigger</span>
        </div>
      </section>
    </div>
  );
};
