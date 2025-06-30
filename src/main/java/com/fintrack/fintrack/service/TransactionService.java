package com.fintrack.fintrack.service;

import com.fintrack.fintrack.dto.GroupDetails;
import com.fintrack.fintrack.dto.GroupSummary;
import com.fintrack.fintrack.model.Transaction;
import com.fintrack.fintrack.model.TransactionGroup;
import com.fintrack.fintrack.model.User;
import com.fintrack.fintrack.repo.TransactionGroupRepository;
import com.fintrack.fintrack.repo.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Autowired
    private TransactionGroupRepository groupRepository;


    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getUserTransactions(User user) {
        return transactionRepository.findByUser(user);
    }

    public Optional<Transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }

    public List<Transaction> getTransactionsByGroup(Long groupId) {
        return transactionRepository.findByGroupIdOrderByDateDesc(groupId);
    }


    public List<Transaction> getRecentTransactions(User user) {
        return transactionRepository.findTop5ByUserOrderByDateDesc(user);
    }

}
