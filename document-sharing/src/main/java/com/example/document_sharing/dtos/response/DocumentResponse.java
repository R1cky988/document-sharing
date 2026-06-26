package com.example.document_sharing.dtos.response;

import com.example.document_sharing.utils.PermissionType;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {

    private Long id;

    private String originalName;

    private String contentType;

    private Long fileSize;

    private Instant createdAt;

    private Long ownerId;

    private String ownerName;

    private PermissionType currentUserPermission;

    private boolean isStarred;
}