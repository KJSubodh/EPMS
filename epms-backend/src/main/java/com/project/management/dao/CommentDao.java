// dao/CommentDao.java
package com.project.management.dao;

import com.project.management.model.Comment;
import com.project.management.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CommentDao {

    private final CommentRepository commentRepository;

    public Comment save(Comment comment) {
        return commentRepository.save(comment);
    }

    public Optional<Comment> findById(Long id) {
        return commentRepository.findById(id);
    }

    public List<Comment> findByTaskIdOrderByCreatedAtAsc(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId);
    }

    public List<Comment> findByTaskIdAndParentIsNullOrderByCreatedAtAsc(Long taskId) {
        return commentRepository.findByTaskIdAndParentIsNullOrderByCreatedAtAsc(taskId);
    }

    public List<Comment> findTopLevelCommentsByTaskId(Long taskId) {
        return commentRepository.findTopLevelCommentsByTaskId(taskId);
    }

    public long countByTaskId(Long taskId) {
        return commentRepository.countByTaskId(taskId);
    }

    public void delete(Comment comment) {
        commentRepository.delete(comment);
    }

    public void deleteById(Long id) {
        commentRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return commentRepository.existsById(id);
    }
}