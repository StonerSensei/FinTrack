package com.fintrack.fintrack.dto;

import com.fintrack.fintrack.model.Transaction;

import java.util.List;
import java.util.Map;

public class ReportSummary {
    private Double totalIncome;
    private Double totalExpense;
    private Double balance;
    private Map<String, Double> incomeByCategory;
    private Map<String, Double> expenseByCategory;
    private List<Transaction> transactions;

    // Constructor
    public ReportSummary(Double totalIncome, Double totalExpense, Double balance,
                         Map<String, Double> incomeByCategory,
                         Map<String, Double> expenseByCategory,
                         List<Transaction> transactions) {
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.balance = balance;
        this.incomeByCategory = incomeByCategory;
        this.expenseByCategory = expenseByCategory;
        this.transactions = transactions;
    }

    // Getters and Setters
    public Double getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(Double totalIncome) {
        this.totalIncome = totalIncome;
    }

    public Double getTotalExpense() {
        return totalExpense;
    }

    public void setTotalExpense(Double totalExpense) {
        this.totalExpense = totalExpense;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }

    public Map<String, Double> getIncomeByCategory() {
        return incomeByCategory;
    }

    public void setIncomeByCategory(Map<String, Double> incomeByCategory) {
        this.incomeByCategory = incomeByCategory;
    }

    public Map<String, Double> getExpenseByCategory() {
        return expenseByCategory;
    }

    public void setExpenseByCategory(Map<String, Double> expenseByCategory) {
        this.expenseByCategory = expenseByCategory;
    }

    public List<Transaction> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<Transaction> transactions) {
        this.transactions = transactions;
    }
}
