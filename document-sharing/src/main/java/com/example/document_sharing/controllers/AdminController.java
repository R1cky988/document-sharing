package com.example.document_sharing.controllers;

import com.example.document_sharing.dtos.response.LogResponse;
import com.example.document_sharing.models.ActivityLog;
import com.example.document_sharing.services.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ActivityLogService logService;

    @GetMapping("/log")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSystemLog(
            @PageableDefault(size = 20, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable
    ){
        Page<LogResponse> activityLogs = logService.getAllLogsForAdmin(pageable);
        return ResponseEntity.ok(new PagedModel<>(activityLogs));
    }
}
