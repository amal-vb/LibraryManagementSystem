package com.library.controller;

import com.library.dto.DashboardResponse;
import com.library.dto.IssueRequest;
import com.library.dto.TransactionResponse;
import com.library.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/transactions/issue")
    public ResponseEntity<TransactionResponse> issueBook(@Valid @RequestBody IssueRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.issueBook(request));
    }

    @PutMapping("/transactions/{id}/return")
    public TransactionResponse returnBook(@PathVariable Long id) {
        return transactionService.returnBook(id);
    }

    @GetMapping("/transactions")
    public List<TransactionResponse> getAllTransactions() {
        return transactionService.getAllTransactions();
    }

    @GetMapping("/transactions/active")
    public List<TransactionResponse> getActiveTransactions() {
        return transactionService.getActiveTransactions();
    }

    @GetMapping("/dashboard")
    public DashboardResponse getDashboard() {
        return transactionService.getDashboard();
    }
}