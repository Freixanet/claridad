export type TopicKind = 'work' | 'shopping' | 'ideas' | 'project';

export type FragmentConfidence = 'high' | 'doubt';

export interface DetectedFragment {
  id: string;
  text: string;
  confidence: FragmentConfidence;
  order: number;
}

export interface TopicGroup {
  id: string;
  kind: TopicKind;
  title: string;
  fragments: DetectedFragment[];
}

export interface ClaridadDocument {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  topicCount: number;
  fragmentCount: number;
  topics: TopicGroup[];
}

export interface ProcessingStep {
  id: string;
  label: string;
  completed: boolean;
}
