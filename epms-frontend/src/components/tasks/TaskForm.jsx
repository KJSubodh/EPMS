import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createTask, updateTask } from '../../store/slices/taskSlice';
import { fetchProjects } from '../../store/slices/projectSlice';
import { fetchEmployees } from '../../store/slices/userSlice';
import { 
  FaTimes, 
  FaUpload, 
  FaFile, 
  FaTimesCircle, 
  FaTasks,
  FaUser,
  FaCalendarAlt,
  FaFlag,
  FaProjectDiagram
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const getStartOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string(),
  priority: yup.string().required('Priority is required'),
  status: yup.string().required('Status is required'),
  projectId: yup.string().required('Project is required'),
  assignedToId: yup.string().nullable(),
  dueDate: yup
    .date()
    .required('Due date is required')
    .min(getStartOfToday(), 'Due date cannot be in the past')
});

const TaskForm = ({ task, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.projects);
  const { users } = useSelector((state) => state.users);
  const isEdit = !!task;
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const todayStr = (() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchEmployees());
  }, [dispatch]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'MEDIUM',
      status: task?.status || 'TODO',
      projectId: task?.projectId || '',
      assignedToId: task?.assignedToId || '',
      dueDate: task?.dueDate || ''
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileName('');
    document.getElementById('file-upload').value = '';
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    
    if (selectedFile) {
      formData.append('fileAttachment', selectedFile);
    }

    if (isEdit) {
      await dispatch(updateTask({ id: task.id, data: formData }));
    } else {
      await dispatch(createTask({ projectId: data.projectId, data: formData }));
    }
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#7C3AED] rounded flex items-center justify-center flex-shrink-0">
              <FaTasks className="text-white text-sm" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {isEdit ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="text-[10px] text-gray-500">
                {isEdit ? 'Update task details' : 'Add a new task'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3.5">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaTasks className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]" />
              <input
                type="text"
                {...register('title')}
                className={`w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Enter task title"
              />
            </div>
            {errors.title && (
              <p className="text-red-500 text-[10px] mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">Description</label>
            <textarea
              {...register('description')}
              rows="3"
              className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors resize-none"
              placeholder="Enter task description"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">Priority *</label>
              <div className="relative">
                <FaFlag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]" />
                <select
                  {...register('priority')}
                  className={`w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors appearance-none ${errors.priority ? 'border-red-500' : ''}`}
                >
                  <option value="MINOR">Minor</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="MAJOR">Major</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">Status *</label>
              <select
                {...register('status')}
                className={`w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors appearance-none ${errors.status ? 'border-red-500' : ''}`}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
          </div>

          {/* Project */}
          <div>
            <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">Project *</label>
            <div className="relative">
              <FaProjectDiagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]" />
              <select
                {...register('projectId')}
                className={`w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors appearance-none ${errors.projectId ? 'border-red-500' : ''}`}
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.projectId && (
              <p className="text-red-500 text-[10px] mt-1">{errors.projectId.message}</p>
            )}
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">Assign To</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]" />
              <select
                {...register('assignedToId')}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors appearance-none"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">Due Date *</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]" />
              <input
                type="date"
                min={todayStr}
                {...register('dueDate')}
                className={`w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors font-mono ${errors.dueDate ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.dueDate && (
              <p className="text-red-500 text-[10px] mt-1">{errors.dueDate.message}</p>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">Attachment</label>
            <div className="relative">
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`flex items-center gap-2.5 p-3 border-2 border-dashed rounded-lg transition-colors ${
                selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'
              }`}>
                <div className="p-1.5 bg-gray-100 rounded flex-shrink-0">
                  <FaUpload className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {fileName || 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-[10px] text-gray-400">PDF, JPG, PNG, DOC, XLS, ZIP • Max 5MB</p>
                </div>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors z-20 relative flex-shrink-0"
                  >
                    <FaTimesCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            {task?.fileAttachment && !selectedFile && (
              <p className="text-[10px] text-gray-500 mt-1">
                Current file: <span className="font-medium">{task.fileAttachment}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-[#7C3AED] text-white rounded text-xs font-medium hover:bg-[#6D28D9] transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  <span>💾</span>
                  {isEdit ? 'Update Task' : 'Create Task'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;