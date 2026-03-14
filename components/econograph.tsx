"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { CircleNodeData, EdgeKind, EconEdgeData, SaveFile } from "@/lib/types";
import CircleNode from "@/components/circle-node";
import Toolbar from "@/components/toolbar";
import EdgeTypePicker from "@/components/edge-type-picker";

const nodeTypes = { circle: CircleNode };

const EDGE_COLORS: Record<EdgeKind, string> = {
  demands: "#ea580c",
  supplies: "#2563eb",
};

const LOCAL_STORAGE_KEY = "econograph-state";

function loadFromLocalStorage(): { nodes: Node<CircleNodeData>[]; edges: Edge<EconEdgeData>[]; nextId: number } | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const saveData = JSON.parse(raw) as SaveFile;
    if (saveData.version !== 1) return null;

    const nodes = saveData.nodes.map((n) => ({
      id: n.id,
      type: "circle" as const,
      position: n.position,
      data: n.data,
    }));
    const edges = saveData.edges.map((e) => {
      const kind = e.data.kind;
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        style: { stroke: EDGE_COLORS[kind], strokeWidth: 2 },
        data: e.data,
      } as Edge<EconEdgeData>;
    });

    const maxId = saveData.nodes.reduce((max, n) => {
      const num = parseInt(n.id.replace("node-", ""), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);

    return { nodes, edges, nextId: maxId + 1 };
  } catch {
    return null;
  }
}

function saveToLocalStorage(nodes: Node<CircleNodeData>[], edges: Edge<EconEdgeData>[]) {
  const saveData: SaveFile = {
    version: 1,
    nodes: nodes.map((n) => ({
      id: n.id,
      position: n.position,
      data: n.data,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label as string | undefined,
      data: e.data!,
    })),
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saveData));
}

function Flow() {
  const cached = useRef(loadFromLocalStorage());
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CircleNodeData>>(
    cached.current?.nodes ?? []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EconEdgeData>>(
    cached.current?.edges ?? []
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
  const nodeIdCounter = useRef(cached.current?.nextId ?? 1);

  const hasSelection =
    nodes.some((n) => n.selected) || edges.some((e) => e.selected);

  useEffect(() => {
    saveToLocalStorage(nodes, edges);
  }, [nodes, edges]);

  const handleAddNode = useCallback(
    (name: string) => {
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
          data: { label: name },
        },
      ]);
    },
    [setNodes]
  );

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

  const handleSave = useCallback(() => {
    const saveData: SaveFile = {
      version: 1,
      nodes: nodes.map((n) => ({
        id: n.id,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label as string | undefined,
        data: e.data!,
      })),
    };
    const blob = new Blob([JSON.stringify(saveData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "econograph.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const handleLoad = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const saveData = JSON.parse(e.target?.result as string) as SaveFile;
          if (saveData.version !== 1) return;

          setNodes(
            saveData.nodes.map((n) => ({
              id: n.id,
              type: "circle" as const,
              position: n.position,
              data: n.data,
            }))
          );
          setEdges(
            saveData.edges.map((e) => {
              const kind = e.data.kind;
              return {
                id: e.id,
                source: e.source,
                target: e.target,
                label: e.label,
                style: { stroke: EDGE_COLORS[kind], strokeWidth: 2 },
                data: e.data,
              } as Edge<EconEdgeData>;
            })
          );

          // Update counter to avoid ID collisions
          const maxId = saveData.nodes.reduce((max, n) => {
            const num = parseInt(n.id.replace("node-", ""), 10);
            return isNaN(num) ? max : Math.max(max, num);
          }, 0);
          nodeIdCounter.current = maxId + 1;
        } catch {
          // Invalid file, ignore
        }
      };
      reader.readAsText(file);
    },
    [setNodes, setEdges]
  );

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
        connectionMode={ConnectionMode.Loose}
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
        onSave={handleSave}
        onLoad={handleLoad}
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
