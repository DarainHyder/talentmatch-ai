import React, { useState } from 'react';
import { CandidateUploadProps } from '../types/components';

const CandidateUpload: React.FC<CandidateUploadProps> = ({
  onUploadComplete,
  maxFiles = 10,
  allowedTypes = ['.pdf', '.doc', '.docx', '.txt'],
  jobId
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    if (fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const invalidFiles = fileArray.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return !allowedTypes.includes(extension);
    });

    if (invalidFiles.length > 0) {
      setError(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Mock candidate data
      const mockCandidates = fileArray.map((file, index) => ({
        id: `candidate-${Date.now()}-${index}`,
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        email: `candidate${index + 1}@example.com`,
        resumeText: `Extracted text from ${file.name} would appear here...`,
        skills: ['JavaScript', 'React', 'TypeScript', 'Node.js'],
        score: 0.75 + (index * 0.05),
        matchPercentage: 75 + (index * 5),
        status: 'evaluated' as const
      }));

      onUploadComplete(mockCandidates);

      // Reset progress after success
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Candidate Resumes</h3>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !isUploading && document.getElementById('file-input')?.click()}
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 mb-4 flex items-center justify-center bg-blue-100 rounded-full">
            <span className="text-2xl">📄</span>
          </div>
          
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Drag & drop resumes here</span>
            <br />
            or click to browse files
          </p>
          
          <p className="text-sm text-gray-500 mb-4">
            Supports: {allowedTypes.join(', ')} • Max: {maxFiles} files
          </p>

          <input
            id="file-input"
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />

          {jobId && (
            <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              Linked to Job ID: {jobId}
            </div>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>📁 Uploaded resumes will be:</p>
        <ul className="list-disc list-inside ml-2 mt-1">
          <li>Parsed for text extraction</li>
          <li>Analyzed for skills and experience</li>
          <li>Matched against job requirements</li>
          <li>Securely stored and processed</li>
        </ul>
      </div>
    </div>
  );
};

export default CandidateUpload;
