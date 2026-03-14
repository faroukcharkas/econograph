"use client";

import { useEffect, useRef, useState } from "react";

interface ToolbarProps {
  onAddNode: (name: string) => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
  onSave: () => void;
  onLoad: (file: File) => void;
}

export default function Toolbar({
  onAddNode,
  onDeleteSelected,
  hasSelection,
  onSave,
  onLoad,
}: ToolbarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  const handleSubmit = () => {
    if (name.trim()) {
      onAddNode(name.trim());
    }
    setName("");
    setIsAdding(false);
  };

  const handleCancel = () => {
    setName("");
    setIsAdding(false);
  };

  return (
    <div className="fixed top-4 left-4 z-30 flex gap-2">
      {isAdding ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex gap-1.5"
        >
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") handleCancel();
            }}
            placeholder="Node name"
            className="w-40 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-md outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="rounded-lg border border-blue-500 bg-blue-500 px-3 py-2 text-sm font-medium text-white shadow-md hover:bg-blue-600 disabled:opacity-40"
          >
            Add
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-500 shadow-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md hover:bg-gray-50"
        >
          + Add Node
        </button>
      )}
      {hasSelection && (
        <button
          onClick={onDeleteSelected}
          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-md hover:bg-red-50"
        >
          Delete
        </button>
      )}
      <div className="ml-2 flex gap-2 border-l border-gray-300 pl-4">
        <button
          onClick={onSave}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md hover:bg-gray-50"
        >
          Save
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md hover:bg-gray-50"
        >
          Load
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onLoad(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
