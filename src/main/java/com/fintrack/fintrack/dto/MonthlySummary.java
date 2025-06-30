package com.fintrack.fintrack.dto;

public class MonthlySummary {
    private String month;
    private int year;
    private Double income;
    private Double expense;

    // Constructor
    public MonthlySummary(String month, int year, Double income, Double expense) {
        this.month = month;
        this.year = year;
        this.income = income;
        this.expense = expense;
    }

    // Getters and Setters
    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public Double getIncome() {
        return income;
    }

    public void setIncome(Double income) {
        this.income = income;
    }

    public Double getExpense() {
        return expense;
    }

    public void setExpense(Double expense) {
        this.expense = expense;
    }
}
