export type EdgeKind = "demands" | "supplies";

export interface CircleNodeData {
  label: string;
  [key: string]: unknown;
}

export interface EconEdgeData {
  kind: EdgeKind;
  [key: string]: unknown;
}
