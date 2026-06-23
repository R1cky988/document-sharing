package com.example.document_sharing.services;

import com.example.document_sharing.dtos.response.DocumentResponse;
import com.example.document_sharing.dtos.response.DownloadResult;
import com.example.document_sharing.models.Document;
import com.example.document_sharing.models.DocumentPermission;
import com.example.document_sharing.models.User;
import com.example.document_sharing.repositories.DocumentPermissionRepository;
import com.example.document_sharing.repositories.DocumentRepository;
import com.example.document_sharing.utils.PermissionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final UserService userService;
    private final DocumentPermissionRepository documentPermissionRepository;
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

        return savedDocument;
    }

    public List<DocumentResponse> getMyDocuments() {
        User currentUser = userService.getCurrentUser();

        List<DocumentPermission> permissions =
                documentPermissionRepository.findByUserId(
                        currentUser.getId()
                );
        return permissions.stream()
                .map(permission -> {

                    Document document = permission.getDocument();

                    return DocumentResponse.builder()
                            .id(document.getId())
                            .originalName(document.getOriginalName())
                            .contentType(document.getContentType())
                            .fileSize(document.getFileSize())
                            .createdAt(document.getCreatedAt())
                            .ownerId(document.getOwner().getId())
                            .ownerName(document.getOwner().getName())
                            .currentUserPermission(
                                    permission.getPermissionType()
                            )
                            .build();
                })
                .toList();
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

        return new DownloadResult(
                stream,
                document.getOriginalName(),
                document.getContentType()
        );
    }

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

        return "Document shared successfully";
    }

    public DownloadResult viewDocument(Long documentId) throws Exception{
        User currentUser = userService.getCurrentUser();

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        documentPermissionRepository.findByDocumentIdAndUserId(documentId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Access denied"));

        InputStream stream = minioService.download(document.getObjectName());

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
        

        documentRepository.delete(document);

        return "Document deleted successfully";
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
