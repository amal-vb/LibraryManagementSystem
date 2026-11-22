package com.library.service;

import com.library.dto.DashboardResponse;
import com.library.dto.IssueRequest;
import com.library.dto.TransactionResponse;
import com.library.entity.Book;
import com.library.entity.BookTransaction;
import com.library.entity.Member;
import com.library.entity.TransactionStatus;
import com.library.exception.BadRequestException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.BookTransactionRepository;
import com.library.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final BookTransactionRepository transactionRepository;

    public TransactionService(BookRepository bookRepository,
                              MemberRepository memberRepository,
                              BookTransactionRepository transactionRepository) {
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
        this.transactionRepository = transactionRepository;
    }

    // ISSUE: all steps succeed together, or none are saved
    @Transactional
    public TransactionResponse issueBook(IssueRequest request) {
        LocalDate today = LocalDate.now();

        // Date validation
        if (request.getIssueDate().isAfter(today)) {
            throw new BadRequestException("Issue date cannot be in the future");
        }
        if (request.getDueDate().isBefore(request.getIssueDate())) {
            throw new BadRequestException("Due date cannot be before the issue date");
        }

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Member not found with id " + request.getMemberId()));

        // Lock the book row so two requests can't take the last copy together
        Book book = bookRepository.findByIdForUpdate(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Book not found with id " + request.getBookId()));

        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("No copies of '" + book.getTitle() + "' are available");
        }

        // Decrease stock
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        BookTransaction transaction = new BookTransaction();
        transaction.setBook(book);
        transaction.setMember(member);
        transaction.setIssueDate(request.getIssueDate());
        transaction.setDueDate(request.getDueDate());
        transaction.setStatus(TransactionStatus.ISSUED);

        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    // RETURN: blocks a second return of the same transaction
    @Transactional
    public TransactionResponse returnBook(Long transactionId) {
        BookTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transaction not found with id " + transactionId));

        if (transaction.getStatus() == TransactionStatus.RETURNED) {
            throw new BadRequestException("This book has already been returned");
        }

        // Lock the book row, then increase stock
        Book book = bookRepository.findByIdForUpdate(transaction.getBook().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        // Re-check after locking in case another request returned it first
        if (transaction.getStatus() == TransactionStatus.RETURNED) {
            throw new BadRequestException("This book has already been returned");
        }

        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        transaction.setReturnDate(LocalDate.now());
        transaction.setStatus(TransactionStatus.RETURNED);

        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    // All transactions, newest first
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions() {
        return transactionRepository.findAllByOrderByIdDesc().stream()
                .map(TransactionResponse::from)
                .collect(Collectors.toList());
    }

    // Only transactions that are still issued (used by the Return dropdown)
    @Transactional(readOnly = true)
    public List<TransactionResponse> getActiveTransactions() {
        return transactionRepository.findAllByOrderByIdDesc().stream()
                .filter(t -> t.getStatus() == TransactionStatus.ISSUED)
                .map(TransactionResponse::from)
                .collect(Collectors.toList());
    }

    // Numbers and recent activity for the dashboard
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        long totalBooks = bookRepository.count();
        long totalMembers = memberRepository.count();
        long issuedBooks = transactionRepository.countByStatus(TransactionStatus.ISSUED);

        // Total available copies across all books
        long availableBooks = bookRepository.findAll().stream()
                .mapToLong(Book::getAvailableCopies)
                .sum();

        List<TransactionResponse> recent = transactionRepository.findTop5ByOrderByIdDesc().stream()
                .map(TransactionResponse::from)
                .collect(Collectors.toList());

        return new DashboardResponse(totalBooks, totalMembers, issuedBooks, availableBooks, recent);
    }
}