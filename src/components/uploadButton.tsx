"use client";

import { useRef, useState, ChangeEvent } from "react";
import { Image as ImageIcon, X } from "lucide-react";

interface UploadButtonProps {
  onFileSelect: (file: File | null) => void;
}

export default function UploadButton({ onFileSelect }: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleButtonClick = () => {
    // Programmatically trigger the hidden file input
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    } else {
      setFileName(null);
      onFileSelect(null);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop the click from opening the file picker again
    setFileName(null);
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <button
        type="button"
        onClick={handleButtonClick}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all border ${
          fileName 
            ? "bg-green-50 text-green-700 border-green-200" 
            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 active:bg-gray-100"
        }`}
      >
        <ImageIcon className={`w-4 h-4 ${fileName ? "text-green-600" : "text-gray-500"}`} />
        {fileName ? "Photo Attached" : "Attach Proof"}
      </button>

      {fileName && (
        <div className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded border border-gray-100 animate-in fade-in slide-in-from-top-1">
          <span className="text-xs text-gray-500 truncate max-w-[200px]">
            {fileName}
          </span>
          <button 
            onClick={clearFile}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Remove file"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}