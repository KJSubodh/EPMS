// src/components/kanban/KanbanBoard.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaSpinner } from 'react-icons/fa';
import { fetchBoardData, updateBoard, updateTaskStatus } from '../../store/slices/taskSlice';
import KanbanTask from './KanbanTask';
import TaskForm from '../tasks/TaskForm';
import TaskDetail from '../tasks/TaskDetail';

const COLUMN_CONFIG = {
  TODO: { label: 'To Do', color: 'bg-blue-500' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-yellow-500' },
  REVIEW: { label: 'Review', color: 'bg-purple-500' },
  DONE: { label: 'Done', color: 'bg-green-500' },
};

// showCreateModal / onCloseCreateModal are controlled by the parent (Board
// page), which surfaces the "Add Task" trigger in its PageHero instead of
// this component rendering its own header/button.
const KanbanBoard = ({ projectId, searchTerm = '', showCreateModal = false, onCloseCreateModal = () => {} }) => {
  const dispatch = useDispatch();
  const { board, isLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [columns, setColumns] = useState({});
  const [viewingTask, setViewingTask] = useState(null); // For task detail modal

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

  // Handle task click - open task detail modal
  const handleTaskClick = (task) => {
    setViewingTask(task);
  };

  // Handle task status change from detail modal
  const handleStatusChange = async (taskId, status) => {
    await dispatch(updateTaskStatus({ id: taskId, status }));
    // Refresh board data
    dispatch(fetchBoardData(projectId));
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
      {/* Board Columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.keys(COLUMN_CONFIG).map((statusKey) => {
            const column = columns[statusKey];
            const config = COLUMN_CONFIG[statusKey];
            const allColumnTasks = column?.tasks || [];
            const tasks = searchTerm
              ? allColumnTasks.filter((t) => t.title?.toLowerCase().includes(searchTerm.toLowerCase()))
              : allColumnTasks;

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
                            isDragDisabled={(isEmployee && task.assignedToId !== user?.id) || !!searchTerm}
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
                                <KanbanTask 
                                  task={task} 
                                  onTaskClick={handleTaskClick}
                                />
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

      {/* Create Task Modal - triggered from the parent page's PageHero */}
      {showCreateModal && (
        <TaskForm
          task={null}
          projectId={projectId}
          onClose={onCloseCreateModal}
          onSuccess={() => {
            onCloseCreateModal();
            dispatch(fetchBoardData(projectId));
          }}
        />
      )}

      {/* Task Detail Modal */}
      {viewingTask && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewingTask(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <TaskDetail
              task={viewingTask}
              onClose={() => setViewingTask(null)}
              userRole={user?.role}
              userId={user?.id}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;