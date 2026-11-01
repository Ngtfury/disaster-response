export type DisasterCategory = 'Flood' | 'Hurricane' | 'Wildfire' | 'Earthquake' | 'Explosion' | 'Accident' | 'Other' | 'Non-Disaster';

export type SeverityLevel = 'L0' | 'L1' | 'L2' | 'L3';

export type SplitRegime = 'random' | 'dhv';

export interface AttributionToken {
  id: string;
  word: string;
  cleanWord: string;
  score: number; // positive = pushes toward disaster/urgent, negative = away
  type: 'threat' | 'shortcut' | 'neutral';
  tooltip?: string;
}

export interface DisasterTweet {
  id: number | string;
  text: string;
  disasterType: DisasterCategory;
  severityLevel: SeverityLevel;
  urgencyLabel: string;
  eventName: string;
  keyword?: string;
  location?: string;
  isDisaster: boolean;
}

export interface PredictionResult {
  disasterType: DisasterCategory;
  confidence: number;
  matchesGroundTruth: boolean;
  severityLevel: SeverityLevel;
  urgencyLabel: string;
  triagePriority: string;
  triageRationale: string;
  entropy: number;
  secondaryProbabilities: {
    category: string;
    probability: number;
  }[];
  tokens: AttributionToken[];
  generalThreatWords: string[];
  shortcutWords: string[];
  topContributors: {
    token: string;
    score: number;
    type: 'threat' | 'shortcut';
  }[];
  generalizabilityScore: number;
  dhvPenalty: number;
}

export interface ModelBenchmark {
  id: string;
  eventName: string;
  sampleCount: number;
  overallGap: number;
  disasterAccuracy: {
    randomSplit: number;
    unseenDisaster: number;
    drop: number;
  };
  severityF1: {
    randomSplit: number;
    unseenDisaster: number;
    drop: number;
  };
  explanationTrust: {
    kendallTau: number;
    attributionStability: string;
    shiftDescription: string;
  };
  categoryPerformance: {
    category: DisasterCategory;
    randomSplit: number;
    unseenDisaster: number;
    gap: number;
  }[];
  coreVulnerabilityTakeaway: string;
  confusionMatrix: {
    labels: string[];
    matrix: number[][];
  };
}

export interface PerturbationState {
  tweetText: string;
  selectedDisaster: string;
  originalConfidence: number;
  currentConfidence: number;
  dropPercentage: number;
  faithfulnessScore: number;
  faithfulnessGrade: string;
  topWords: string[];
  removedWords: string[];
  removalSteps: {
    step: number;
    word: string;
    shap: number;
    ig: number;
    random: number;
  }[];
  insertionSteps: {
    step: number;
    word: string;
    shap: number;
    ig: number;
    random: number;
  }[];
}

