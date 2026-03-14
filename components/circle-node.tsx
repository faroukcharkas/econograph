"use client";

import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { CircleNodeData } from "@/lib/types";

export default function CircleNode({
  data,
  selected,
}: NodeProps<Node<CircleNodeData>>) {
  return (
    <div
      className={`flex h-20 w-20 items-center justify-center rounded-full border-2 bg-white text-center text-xs font-semibold shadow-md select-none ${
        selected ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-400"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-gray-500"
      />
      <span className="max-w-14 overflow-hidden text-ellipsis leading-tight text-gray-800">
        {data.label}
      </span>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-gray-500"
      />
    </div>
  );
}
