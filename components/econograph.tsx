"use client";

import { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { CircleNodeData, EdgeKind, EconEdgeData } from "@/lib/types";
import CircleNode from "@/components/circle-node";
import Toolbar from "@/components/toolbar";
import EdgeTypePicker from "@/components/edge-type-picker";

const nodeTypes = { circle: CircleNode };

const EDGE_COLORS: Record<EdgeKind, string> = {
  demands: "#ea580c",
  supplies: "#2563eb",
};

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CircleNodeData>>(
    []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EconEdgeData>>(
    []
  );
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(
    null
  );
  const [pickerPos, setPickerPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const reactFlowInstance = useRef<ReactFlowInstance<
    Node<CircleNodeData>,
    Edge<EconEdgeData>
  > | null>(null);
  const nodeIdCounter = useRef(1);

  const hasSelection =
    nodes.some((n) => n.selected) || edges.some((e) => e.selected);

  const handleAddNode = useCallback(() => {
    const name = prompt("Node name:");
    if (!name?.trim()) return;

    const id = `node-${nodeIdCounter.current++}`;
    const viewport = reactFlowInstance.current?.getViewport();
    const x = (-((viewport?.x ?? 0) - 300)) / (viewport?.zoom ?? 1);
    const y = (-((viewport?.y ?? 0) - 200)) / (viewport?.zoom ?? 1);

    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "circle",
        position: { x, y },
        data: { label: name.trim() },
      },
    ]);
  }, [setNodes]);

  const handleConnect = useCallback(
    (connection: Connection) => {
      setPendingConnection(connection);
      // Position picker at midpoint of viewport
      setPickerPos({ x: window.innerWidth / 2 - 60, y: window.innerHeight / 2 - 50 });
    },
    []
  );

  const handleEdgeTypeSelect = useCallback(
    (kind: EdgeKind) => {
      if (!pendingConnection) return;

      const newEdge: Edge<EconEdgeData> = {
        ...pendingConnection,
        id: `edge-${pendingConnection.source}-${pendingConnection.target}-${kind}`,
        label: kind,
        style: { stroke: EDGE_COLORS[kind], strokeWidth: 2 },
        data: { kind },
      } as Edge<EconEdgeData>;

      setEdges((eds) => addEdge(newEdge, eds));
      setPendingConnection(null);
      setPickerPos(null);
    },
    [pendingConnection, setEdges]
  );

  const handleCancelPicker = useCallback(() => {
    setPendingConnection(null);
    setPickerPos(null);
  }, []);

  const handleDeleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  }, [setNodes, setEdges]);

  return (
    <div className="h-screen w-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
        }}
        nodeTypes={nodeTypes}
        deleteKeyCode="Delete"
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      <Toolbar
        onAddNode={handleAddNode}
        onDeleteSelected={handleDeleteSelected}
        hasSelection={hasSelection}
      />
      {pickerPos && (
        <EdgeTypePicker
          position={pickerPos}
          onSelect={handleEdgeTypeSelect}
          onCancel={handleCancelPicker}
        />
      )}
    </div>
  );
}

export default function Econograph() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
