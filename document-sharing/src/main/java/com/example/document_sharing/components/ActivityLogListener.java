package com.example.document_sharing.components;

import com.example.document_sharing.dtos.request.ActivityLogDTO;
import com.example.document_sharing.models.ActivityLog;
import com.example.document_sharing.repositories.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class ActivityLogListener {

    private final ActivityLogRepository activityLogRepository;

    @EventListener
    @Async
    public void handleActivityLog(ActivityLogDTO activityLogDTO){

        String finalGuestInfo = null;
        if (activityLogDTO.getUser() == null) {
            finalGuestInfo = "Guest";
        }

        ActivityLog log = ActivityLog.builder()
                .action(activityLogDTO.getAction())
                .user(activityLogDTO.getUser())
                .guestInfo(finalGuestInfo)
                .documentId(activityLogDTO.getDocumentId())
                .documentName(activityLogDTO.getDocumentName())
                .createdAt(Instant.now())
                .build();

        activityLogRepository.save(log);
    }

}
