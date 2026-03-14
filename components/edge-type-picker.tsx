"use client";

import type { EdgeKind } from "@/lib/types";

interface EdgeTypePickerProps {
  position: { x: number; y: number };
  onSelect: (kind: EdgeKind) => void;
  onCancel: () => void;
}

export default function EdgeTypePicker({
  position,
  onSelect,
  onCancel,
}: EdgeTypePickerProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onCancel} />
      <div
        className="fixed z-50 flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-xl"
        style={{ left: position.x, top: position.y }}
      >
        <h6 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
          Relationship
        </h6>
        <button
          onClick={() => onSelect("demands")}
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-50"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
          Demands
        </button>
        <button
          onClick={() => onSelect("supplies")}
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          Supplies
        </button>
      </div>
    </>
  );
}
