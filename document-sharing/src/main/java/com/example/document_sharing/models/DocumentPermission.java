package com.example.document_sharing.models;

import com.example.document_sharing.utils.PermissionType;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "documents")
@Builder
public class DocumentPermission {
    private Long documentId;

    private Long userId;

    private PermissionType permissionType;
}
