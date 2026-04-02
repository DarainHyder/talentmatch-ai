// ===== FILE: ./src/components/UploadDropzone.jsx =====
import React, { useRef, useState } from "react";

const UploadDropzone = ({ onUpload = () => {}, uploading = false }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState([]);

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const fileNames = fileArray.map(file => file.name || String(file));
    setPreview(fileNames);
    onUpload(fileNames);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleInputChange = (event) => {
    if (event.target.files) {
      handleFiles(event.target.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="p-6 bg-white rounded-2xl shadow border-dashed border-2 border-transparent hover:border-slate-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">Upload resumes (drag & drop or paste names)</div>
          <div className="text-sm text-slate-500">
            {uploading ? "Uploading candidates..." : "Supports multiple files. For demo, you can paste names below and hit Upload."}
          </div>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            multiple
            onChange={handleInputChange}
            className="hidden"
          />
          <button 
            onClick={handleButtonClick}
            className="px-3 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-400"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Select files"}
          </button>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">
            {uploading ? "Uploading..." : "Ready to upload:"}
          </div>
          <ul className="list-disc pl-5 space-y-1">
            {preview.map((fileName, index) => (
              <li key={index} className="text-sm">{fileName}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadDropzone;