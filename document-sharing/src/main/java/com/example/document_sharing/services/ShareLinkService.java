package com.example.document_sharing.services;

import com.example.document_sharing.dtos.request.ActivityLogDTO;
import com.example.document_sharing.dtos.response.DownloadResult;
import com.example.document_sharing.models.Document;
import com.example.document_sharing.models.DocumentPermission;
import com.example.document_sharing.models.ShareLink;
import com.example.document_sharing.models.User;
import com.example.document_sharing.repositories.DocumentPermissionRepository;
import com.example.document_sharing.repositories.DocumentRepository;
import com.example.document_sharing.repositories.ShareLinkRepository;
import com.example.document_sharing.utils.ActionType;
import com.example.document_sharing.utils.PermissionType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ShareLinkService {
    private final ShareLinkRepository shareLinkRepository;
    private final DocumentRepository documentRepository;
    private final DocumentPermissionRepository documentPermissionRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final UserService userService;
    private final MinioService minioService;

    public String createSharedLink(Long documentId) {
        User currentUser = userService.getCurrentUser();

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        var permission = documentPermissionRepository.findByDocumentIdAndUserId(documentId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Access denied"));

        if (permission.getPermissionType() != PermissionType.OWNER) {
            throw new RuntimeException("Only owner can share document");
        }

        Optional<ShareLink> existingLink = shareLinkRepository.findByDocumentId(documentId);

        if (existingLink.isPresent()) {
            shareLinkRepository.delete(existingLink.get());
        }

        String token = UUID.randomUUID().toString();
        ShareLink sharedLink = ShareLink.builder()
                .token(token)
                .document(document)
                .expiresAt(Instant.now().plus(30, ChronoUnit.DAYS))
                .build();

        eventPublisher.publishEvent(new ActivityLogDTO(
                ActionType.CREATE_LINK,
                currentUser,
                null,
                document.getId(),
                document.getOriginalName()
        ));

        shareLinkRepository.save(sharedLink);
        return token;
    }

    public String deleteShareLink(Long documentId) {
        User currentUser = userService.getCurrentUser();

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        DocumentPermission permission = documentPermissionRepository
                .findByDocumentIdAndUserId(documentId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Access denied"));

        if (permission.getPermissionType() != PermissionType.OWNER) {
            throw new RuntimeException("Only owner can delete share token");
        }

        eventPublisher.publishEvent(new ActivityLogDTO(
                ActionType.DELETE_LINK,
                currentUser,
                null,
                document.getId(),
                document.getOriginalName()
        ));

        if (shareLinkRepository.findByDocumentId(documentId).isPresent()) {
            shareLinkRepository.deleteByDocumentId(documentId);
            return "Share link deleted successfully";
        } else {
            throw new RuntimeException("No share link found for this document");
        }
    }

    public DownloadResult viewSharedDocument(String token) throws Exception {

        User currentUser = userService.getCurrentUserOrNull();

        ShareLink shareLink = shareLinkRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Link không tồn tại"));

        if (shareLink.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Link đã hết hạn");
        }

        Document document = shareLink.getDocument();

        InputStream stream = minioService.download(document.getObjectName());

        eventPublisher.publishEvent(new ActivityLogDTO(
                ActionType.VIEW_VIA_LINK,
                currentUser,
                null,
                document.getId(),
                document.getOriginalName()
        ));

        return new DownloadResult(
                stream,
                document.getOriginalName(),
                document.getContentType()
        );
    }
    @Scheduled(cron = "0 0 1 * * ?")
    public void cleanupExpiredLinks() {
        shareLinkRepository.deleteByExpiresAtBefore(Instant.now());
    }

}
