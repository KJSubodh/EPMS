// repository/UserRepository.java
package com.project.management.repository;

import com.project.management.model.User;
import com.project.management.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    
    // ============ FIND BY EMAIL ============
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    // ============ FIND BY ROLE ============
    List<User> findByRole(Role role);
    
    List<User> findByRoleIn(List<Role> roles);
    
    long countByRole(Role role);
    
    // ============ FIND BY STATUS ============
    List<User> findByIsActive(Boolean isActive);
    
    @Query("SELECT u FROM User u WHERE u.isActive = true")
    List<User> findAllActive();
    
    // ============ EMPLOYEE SPECIFIC ============
    @Query("SELECT u FROM User u WHERE u.isActive = true AND u.role = 'EMPLOYEE'")
    List<User> findActiveEmployees();
    
    @Query("SELECT u FROM User u WHERE u.isActive = true AND u.role != 'ADMIN'")
    List<User> findActiveNonAdminEmployees();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'EMPLOYEE'")
    long countEmployees();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role != 'ADMIN'")
    long countNonAdminUsers();
    
    // ============ SEARCH ============
    @Query("SELECT u FROM User u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<User> searchByQuery(@Param("query") String query);
    
    @Query("SELECT u FROM User u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<User> searchByName(@Param("name") String name);
    
    @Query("SELECT u FROM User u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))")
    List<User> searchByEmail(@Param("email") String email);
    
    // ============ DEPARTMENT & DESIGNATION ============
    @Query("SELECT u FROM User u WHERE u.department = :department AND u.isActive = true")
    List<User> findActiveByDepartment(@Param("department") String department);
    
    @Query("SELECT u FROM User u WHERE u.designation = :designation AND u.isActive = true")
    List<User> findActiveByDesignation(@Param("designation") String designation);
    
    // ============ STATISTICS ============
    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true")
    long countActiveUsers();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = false")
    long countInactiveUsers();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'ADMIN'")
    long countAdmins();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'PROJECT_MANAGER'")
    long countProjectManagers();
    
    // ============ RECENT USERS ============
    @Query("SELECT u FROM User u ORDER BY u.createdAt DESC")
    List<User> findRecentUsers();
    
    @Query(value = "SELECT * FROM users ORDER BY created_at DESC LIMIT :limit", nativeQuery = true)
    List<User> findRecentUsersWithLimit(@Param("limit") int limit);
}