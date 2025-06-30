package com.fintrack.fintrack.dto;

import com.fintrack.fintrack.model.TransactionType;

import java.time.LocalDate;

public class TransactionRequest {
    private Double amount;
    private TransactionType type;
    private String category;
    private String note;
    private LocalDate date;
    private Long groupId;

    public TransactionRequest() {}

    // Getters & Setters
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
}
