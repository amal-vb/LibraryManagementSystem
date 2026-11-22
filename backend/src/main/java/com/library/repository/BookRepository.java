package com.library.repository;

import com.library.entity.Book;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long> {

    // Search by title (partial match, ignores upper/lower case)
    List<Book> findByTitleContainingIgnoreCase(String title);

    // Filter by category (exact match, ignores upper/lower case)
    List<Book> findByCategoryIgnoreCase(String category);

    // Search by title AND category together
    List<Book> findByTitleContainingIgnoreCaseAndCategoryIgnoreCase(String title, String category);

    // Used to stop duplicate ISBNs
    boolean existsByIsbn(String isbn);

    // Finds a book and locks its row until the transaction ends
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Book b WHERE b.id = :id")
    Optional<Book> findByIdForUpdate(@Param("id") Long id);
}