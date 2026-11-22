package com.library.dto;

import java.util.List;

public class DashboardResponse {

    private long totalBooks;
    private long totalMembers;
    private long issuedBooks;
    private long availableBooks;
    private List<TransactionResponse> recentTransactions;

    public DashboardResponse(long totalBooks, long totalMembers, long issuedBooks,
                             long availableBooks, List<TransactionResponse> recentTransactions) {
        this.totalBooks = totalBooks;
        this.totalMembers = totalMembers;
        this.issuedBooks = issuedBooks;
        this.availableBooks = availableBooks;
        this.recentTransactions = recentTransactions;
    }

    public long getTotalBooks() {
        return totalBooks;
    }

    public long getTotalMembers() {
        return totalMembers;
    }

    public long getIssuedBooks() {
        return issuedBooks;
    }

    public long getAvailableBooks() {
        return availableBooks;
    }

    public List<TransactionResponse> getRecentTransactions() {
        return recentTransactions;
    }
}