package com.library.dto;

import com.library.entity.BookTransaction;
import com.library.entity.TransactionStatus;

import java.time.LocalDate;

public class TransactionResponse {

    private Long id;
    private Long bookId;
    private String bookTitle;
    private Long memberId;
    private String memberName;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private TransactionStatus status;

    public static TransactionResponse from(BookTransaction t) {
        TransactionResponse r = new TransactionResponse();
        r.id = t.getId();
        r.bookId = t.getBook().getId();
        r.bookTitle = t.getBook().getTitle();
        r.memberId = t.getMember().getId();
        r.memberName = t.getMember().getName();
        r.issueDate = t.getIssueDate();
        r.dueDate = t.getDueDate();
        r.returnDate = t.getReturnDate();
        r.status = t.getStatus();
        return r;
    }

    public Long getId() {
        return id;
    }

    public Long getBookId() {
        return bookId;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public Long getMemberId() {
        return memberId;
    }

    public String getMemberName() {
        return memberName;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public TransactionStatus getStatus() {
        return status;
    }
}