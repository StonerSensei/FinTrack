package com.fintrack.fintrack.controller;

import com.fintrack.fintrack.model.TransactionGroup;
import com.fintrack.fintrack.model.User;
import com.fintrack.fintrack.service.TransactionGroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class TransactionGroupController {

    private final TransactionGroupService groupService;

    public TransactionGroupController(TransactionGroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    public ResponseEntity<TransactionGroup> createGroup(@RequestParam String name, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(groupService.createGroup(name, user));
    }

    @GetMapping
    public ResponseEntity<List<TransactionGroup>> getGroups(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(groupService.getUserGroups(user));
    }
}
