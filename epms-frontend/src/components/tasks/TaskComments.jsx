// src/components/tasks/TaskComments.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPaperPlane, FaEdit, FaTrash, FaReply, FaUser, FaTimes, FaAt } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { fetchComments, createComment, updateComment, deleteComment } from '../../store/slices/commentSlice';
import { searchUsers } from '../../store/slices/adminSlice';

const TaskComments = ({ taskId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { comments, isLoading } = useSelector((state) => state.comments);
  const { users: allUsers } = useSelector((state) => state.admin);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const commentInputRef = useRef(null);
  const mentionRef = useRef(null);

  const taskComments = comments[taskId] || [];

  useEffect(() => {
    if (taskId) {
      dispatch(fetchComments(taskId));
    }
  }, [dispatch, taskId]);

  // ✅ Handle input change with @mention detection
  const handleCommentChange = (e) => {
    const value = e.target.value;
    setNewComment(value);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const query = textBeforeCursor.substring(atIndex + 1);
      if (!query.includes(' ')) {
        setMentionQuery(query);
        setMentionPosition(atIndex);
        setShowMentions(true);
        
        // Filter users from allUsers or fetch if not available
        let filtered = [];
        if (allUsers && allUsers.length > 0) {
          filtered = allUsers.filter(u => 
            u.fullName?.toLowerCase().includes(query.toLowerCase()) ||
            u.email?.toLowerCase().includes(query.toLowerCase())
          );
        } else {
          // Fetch users if not loaded
          dispatch(searchUsers(query));
          filtered = allUsers || [];
        }
        setMentionSuggestions(filtered.slice(0, 5));
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // ✅ Insert mention into comment
  const insertMention = (selectedUser) => {
    const beforeMention = newComment.substring(0, mentionPosition);
    const afterMention = newComment.substring(mentionPosition + mentionQuery.length + 1);
    const mentionText = `@${selectedUser.email} `;
    const newValue = beforeMention + mentionText + afterMention;
    
    setNewComment(newValue);
    setShowMentions(false);
    setMentionSuggestions([]);
    
    if (commentInputRef.current) {
      const newCursorPos = mentionPosition + mentionText.length;
      commentInputRef.current.focus();
      commentInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }
  };

  // ✅ Click outside to close mentions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mentionRef.current && !mentionRef.current.contains(e.target)) {
        setShowMentions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setShowMentions(false);
  };

  // ... rest of the component functions ...

  const getAvatarColor = (name) => {
    const colors = ['#7C3AED', '#3B82F6', '#16A34A', '#F59E0B', '#EF4444'];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // ✅ Highlight mentions in comment text
  const renderCommentWithMentions = (content) => {
    if (!content) return null;
    
    const parts = content.split(/(@[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-[#7C3AED] font-medium cursor-pointer hover:underline">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#7C3AED] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex items-start gap-3 relative">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
             style={{ backgroundColor: getAvatarColor(user?.fullName) }}>
          {user?.fullName?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 relative">
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
          
          {/* ✅ Mention Suggestions Dropdown */}
          {showMentions && mentionSuggestions.length > 0 && (
            <div 
              ref={mentionRef}
              className="absolute bottom-full left-0 mb-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
            >
              <div className="p-1.5 border-b border-gray-100 bg-gray-50">
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Mention Users</span>
              </div>
              {mentionSuggestions.map((suggestedUser) => (
                <button
                  key={suggestedUser.id}
                  onClick={() => insertMention(suggestedUser)}
                  className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                       style={{ backgroundColor: getAvatarColor(suggestedUser.fullName) }}>
                    {suggestedUser.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{suggestedUser.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{suggestedUser.email}</p>
                  </div>
                  <FaUser className="w-3 h-3 text-gray-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                <FaAt className="w-3.5 h-3.5" />
              </div>
              <input
                ref={commentInputRef}
                type="text"
                value={newComment}
                onChange={handleCommentChange}
                placeholder={replyingTo ? 'Write a reply... (use @ to mention)' : 'Write a comment... (use @ to mention)'}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <FaPaperPlane className="w-3 h-3" />
              Send
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            <FaAt className="inline w-2.5 h-2.5 mr-0.5" />
            Type @ to mention someone
          </p>
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
                  <p className="text-sm text-gray-700 mt-0.5">
                    {renderCommentWithMentions(comment.content)}
                  </p>
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