"use client";

import { useCallback, useRef, useState } from "react";
import {
  Handle,
  Position,
  useConnection,
  type NodeProps,
  type Node,
} from "@xyflow/react";
import type { CircleNodeData } from "@/lib/types";

const RADIUS = 40; // half of w-20 (80px)
const BORDER_THRESHOLD = 20; // how close to the edge the cursor must be (extends beyond circle)

export default function CircleNode({
  id,
  data,
  selected,
}: NodeProps<Node<CircleNodeData>>) {
  const ref = useRef<HTMLDivElement>(null);
  const [handlePos, setHandlePos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const connection = useConnection();
  const isTarget =
    connection.inProgress && connection.fromNode?.id !== id;

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < RADIUS + BORDER_THRESHOLD && dist > RADIUS - BORDER_THRESHOLD) {
      // Snap to the circle perimeter
      const angle = Math.atan2(dy, dx);
      const x = RADIUS + Math.cos(angle) * RADIUS;
      const y = RADIUS + Math.sin(angle) * RADIUS;
      setHandlePos({ x, y });
    } else {
      setHandlePos(null);
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    setHandlePos(null);
  }, []);

  // When another node is dragging a connection toward us, show a target
  // handle at the closest border point based on the from-handle position.
  const targetPos = isTarget ? computeTargetPos(connection) : null;

  const showSource = handlePos && !connection.inProgress;
  const showTarget = isTarget && targetPos;

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative flex items-center justify-center"
      style={{ width: RADIUS * 2 + 16, height: RADIUS * 2 + 16, padding: 8 }}
    >
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full border-2 bg-white text-center text-xs font-semibold shadow-md select-none ${
          selected ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-400"
        }`}
      >
        <span className="max-w-14 overflow-hidden text-ellipsis leading-tight text-gray-800">
          {data.label}
        </span>
      </div>

      {/* Source handle – visible when hovering near border */}
      {showSource && (
        <Handle
          type="source"
          position={Position.Top}
          id="dynamic-source"
          className="!h-3 !w-3 !border-2 !border-white !bg-blue-500"
          style={{
            position: "absolute",
            left: handlePos.x + 8,
            top: handlePos.y + 8,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* Target handle – visible when a connection is being dragged toward this node */}
      {showTarget && (
        <Handle
          type="target"
          position={Position.Top}
          id="dynamic-target"
          className="!h-3 !w-3 !border-2 !border-white !bg-blue-500"
          style={{
            position: "absolute",
            left: targetPos.x + 8,
            top: targetPos.y + 8,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* Hidden fallback target handle so React Flow can always complete a connection */}
      <Handle
        type="target"
        position={Position.Top}
        id="fallback-target"
        className="!h-0 !w-0 !border-0 !bg-transparent"
        style={{
          opacity: 0,
          pointerEvents: isTarget ? "auto" : "none",
          left: RADIUS + 8,
          top: 8,
        }}
      />
    </div>
  );
}

function computeTargetPos(connection: { fromNode: any; toNode: any }) {
  // Use fromHandle position to figure out a reasonable angle
  // Default to top center
  const fromNode = connection.fromNode;
  const fromX = (fromNode?.internals?.positionAbsolute?.x ?? 0) + (fromNode?.measured?.width ?? 0) / 2;
  const fromY = (fromNode?.internals?.positionAbsolute?.y ?? 0) + (fromNode?.measured?.height ?? 0) / 2;

  const toNode = connection.toNode;
  if (!toNode) return { x: RADIUS, y: 0 };
  const toX = (toNode.internals?.positionAbsolute?.x ?? 0) + (toNode.measured?.width ?? 0) / 2;
  const toY = (toNode.internals?.positionAbsolute?.y ?? 0) + (toNode.measured?.height ?? 0) / 2;

  const dx = fromX - toX;
  const dy = fromY - toY;
  const angle = Math.atan2(dy, dx);

  return {
    x: RADIUS + Math.cos(angle) * RADIUS,
    y: RADIUS + Math.sin(angle) * RADIUS,
  };
}
