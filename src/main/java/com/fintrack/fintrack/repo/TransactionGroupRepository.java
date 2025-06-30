package com.fintrack.fintrack.repo;


import com.fintrack.fintrack.model.Transaction;
import com.fintrack.fintrack.model.TransactionGroup;
import com.fintrack.fintrack.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TransactionGroupRepository extends JpaRepository<TransactionGroup, Long> {
    List<TransactionGroup> findByUser(User user);
    Optional<TransactionGroup> findByNameAndUser(String name, User user);
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.group.id = :groupId AND t.type = 'INCOME'")
    Double getTotalIncomeByGroupId(@Param("groupId") Long groupId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.group.id = :groupId AND t.type = 'EXPENSE'")
    Double getTotalExpenseByGroupId(@Param("groupId") Long groupId);



}
