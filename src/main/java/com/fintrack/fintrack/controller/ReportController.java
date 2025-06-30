package com.fintrack.fintrack.controller;

import com.fintrack.fintrack.dto.MonthlySummary;
import com.fintrack.fintrack.dto.ReportSummary;
import com.fintrack.fintrack.model.User;
import com.fintrack.fintrack.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ReportSummary> generateSummaryReport(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long groupId) {

        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        ReportSummary summary = reportService.generateSummaryReport(user, startDate, endDate, groupId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<MonthlySummary>> generateMonthlyReport(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "6") int monthsBack) {

        List<MonthlySummary> monthlySummaries = reportService.generateMonthlyReport(user, monthsBack);
        return ResponseEntity.ok(monthlySummaries);
    }
}