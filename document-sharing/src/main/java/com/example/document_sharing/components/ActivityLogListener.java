package com.example.document_sharing.components;

import com.example.document_sharing.dtos.request.ActivityLogDTO;
import com.example.document_sharing.models.ActivityLog;
import com.example.document_sharing.models.Document;
import com.example.document_sharing.models.RecentDocument;
import com.example.document_sharing.repositories.ActivityLogRepository;
import com.example.document_sharing.repositories.DocumentRepository;
import com.example.document_sharing.repositories.RecentDocumentRepository;
import com.example.document_sharing.utils.ActionType;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class ActivityLogListener {

    private final ActivityLogRepository activityLogRepository;
    private final RecentDocumentRepository recentDocumentRepository;
    private final DocumentRepository documentRepository;

    @EventListener
    @Async
    @Transactional
    public void handleActivityLog(ActivityLogDTO activityLogDTO) {

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
        if (activityLogDTO.getUser() != null &&
                (activityLogDTO.getAction() == ActionType.VIEW || activityLogDTO.getAction() == ActionType.VIEW_VIA_LINK)) {

            Document document = documentRepository.findById(activityLogDTO.getDocumentId()).orElse(null);

            if (document != null) {
                RecentDocument recentDocument = recentDocumentRepository
                        .findByUserAndDocument(activityLogDTO.getUser(), document)
                        .orElse(RecentDocument.builder()
                                .user(activityLogDTO.getUser())
                                .document(document)
                                .build());

                recentDocument.setViewedAt(LocalDateTime.now());

                recentDocumentRepository.save(recentDocument);
            }
        }
    }
}
