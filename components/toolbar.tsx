"use client";

interface ToolbarProps {
  onAddNode: () => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
}

export default function Toolbar({
  onAddNode,
  onDeleteSelected,
  hasSelection,
}: ToolbarProps) {
  return (
    <div className="fixed top-4 left-4 z-30 flex gap-2">
      <button
        onClick={onAddNode}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md hover:bg-gray-50"
      >
        + Add Node
      </button>
      {hasSelection && (
        <button
          onClick={onDeleteSelected}
          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-md hover:bg-red-50"
        >
          Delete
        </button>
      )}
    </div>
  );
}
