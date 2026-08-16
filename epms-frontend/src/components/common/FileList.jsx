// src/components/common/FileList.jsx
import React, { useState } from 'react';
import { FaFile, FaImage, FaFilePdf, FaFileWord, FaFileExcel, FaFileArchive, FaDownload, FaTrash, FaEye, FaTimes, FaSpinner } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const FileList = ({ 
  documents, 
  onDelete, 
  onDownload, 
  isOwner = false, 
  isLoading = false 
}) => {
  const [viewingFile, setViewingFile] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) {
      return <FaImage className="text-blue-500 text-lg" />;
    } else if (['pdf'].includes(ext)) {
      return <FaFilePdf className="text-red-500 text-lg" />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <FaFileWord className="text-blue-600 text-lg" />;
    } else if (['xls', 'xlsx'].includes(ext)) {
      return <FaFileExcel className="text-green-600 text-lg" />;
    } else if (['zip', 'rar', '7z'].includes(ext)) {
      return <FaFileArchive className="text-yellow-600 text-lg" />;
    }
    return <FaFile className="text-gray-500 text-lg" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isImage = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext);
  };

  const handleDownload = async (doc) => {
    if (onDownload) {
      setDownloading(doc.id);
      await onDownload(doc);
      setDownloading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="w-6 h-6 text-[#7C3AED] animate-spin" />
        <span className="text-sm text-gray-400 ml-2">Loading files...</span>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <FaFile className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm font-medium text-gray-500">No attachments</p>
        <p className="text-xs mt-1">Upload files to share with your team</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
        >
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
            {getFileIcon(doc.fileName)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{doc.fileName}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-gray-400">{doc.formattedSize || formatFileSize(doc.fileSize)}</span>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-400">
                Uploaded by {doc.uploadedByName || 'Unknown'} • {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {doc.isImage && (
              <button
                onClick={() => setViewingFile(doc)}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                title="Preview"
              >
                <FaEye className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => handleDownload(doc)}
              disabled={downloading === doc.id}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
              title="Download"
            >
              {downloading === doc.id ? (
                <FaSpinner className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FaDownload className="w-3.5 h-3.5" />
              )}
            </button>
            {isOwner && (
              <button
                onClick={() => onDelete && onDelete(doc.id)}
                className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete"
              >
                <FaTrash className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Image Preview Modal */}
      {viewingFile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setViewingFile(null)}
        >
          <div 
            className="max-w-3xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
              <span className="text-sm font-medium text-gray-700 truncate">{viewingFile.fileName}</span>
              <button
                onClick={() => setViewingFile(null)}
                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-50 min-h-[200px]">
              <img 
                src={viewingFile.filePath || '/placeholder-image.png'} 
                alt={viewingFile.fileName}
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  e.target.src = '/placeholder-image.png';
                  e.target.alt = 'Failed to load image';
                }}
              />
            </div>
            <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-gray-50">
              <span className="text-xs text-gray-400">{viewingFile.formattedSize || formatFileSize(viewingFile.fileSize)}</span>
              <button
                onClick={() => {
                  handleDownload(viewingFile);
                  setViewingFile(null);
                }}
                className="flex items-center gap-2 px-4 py-1.5 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9] transition-colors"
              >
                <FaDownload className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;  // ✅ Make sure this is at the bottom