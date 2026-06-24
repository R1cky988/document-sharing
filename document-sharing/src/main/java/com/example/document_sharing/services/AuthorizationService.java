package com.example.document_sharing.services;

import com.example.document_sharing.dtos.request.ActivityLogDTO;
import com.example.document_sharing.dtos.response.PermissionResponse;
import com.example.document_sharing.models.Document;
import com.example.document_sharing.models.DocumentPermission;
import com.example.document_sharing.models.User;
import com.example.document_sharing.repositories.DocumentPermissionRepository;
import com.example.document_sharing.repositories.DocumentRepository;
import com.example.document_sharing.utils.ActionType;
import com.example.document_sharing.utils.PermissionType;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthorizationService {

    private final DocumentRepository documentRepository;
    private final DocumentPermissionRepository documentPermissionRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final UserService userService;

    public String shareDocument(
            String email,
            Long documentId
    ) {

        User currentUser = userService.getCurrentUser();

        DocumentPermission ownerPermission =
                documentPermissionRepository
                        .findByDocumentIdAndUserId(
                                documentId,
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Access denied"
                                ));

        User targetUser =
                userService.findUserWithEmail(email);

        Document document =
                documentRepository.findById(documentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Document not found"
                                ));

        if (ownerPermission.getPermissionType()
                != PermissionType.OWNER) {
            throw new RuntimeException(
                    "Only owner can share document"
            );
        }

        if (documentPermissionRepository
                .existsByDocumentIdAndUserId(
                        documentId,
                        targetUser.getId()
                )) {

            throw new RuntimeException(
                    "User already has access"
            );
        }

        DocumentPermission permission =
                DocumentPermission.builder()
                        .document(document)
                        .user(targetUser)
                        .permissionType(PermissionType.READER)
                        .build();

        documentPermissionRepository.save(permission);

        eventPublisher.publishEvent(new ActivityLogDTO(
                ActionType.SHARE,
                currentUser,
                null,
                document.getId(),
                document.getOriginalName()
        ));

        return "Document shared successfully";
    }

    public Page<PermissionResponse> getPermission(Long documentId, Pageable pageable){
        User currentUser = userService.getCurrentUser();

        Document document = documentRepository.findById(documentId)
                .orElseThrow(()-> new RuntimeException("Cannot find document"));

        DocumentPermission permission = documentPermissionRepository.findByDocumentIdAndUserId(
                documentId,
                currentUser.getId()
        ).orElseThrow(()-> new RuntimeException("Access denied"));

        if(permission.getPermissionType() != PermissionType.OWNER){
            throw new RuntimeException("Only owner can do this action");
        }

        return documentPermissionRepository.findByDocumentId(documentId, pageable)
                .map(dp -> PermissionResponse.builder()
                        .userId(dp.getUser().getId())
                        .userName(dp.getUser().getName())
                        .documentId(document.getId())
                        .permission(dp.getPermissionType())
                        .build());
    }

}
