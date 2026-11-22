package com.library.repository;

import com.library.entity.BookTransaction;
import com.library.entity.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookTransactionRepository extends JpaRepository<BookTransaction, Long> {

    // Count of transactions by status (used for "Currently issued books")
    long countByStatus(TransactionStatus status);

    // Latest 5 transactions for the dashboard
    List<BookTransaction> findTop5ByOrderByIdDesc();

    // All transactions, newest first (Transaction History page)
    List<BookTransaction> findAllByOrderByIdDesc();

    // Used to block deleting a book/member that still has active issues
    boolean existsByBookIdAndStatus(Long bookId, TransactionStatus status);

    boolean existsByMemberIdAndStatus(Long memberId, TransactionStatus status);

    // Used to block deleting a book/member that has any transaction history
    boolean existsByBookId(Long bookId);

    boolean existsByMemberId(Long memberId);
}