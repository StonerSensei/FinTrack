package com.fintrack.fintrack.dto;

import com.fintrack.fintrack.model.Transaction;

import java.util.List;

public class GroupDetails {
    private Long groupId;
    private String groupName;
    private Double income;
    private Double expense;
    private Double balance;
    private List<Transaction> transactions;

    public GroupDetails(Long groupId, String groupName, Double income, Double expense, List<Transaction> transactions) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.income = (income != null) ? income : 0.0;
        this.expense = (expense != null) ? expense : 0.0;
        this.balance = this.income - this.expense;
        this.transactions = transactions;
    }

    public Long getGroupId() { return groupId; }
    public String getGroupName() { return groupName; }
    public Double getIncome() { return income; }
    public Double getExpense() { return expense; }
    public Double getBalance() { return balance; }
    public List<Transaction> getTransactions() { return transactions; }
}
