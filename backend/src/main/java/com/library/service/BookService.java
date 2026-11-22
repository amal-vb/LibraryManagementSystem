package com.library.service;

import com.library.dto.BookRequest;
import com.library.entity.Book;
import com.library.entity.TransactionStatus;
import com.library.exception.BadRequestException;
import com.library.exception.ConflictException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.BookTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final BookTransactionRepository transactionRepository;

    public BookService(BookRepository bookRepository,
                       BookTransactionRepository transactionRepository) {
        this.bookRepository = bookRepository;
        this.transactionRepository = transactionRepository;
    }

    // Returns all books, optionally filtered by title and/or category
    @Transactional(readOnly = true)
    public List<Book> getBooks(String title, String category) {
        boolean hasTitle = title != null && !title.trim().isEmpty();
        boolean hasCategory = category != null && !category.trim().isEmpty();

        if (hasTitle && hasCategory) {
            return bookRepository.findByTitleContainingIgnoreCaseAndCategoryIgnoreCase(
                    title.trim(), category.trim());
        }
        if (hasTitle) {
            return bookRepository.findByTitleContainingIgnoreCase(title.trim());
        }
        if (hasCategory) {
            return bookRepository.findByCategoryIgnoreCase(category.trim());
        }
        return bookRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id " + id));
    }

    @Transactional
    public Book addBook(BookRequest request) {
        String isbn = cleanIsbn(request.getIsbn());
        if (isbn != null && bookRepository.existsByIsbn(isbn)) {
            throw new ConflictException("A book with ISBN " + isbn + " already exists");
        }

        Book book = new Book();
        book.setTitle(request.getTitle().trim());
        book.setAuthor(request.getAuthor().trim());
        book.setIsbn(isbn);
        book.setCategory(request.getCategory().trim());
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(request.getTotalCopies());
        return bookRepository.save(book);
    }

    @Transactional
    public Book updateBook(Long id, BookRequest request) {
        Book book = getBookById(id);

        String isbn = cleanIsbn(request.getIsbn());
        if (isbn != null && !isbn.equals(book.getIsbn()) && bookRepository.existsByIsbn(isbn)) {
            throw new ConflictException("A book with ISBN " + isbn + " already exists");
        }

        // Copies currently issued = total - available
        int issuedCopies = book.getTotalCopies() - book.getAvailableCopies();
        if (request.getTotalCopies() < issuedCopies) {
            throw new BadRequestException("Total copies cannot be less than the "
                    + issuedCopies + " copies currently issued");
        }

        book.setTitle(request.getTitle().trim());
        book.setAuthor(request.getAuthor().trim());
        book.setIsbn(isbn);
        book.setCategory(request.getCategory().trim());
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(request.getTotalCopies() - issuedCopies);
        return bookRepository.save(book);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = getBookById(id);

        if (transactionRepository.existsByBookIdAndStatus(id, TransactionStatus.ISSUED)) {
            throw new BadRequestException("Cannot delete a book that is currently issued");
        }
        // Past (returned) transactions also reference this book, so the database blocks deletion.
        if (transactionRepository.existsByBookId(id)) {
            throw new ConflictException("Cannot delete a book that has transaction history");
        }

        bookRepository.delete(book);
    }

    // Treats a blank ISBN as "no ISBN" so the unique rule doesn't clash on empty strings
    private String cleanIsbn(String isbn) {
        if (isbn == null || isbn.trim().isEmpty()) {
            return null;
        }
        return isbn.trim();
    }
}