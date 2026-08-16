// src/components/common/FileUpload.jsx
import React, { useState, useRef } from 'react';
import { FaUpload, FaFile, FaTimes, FaImage, FaFilePdf, FaFileWord, FaFileExcel, FaFileArchive, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const FileUpload = ({ 
  onFileSelect, 
  onRemove, 
  accept = '*/*', 
  maxSize = 10, 
  multiple = false,
  isUploading = false,
  uploadProgress = 0
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const validFiles = [];
    const invalidFiles = [];

    Array.from(fileList).forEach(file => {
      // Check file size (in MB)
      if (file.size > maxSize * 1024 * 1024) {
        invalidFiles.push(`${file.name} (exceeds ${maxSize}MB)`);
        return;
      }
      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      toast.error(`Files too large: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length > 0) {
      const newFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(newFiles);
      if (onFileSelect) {
        onFileSelect(multiple ? newFiles : validFiles[0]);
      }
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (onRemove) {
      onRemove(newFiles);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) {
      return <FaImage className="text-blue-500" />;
    } else if (['pdf'].includes(ext)) {
      return <FaFilePdf className="text-red-500" />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <FaFileWord className="text-blue-600" />;
    } else if (['xls', 'xlsx'].includes(ext)) {
      return <FaFileExcel className="text-green-600" />;
    } else if (['zip', 'rar', '7z'].includes(ext)) {
      return <FaFileArchive className="text-yellow-600" />;
    }
    return <FaFile className="text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
          dragActive 
            ? 'border-[#7C3AED] bg-[#7C3AED]/5' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={isUploading}
        />
        
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
            {isUploading ? (
              <FaSpinner className="w-5 h-5 text-[#7C3AED] animate-spin" />
            ) : (
              <FaUpload className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <p className="text-sm font-medium text-gray-700">
            {dragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Max file size: {maxSize}MB • {accept === '*/*' ? 'All files accepted' : `Allowed: ${accept}`}
          </p>
          {isUploading && (
            <div className="mt-3">
              <div className="w-full max-w-xs mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#7C3AED] rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{uploadProgress}% uploaded</p>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && !isUploading && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                {getFileIcon(file.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;  