package com.fintrack.fintrack.repo;

import com.fintrack.fintrack.model.Transaction;
import com.fintrack.fintrack.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUser(User user);

    List<Transaction> findByGroupIdOrderByDateDesc(Long groupId);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user ORDER BY t.date DESC, t.id DESC LIMIT 5")
    List<Transaction> findTop5ByUserOrderByDateDesc(@Param("user") User user);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.date BETWEEN :startDate AND :endDate")
    List<Transaction> findByUserAndDateBetween(
            @Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.group.id = :groupId AND t.date BETWEEN :startDate AND :endDate")
    List<Transaction> findByUserAndGroupIdAndDateBetween(
            @Param("user") User user,
            @Param("groupId") Long groupId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

}