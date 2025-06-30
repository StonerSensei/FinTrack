package com.fintrack.fintrack.dto;

public class GroupSummary {
    private Long groupId;
    private String groupName;
    private Double income;
    private Double expense;
    private Double balance;

    public GroupSummary(Long groupId, String groupName, Double income, Double expense) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.income = (income != null) ? income : 0.0;
        this.expense = (expense != null) ? expense : 0.0;
        this.balance = this.income - this.expense;
    }

    public Long getGroupId() { return groupId; }
    public String getGroupName() { return groupName; }
    public Double getIncome() { return income; }
    public Double getExpense() { return expense; }
    public Double getBalance() { return balance; }
}
