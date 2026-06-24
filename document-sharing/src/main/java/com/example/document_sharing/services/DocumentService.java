package com.example.document_sharing.services;

import com.example.document_sharing.dtos.request.ActivityLogDTO;
import com.example.document_sharing.dtos.response.DocumentResponse;
import com.example.document_sharing.dtos.response.DownloadResult;
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
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final DocumentPermissionRepository documentPermissionRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final UserService userService;
    private final MinioService minioService;

    public Document uploadDocument(MultipartFile file) throws Exception {
        User existedUser = userService.getCurrentUser();

        String objectName = minioService.upload(file);

        Document document = Document.builder()
                .originalName(file.getOriginalFilename())
                .objectName(objectName)
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .createdAt(Instant.now())
                .owner(existedUser)
                .build();

        Document savedDocument = documentRepository.save(document);

        DocumentPermission documentPermission = DocumentPermission.builder()
                .document(savedDocument)
                .user(existedUser)
                .permissionType(PermissionType.OWNER)
                .build();
        documentPermissionRepository.save(documentPermission);

        eventPublisher.publishEvent(new ActivityLogDTO(
                ActionType.UPLOAD,
                existedUser,
                null,
                savedDocument.getId(),
                savedDocument.getOriginalName()
        ));

        return savedDocument;
    }

    public Page<DocumentResponse> getMyDocuments(Pageable pageable) {
        User currentUser = userService.getCurrentUser();

        Page<DocumentPermission> permissionsPage =
                documentPermissionRepository.findByUserId(currentUser.getId(), pageable);

        return permissionsPage.map(permission -> {
            Document document = permission.getDocument();

            return DocumentResponse.builder()
                    .id(document.getId())
                    .originalName(document.getOriginalName())
                    .contentType(document.getContentType())
                    .fileSize(document.getFileSize())
                    .createdAt(document.getCreatedAt())
                    .ownerId(document.getOwner().getId())
                    .ownerName(document.getOwner().getName())
                    .currentUserPermission(permission.getPermissionType())
                    .build();
        });
    }

    public DownloadResult downloadDocument(
            Long documentId
    ) throws Exception {

        User currentUser =
                userService.getCurrentUser();

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() ->
                        new RuntimeException("Document not found"));

        DocumentPermission permission =
                documentPermissionRepository
                        .findByDocumentIdAndUserId(
                                documentId,
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Access denied"
                                ));

        InputStream stream =
                minioService.download(
                        document.getObjectName()
                );

        eventPublisher.publishEvent(new ActivityLogDTO(
                ActionType.DOWNLOAD,
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

    public DownloadResult viewDocument(Long documentId) throws Exception{
        User currentUser = userService.getCurrentUser();

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        documentPermissionRepository.findByDocumentIdAndUserId(documentId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Access denied"));

        InputStream stream = minioService.download(document.getObjectName());

        eventPublisher.publishEvent(new ActivityLogDTO(
                ActionType.VIEW,
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

    public String deleteDocument(Long documentId) throws Exception {

        User currentUser = userService.getCurrentUser();

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() ->
                        new RuntimeException("Document not found"));

        DocumentPermission permission =
                documentPermissionRepository
                        .findByDocumentIdAndUserId(
                                documentId,
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException("Access denied"));

        if (permission.getPermissionType() != PermissionType.OWNER) {
            throw new RuntimeException(
                    "Only owner can delete document"
            );
        }



        minioService.delete(
                document.getObjectName()
        );

        eventPublisher.publishEvent(new ActivityLogDTO(
                ActionType.DELETE,
                currentUser,
                null,
                document.getId(),
                document.getOriginalName()
        ));

        documentRepository.delete(document);

        return "Document deleted successfully";
    }

    public Page<DocumentResponse> search(String keyword, String contentType, Pageable pageable) {
        User currentUser = userService.getCurrentUser();

        Specification<Document> spec = Specification
                .where(DocumentSpecification.accessibleByUser(currentUser.getId()))
                .and(DocumentSpecification.hasKeyword(keyword))
                .and(DocumentSpecification.hasContentType(contentType));;

        Page<Document> documentPage = documentRepository.findAll(spec, pageable);

        return documentPage.map(document -> {
            PermissionType currentPermission = document.getPermissions().stream()
                    .filter(p -> p.getUser().getId().equals(currentUser.getId()))
                    .map(DocumentPermission::getPermissionType)
                    .findFirst()
                    .orElse(PermissionType.READER);

            return DocumentResponse.builder()
                    .id(document.getId())
                    .originalName(document.getOriginalName())
                    .contentType(document.getContentType())
                    .fileSize(document.getFileSize())
                    .createdAt(document.getCreatedAt())
                    .ownerId(document.getOwner().getId())
                    .ownerName(document.getOwner().getName())
                    .currentUserPermission(currentPermission)
                    .build();
        });
    }


    public DocumentResponse toResponse(Document document) {
        return DocumentResponse.builder()
                .id(document.getId())
                .originalName(document.getOriginalName())
                .contentType(document.getContentType())
                .fileSize(document.getFileSize())
                .createdAt(document.getCreatedAt())
                .ownerId(document.getOwner().getId())
                .ownerName(document.getOwner().getName())
                .currentUserPermission(PermissionType.OWNER)
                .build();
    }
}
