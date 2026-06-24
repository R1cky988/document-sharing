package com.example.document_sharing.services;

import com.example.document_sharing.dtos.response.LogResponse;
import com.example.document_sharing.models.ActivityLog;
import com.example.document_sharing.repositories.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActivityLogService {
    private final ActivityLogRepository activityLogRepository;

    public Page<LogResponse> getAllLogsForAdmin(Pageable pageable) {
        Page<ActivityLog> logsPage = activityLogRepository.findAll(pageable);

        return logsPage.map(log -> {
            String performerName = (log.getUser() != null)
                    ? log.getUser().getName()
                    : log.getGuestInfo();

            Long userId = (log.getUser() != null) ? log.getUser().getId() : null;

            return LogResponse.builder()
                    .id(log.getId())
                    .action(log.getAction())
                    .performerName(performerName)
                    .userId(userId)
                    .documentId(log.getDocumentId())
                    .documentName(log.getDocumentName())
                    .createdAt(log.getCreatedAt())
                    .build();
        });
    }
}
