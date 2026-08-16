// src/components/tasks/TaskAttachments.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaFile, FaPaperclip } from 'react-icons/fa';
import { fetchTaskDocuments, uploadTaskDocument, deleteTaskDocument, downloadDocument, resetUploadProgress } from '../../store/slices/taskSlice';
import FileUpload from '../common/FileUpload';
import FileList from '../common/FileList';

const TaskAttachments = ({ taskId, canEdit }) => {
  const dispatch = useDispatch();
  const { documents, isLoadingDocuments, isUploading, uploadProgress } = useSelector((state) => state.tasks);
  const [uploadingFile, setUploadingFile] = useState(null);

  useEffect(() => {
    if (taskId) {
      dispatch(fetchTaskDocuments(taskId));
    }
    return () => {
      dispatch(resetUploadProgress());
    };
  }, [dispatch, taskId]);

  const handleFileSelect = async (file) => {
    setUploadingFile(file.name);
    await dispatch(uploadTaskDocument({ 
      taskId, 
      file,
      onProgress: (progress) => {
        // Progress is handled in the slice
      }
    }));
    setUploadingFile(null);
    dispatch(fetchTaskDocuments(taskId));
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Delete this file?')) {
      await dispatch(deleteTaskDocument(documentId));
      dispatch(fetchTaskDocuments(taskId));
    }
  };

  const handleDownloadDocument = async (doc) => {
    await dispatch(downloadDocument(doc.id));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#7C3AED]/10 rounded-lg flex items-center justify-center">
            <FaPaperclip className="text-[#7C3AED] text-sm" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Attachments</h3>
            <p className="text-xs text-gray-400">
              {documents.length} file{documents.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {isUploading && uploadingFile && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FaFile className="w-3 h-3" />
            <span>Uploading {uploadingFile}...</span>
            <span className="font-medium text-[#7C3AED]">{uploadProgress}%</span>
          </div>
        )}
      </div>

      {canEdit && (
        <div className="mb-4">
          <FileUpload
            onFileSelect={handleFileSelect}
            onRemove={() => {}}
            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
            maxSize={10}
            multiple={false}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        </div>
      )}

      <FileList
        documents={documents}
        onDelete={canEdit ? handleDeleteDocument : null}
        onDownload={handleDownloadDocument}
        isOwner={canEdit}
        isLoading={isLoadingDocuments}
      />
    </div>
  );
};

export default TaskAttachments;