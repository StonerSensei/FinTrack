package com.fintrack.fintrack.service;

import com.fintrack.fintrack.dto.GroupDetails;
import com.fintrack.fintrack.dto.GroupSummary;
import com.fintrack.fintrack.model.Transaction;
import com.fintrack.fintrack.model.TransactionGroup;
import com.fintrack.fintrack.model.User;
import com.fintrack.fintrack.repo.TransactionGroupRepository;
import com.fintrack.fintrack.repo.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionGroupService {

    private final TransactionGroupRepository groupRepository;


    public TransactionGroup createGroup(String name, User user) {
        TransactionGroup group = new TransactionGroup(name, user);
        return groupRepository.save(group);
    }

    private final TransactionRepository transactionRepository;

    public TransactionGroupService(TransactionGroupRepository groupRepository,
                                   TransactionRepository transactionRepository) {
        this.groupRepository = groupRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<TransactionGroup> getUserGroups(User user) {
        return groupRepository.findByUser(user);
    }

    public Optional<TransactionGroup> getById(Long id) {
        return groupRepository.findById(id);
    }

    public List<GroupSummary> getGroupSummaries(User user) {
        List<TransactionGroup> groups = groupRepository.findByUser(user);
        List<GroupSummary> summaries = new ArrayList<>();

        for (TransactionGroup group : groups) {
            Double income = groupRepository.getTotalIncomeByGroupId(group.getId());
            Double expense = groupRepository.getTotalExpenseByGroupId(group.getId());
            summaries.add(new GroupSummary(group.getId(), group.getName(), income, expense));
        }

        return summaries;
    }

    public Optional<TransactionGroup> getGroupByName(String name, User user) {
        return groupRepository.findByNameAndUser(name, user);
    }

    public Optional<GroupDetails> getGroupDetailsByName(String name, User user) {
        Optional<TransactionGroup> groupOpt = groupRepository.findByNameAndUser(name, user);

        if (groupOpt.isEmpty()) return Optional.empty();

        TransactionGroup group = groupOpt.get();
        Long groupId = group.getId();

        Double income = groupRepository.getTotalIncomeByGroupId(groupId);
        Double expense = groupRepository.getTotalExpenseByGroupId(groupId);
        List<Transaction> transactions = transactionRepository.findByGroupIdOrderByDateDesc(groupId);

        return Optional.of(new GroupDetails(groupId, group.getName(), income, expense, transactions));
    }
}
