package com.fintrack.fintrack.controller;

import com.fintrack.fintrack.dto.GroupDetails;
import com.fintrack.fintrack.dto.GroupSummary;
import com.fintrack.fintrack.dto.TransactionRequest;
import com.fintrack.fintrack.model.Transaction;
import com.fintrack.fintrack.model.TransactionGroup;
import com.fintrack.fintrack.model.User;
import com.fintrack.fintrack.service.ExportService;
import com.fintrack.fintrack.service.TransactionGroupService;
import com.fintrack.fintrack.service.TransactionService;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private static final Logger logger = LoggerFactory.getLogger(TransactionController.class);

    private final TransactionService transactionService;

    @Autowired
    private TransactionGroupService groupService;

    @Autowired
    private ExportService exportService;

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

    @GetMapping("/group/{groupId}/export")
    public ResponseEntity<byte[]> exportGroupTransactions(
            @PathVariable Long groupId,
            @RequestParam String format,
            HttpServletResponse response) {

        try {
            logger.info("Export request for group: {}, format: {}", groupId, format);

            // Validate format
            if (!format.equalsIgnoreCase("pdf") && !format.equalsIgnoreCase("csv")) {
                logger.warn("Invalid format requested: {}", format);
                return ResponseEntity.badRequest().build();
            }

            // Get transactions
            List<Transaction> transactions = transactionService.getTransactionsByGroup(groupId);
            logger.info("Found {} transactions for group {}", transactions.size(), groupId);

            if (transactions.isEmpty()) {
                logger.warn("No transactions found for group {}", groupId);
                return ResponseEntity.noContent().build();
            }

            String groupName = "Unknown Group";
            if (!transactions.isEmpty() && transactions.get(0).getGroup() != null) {
                groupName = transactions.get(0).getGroup().getName();
            }

            byte[] data;
            String contentType;
            String fileExtension;
            String filename;

            if ("pdf".equalsIgnoreCase(format)) {
                data = exportService.generatePdf(transactions, groupName);
                contentType = "application/pdf";
                fileExtension = "pdf";
            } else {
                data = exportService.generateCsv(transactions);
                contentType = "text/csv";
                fileExtension = "csv";
            }

            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            filename = String.format("%s_transactions_%s.%s",
                    groupName.replaceAll("[^a-zA-Z0-9]", "_"),
                    dateFormat.format(new Date()),
                    fileExtension);

            logger.info("Generated {} file with {} bytes", format.toUpperCase(), data.length);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(data.length))
                    .body(data);

        } catch (IllegalArgumentException e) {
            logger.error("Invalid request parameters: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error generating export for group {}: {}", groupId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}