export type EdgeKind = "demands" | "supplies";

export interface CircleNodeData {
  label: string;
  [key: string]: unknown;
}

export interface EconEdgeData {
  kind: EdgeKind;
  [key: string]: unknown;
}

export interface SaveFile {
  version: 1;
  nodes: Array<{
    id: string;
    position: { x: number; y: number };
    data: CircleNodeData;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    data: EconEdgeData;
  }>;
}
