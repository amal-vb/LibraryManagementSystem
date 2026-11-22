package com.library.repository;

import com.library.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemberRepository extends JpaRepository<Member, Long> {

    // Search by name (partial match, ignores upper/lower case)
    List<Member> findByNameContainingIgnoreCase(String name);

    // Used to stop duplicate emails
    boolean existsByEmail(String email);
}