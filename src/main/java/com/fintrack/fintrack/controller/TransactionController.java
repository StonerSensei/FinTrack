package com.fintrack.fintrack.controller;

import com.fintrack.fintrack.dto.GroupDetails;
import com.fintrack.fintrack.dto.GroupSummary;
import com.fintrack.fintrack.dto.TransactionRequest;
import com.fintrack.fintrack.model.Transaction;
import com.fintrack.fintrack.model.TransactionGroup;
import com.fintrack.fintrack.model.User;
import com.fintrack.fintrack.service.TransactionGroupService;
import com.fintrack.fintrack.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    @Autowired
    private TransactionGroupService groupService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(
            @RequestBody TransactionRequest req,
            @AuthenticationPrincipal User user) {

        System.out.println("Creating transaction for group ID: " + req.getGroupId());

        TransactionGroup group = groupService.getById(req.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        Transaction transaction = new Transaction();
        transaction.setAmount(req.getAmount());
        transaction.setType(req.getType());
        transaction.setCategory(req.getCategory());
        transaction.setNote(req.getNote());
        transaction.setDate(req.getDate());
        transaction.setUser(user);
        transaction.setGroup(group);

        Transaction saved = transactionService.createTransaction(transaction);
        System.out.println("Transaction created with ID: " + saved.getId());
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getUserTransactions(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transactionService.getUserTransactions(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getById(@PathVariable Long id) {
        return transactionService.getTransactionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Transaction>> getByGroup(@PathVariable Long groupId) {
        System.out.println("Fetching transactions for group ID: " + groupId);
        List<Transaction> transactions = transactionService.getTransactionsByGroup(groupId);
        System.out.println("Found " + transactions.size() + " transactions");
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Transaction>> getRecentTransactions(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transactionService.getRecentTransactions(user));
    }

    @GetMapping("/groups/summary")
    public ResponseEntity<List<GroupSummary>> getGroupSummaries(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(groupService.getGroupSummaries(user));
    }

    @GetMapping("/by-name/{name}")
    public ResponseEntity<TransactionGroup> getGroupByName(@PathVariable String name,
                                                           @AuthenticationPrincipal User user) {
        return groupService.getGroupByName(name, user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-name/{name}/summary")
    public ResponseEntity<GroupDetails> getGroupDetails(@PathVariable String name,
                                                        @AuthenticationPrincipal User user) {
        return groupService.getGroupDetailsByName(name, user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}