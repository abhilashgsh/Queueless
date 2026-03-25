"use client";

import { useState, useCallback } from "react";
import { UploadCloud } from "lucide-react";

export function Dropzone({ onFileSelect }: { onFileSelect: (file: File) => void }) {
  const [isDragActive, setIsDragActive] = useState(false);
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed p-12 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4 min-h-[250px] ${
        isDragActive ? "border-primary bg-primary/10 scale-[1.02] shadow-[0_0_30px_rgba(92,107,192,0.2)]" : "border-white/20 hover:border-white/40 glass"
      }`}
    >
      <input
        type="file"
        accept=".pdf"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={handleChange}
      />
      
      <div className={`p-5 rounded-full transition-colors duration-300 ${isDragActive ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-400'}`}>
        <UploadCloud size={36} className={isDragActive ? 'animate-bounce' : ''} />
      </div>
      
      <div className="text-center">
        <p className="text-lg font-medium text-white mb-2">
          {isDragActive ? "Release to drop your PDF!" : "Drag & drop your PDF file"}
        </p>
        <p className="text-sm text-gray-400">Maximum file size 50MB</p>
      </div>
    </div>
  );
}
