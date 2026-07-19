package com.example.document_sharing.dtos.response;

import com.example.document_sharing.utils.PermissionType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class RecentDocumentResponse {
    private Long documentId;
    private String originalName;
    private String contentType;
    private LocalDateTime viewedAt;
    private String ownerName;
}
