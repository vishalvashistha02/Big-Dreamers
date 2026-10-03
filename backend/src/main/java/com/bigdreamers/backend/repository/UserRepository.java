package com.bigdreamers.backend.repository;

import com.bigdreamers.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByMobile(String mobile);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameOrMobile(String username, String mobile);
    List<User> findByRole(String role);
    boolean existsByUsername(String username);
    boolean existsByMobile(String mobile);
    boolean existsByEmail(String email);
}
