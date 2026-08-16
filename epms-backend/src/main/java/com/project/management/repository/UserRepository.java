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
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findByRole(Role role);
    
    List<User> findByIsActive(Boolean isActive);
    
    // ✅ Add missing method: findActiveEmployees
    @Query("SELECT u FROM User u WHERE u.isActive = true AND u.role != 'ADMIN'")
    List<User> findActiveEmployees();
    
    // ✅ Add missing method: countEmployees
    @Query("SELECT COUNT(u) FROM User u WHERE u.role != 'ADMIN'")
    long countEmployees();
    
    // ✅ Add missing method: countByRole
    long countByRole(Role role);
    
    // ✅ Additional useful methods
    @Query("SELECT u FROM User u WHERE u.fullName LIKE %:name%")
    List<User> searchByName(@Param("name") String name);
    
    @Query("SELECT u FROM User u WHERE u.isActive = true")
    List<User> findAllActive();
}