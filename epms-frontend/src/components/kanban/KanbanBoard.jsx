// src/components/kanban/KanbanBoard.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaPlus, FaTasks, FaSpinner } from 'react-icons/fa';
import { fetchBoardData, updateBoard } from '../../store/slices/taskSlice';
import KanbanTask from './KanbanTask';
import TaskForm from '../tasks/TaskForm';

const COLUMN_CONFIG = {
  TODO: { label: 'To Do', color: 'bg-blue-500' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-yellow-500' },
  REVIEW: { label: 'Review', color: 'bg-purple-500' },
  DONE: { label: 'Done', color: 'bg-green-500' },
};

const KanbanBoard = ({ projectId }) => {
  const dispatch = useDispatch();
  const { board, isLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [columns, setColumns] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchBoardData(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (board) {
      // Convert columns array to object for easier access
      const colObject = {};
      board.columns.forEach(col => {
        colObject[col.status] = {
          ...col,
          tasks: col.tasks || []
        };
      });
      setColumns(colObject);
    }
  }, [board]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && 
        destination.index === source.index) return;

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const taskId = parseInt(draggableId);

    // Find the task being dragged
    const task = sourceColumn.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Update local state optimistically
    const newSourceTasks = [...sourceColumn.tasks];
    newSourceTasks.splice(source.index, 1);
    
    const newDestTasks = [...destColumn.tasks];
    newDestTasks.splice(destination.index, 0, { ...task, status: destination.droppableId });

    const newColumns = {
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        tasks: newSourceTasks,
        count: newSourceTasks.length
      },
      [destination.droppableId]: {
        ...destColumn,
        tasks: newDestTasks,
        count: newDestTasks.length
      }
    };

    setColumns(newColumns);

    // Prepare update payload
    const boardData = {
      columns: Object.keys(newColumns).map(status => ({
        status: status,
        taskIds: newColumns[status].tasks.map(t => t.id)
      }))
    };

    // Send update to backend
    dispatch(updateBoard(boardData));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <FaSpinner className="w-6 h-6 text-[#7C3AED] animate-spin" />
          <span className="text-sm text-gray-500">Loading board...</span>
        </div>
      </div>
    );
  }

  const isEmployee = user?.role === 'EMPLOYEE';

  return (
    <div className="bg-gray-50/80 rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#7C3AED]/10 rounded-lg flex items-center justify-center">
            <FaTasks className="text-[#7C3AED] text-lg" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Board</h2>
            <p className="text-xs text-gray-500">Drag and drop tasks between columns</p>
          </div>
        </div>
        {!isEmployee && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9] transition-all duration-200 shadow-md shadow-[#7C3AED]/20 hover:shadow-[#7C3AED]/30"
          >
            <FaPlus className="w-3.5 h-3.5" />
            Add Task
          </button>
        )}
      </div>

      {/* Board Columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.keys(COLUMN_CONFIG).map((statusKey) => {
            const column = columns[statusKey];
            const config = COLUMN_CONFIG[statusKey];
            const tasks = column?.tasks || [];

            return (
              <div key={statusKey} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${config.color}`}></div>
                    <span className="text-sm font-semibold text-gray-700">{config.label}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {tasks.length}
                    </span>
                  </div>
                </div>

                {/* Droppable Column */}
                <Droppable droppableId={statusKey}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[150px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-gray-50/80 rounded-lg' : ''
                      }`}
                    >
                      <div className="space-y-2 p-1">
                        {tasks.map((task, index) => (
                          <Draggable 
                            key={task.id} 
                            draggableId={String(task.id)} 
                            index={index}
                            isDragDisabled={isEmployee && task.assignedToId !== user?.id}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`transition-all ${
                                  snapshot.isDragging ? 'opacity-50 scale-105 shadow-lg' : ''
                                }`}
                              >
                                <KanbanTask task={task} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Create Task Modal */}
      {showCreateModal && (
        <TaskForm
          task={null}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            dispatch(fetchBoardData(projectId));
          }}
        />
      )}
    </div>
  );
};

export default KanbanBoard;