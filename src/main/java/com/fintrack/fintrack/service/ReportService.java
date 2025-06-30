package com.fintrack.fintrack.service;

import com.fintrack.fintrack.dto.MonthlySummary;
import com.fintrack.fintrack.dto.ReportSummary;
import com.fintrack.fintrack.model.Transaction;
import com.fintrack.fintrack.model.TransactionType;
import com.fintrack.fintrack.model.User;
import com.fintrack.fintrack.repo.TransactionGroupRepository;
import com.fintrack.fintrack.repo.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final TransactionGroupRepository groupRepository;

    public ReportService(TransactionRepository transactionRepository,
                         TransactionGroupRepository groupRepository) {
        this.transactionRepository = transactionRepository;
        this.groupRepository = groupRepository;
    }

    public ReportSummary generateSummaryReport(User user, LocalDate startDate, LocalDate endDate, Long groupId) {
        List<Transaction> transactions;

        if (groupId != null) {
            transactions = transactionRepository.findByUserAndGroupIdAndDateBetween(
                    user, groupId, startDate, endDate);
        } else {
            transactions = transactionRepository.findByUserAndDateBetween(
                    user, startDate, endDate);
        }

        double totalIncome = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double totalExpense = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .mapToDouble(Transaction::getAmount)
                .sum();

        Map<String, Double> incomeByCategory = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.summingDouble(Transaction::getAmount)
                ));

        Map<String, Double> expenseByCategory = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.summingDouble(Transaction::getAmount)
                ));

        return new ReportSummary(
                totalIncome,
                totalExpense,
                totalIncome - totalExpense,
                incomeByCategory,
                expenseByCategory,
                transactions
        );
    }

    public List<MonthlySummary> generateMonthlyReport(User user, int monthsBack) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(monthsBack).withDayOfMonth(1);

        return IntStream.rangeClosed(0, monthsBack)
                .mapToObj(i -> {
                    LocalDate monthStart = endDate.minusMonths(i).withDayOfMonth(1);
                    LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);

                    List<Transaction> monthlyTransactions = transactionRepository
                            .findByUserAndDateBetween(user, monthStart, monthEnd);

                    double income = monthlyTransactions.stream()
                            .filter(t -> t.getType() == TransactionType.INCOME)
                            .mapToDouble(Transaction::getAmount)
                            .sum();

                    double expense = monthlyTransactions.stream()
                            .filter(t -> t.getType() == TransactionType.EXPENSE)
                            .mapToDouble(Transaction::getAmount)
                            .sum();

                    return new MonthlySummary(
                            monthStart.getMonth().toString(),
                            monthStart.getYear(),
                            income,
                            expense
                    );
                })
                .collect(Collectors.toList());
    }
}