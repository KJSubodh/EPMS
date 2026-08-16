// src/components/projects/ProjectForm.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createProject, updateProject } from '../../store/slices/projectSlice';
import { FaTimes, FaProjectDiagram } from 'react-icons/fa';

const getStartOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const buildSchema = (isEdit) => yup.object({
  name: yup.string().required('Project name is required'),
  description: yup.string(),
  status: yup.string().required('Status is required'),
  startDate: yup.date()
    .required('Start date is required')
    .test(
      'not-in-past',
      'Start date cannot be in the past',
      (value) => isEdit || !value || value >= getStartOfToday()
    ),
  endDate: yup.date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date')
});

const ProjectForm = ({ project, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const isEdit = !!project;

  const todayStr = (() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(buildSchema(isEdit)),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      status: project?.status || 'PLANNING',
      startDate: project?.startDate || '',
      endDate: project?.endDate || ''
    }
  });

  const startDate = watch('startDate');

  const onSubmit = async (data) => {
    if (isEdit) {
      await dispatch(updateProject({ id: project.id, data }));
    } else {
      await dispatch(createProject(data));
    }
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded border border-gray-200 shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#7C3AED] rounded flex items-center justify-center">
              <FaProjectDiagram className="text-white text-sm" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {isEdit ? 'Edit Project' : 'New Project'}
              </h2>
              <p className="text-[10px] text-gray-500">
                {isEdit ? 'Update project details' : 'Create a new project'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes className="text-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3.5">
          <div>
            <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">Project Name *</label>
            <input
              type="text"
              {...register('name')}
              className={`w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Enter project name"
            />
            {errors.name && (
              <p className="text-red-500 text-[10px] mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">Description</label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors resize-none"
              rows="3"
              placeholder="Enter project description"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">Status</label>
            <select
              {...register('status')}
              className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors"
            >
              <option value="PLANNING">Planning</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">Start Date *</label>
              <input
                type="date"
                min={isEdit ? undefined : todayStr}
                {...register('startDate')}
                className={`w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors font-mono ${errors.startDate ? 'border-red-500' : ''}`}
              />
              {errors.startDate && (
                <p className="text-red-500 text-[10px] mt-1">{errors.startDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-1">End Date *</label>
              <input
                type="date"
                {...register('endDate')}
                className={`w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors font-mono ${errors.endDate ? 'border-red-500' : ''}`}
                min={startDate}
              />
              {errors.endDate && (
                <p className="text-red-500 text-[10px] mt-1">{errors.endDate.message}</p>
              )}
            </div>
          </div>

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
              className="px-4 py-1.5 bg-[#7C3AED] text-white rounded text-xs font-medium hover:bg-[#6D28D9] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;