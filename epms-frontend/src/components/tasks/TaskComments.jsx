// src/components/tasks/TaskComments.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPaperPlane, FaEdit, FaTrash, FaReply, FaUser, FaTimes } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { fetchComments, createComment, updateComment, deleteComment } from '../../store/slices/commentSlice';

const TaskComments = ({ taskId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { comments, isLoading } = useSelector((state) => state.comments);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const commentInputRef = useRef(null);

  const taskComments = comments[taskId] || [];

  useEffect(() => {
    if (taskId) {
      dispatch(fetchComments(taskId));
    }
  }, [dispatch, taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await dispatch(createComment({
      taskId,
      content: newComment.trim(),
      parentId: replyingTo
    }));
    setNewComment('');
    setReplyingTo(null);
  };

  const handleUpdate = async (commentId) => {
    if (!editContent.trim()) return;
    await dispatch(updateComment({ taskId, commentId, content: editContent }));
    setEditingId(null);
    setEditContent('');
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('Delete this comment?')) {
      await dispatch(deleteComment({ taskId, commentId }));
    }
  };

  const startEditing = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  const startReplying = (commentId) => {
    setReplyingTo(commentId);
    commentInputRef.current?.focus();
  };

  const getAvatarColor = (name) => {
    const colors = ['#7C3AED', '#3B82F6', '#16A34A', '#F59E0B', '#EF4444'];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#7C3AED] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
             style={{ backgroundColor: getAvatarColor(user?.fullName) }}>
          {user?.fullName?.charAt(0) || 'U'}
        </div>
        <div className="flex-1">
          {replyingTo && (
            <div className="flex items-center gap-2 mb-1.5 text-xs text-gray-500">
              <FaReply className="w-3 h-3" />
              <span>Replying to comment</span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              ref={commentInputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? 'Write a reply...' : 'Write a comment...'}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <FaPaperPlane className="w-3 h-3" />
              Send
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {taskComments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No comments yet</p>
            <p className="text-xs mt-1">Be the first to comment!</p>
          </div>
        ) : (
          taskComments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                   style={{ backgroundColor: getAvatarColor(comment.userName) }}>
                {comment.userName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{comment.userName}</span>
                  <span className="text-[10px] text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                {editingId === comment.id ? (
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all"
                    />
                    <button
                      onClick={() => handleUpdate(comment.id)}
                      className="px-3 py-1 bg-[#7C3AED] text-white rounded-lg text-xs font-medium hover:bg-[#6D28D9] transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                )}

                <div className="flex items-center gap-3 mt-1.5">
                  <button
                    onClick={() => startReplying(comment.id)}
                    className="text-[10px] text-gray-400 hover:text-[#7C3AED] transition-colors flex items-center gap-1"
                  >
                    <FaReply className="w-2.5 h-2.5" />
                    Reply
                  </button>
                  {comment.userId === user?.id && (
                    <>
                      <button
                        onClick={() => startEditing(comment)}
                        className="text-[10px] text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1"
                      >
                        <FaEdit className="w-2.5 h-2.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-[10px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                      >
                        <FaTrash className="w-2.5 h-2.5" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskComments;