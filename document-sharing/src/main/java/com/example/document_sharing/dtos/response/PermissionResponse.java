package com.example.document_sharing.dtos.response;

import com.example.document_sharing.utils.PermissionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PermissionResponse {
    public Long userId;

    public String userName;

    public Long documentId;

    public PermissionType permission;
}
