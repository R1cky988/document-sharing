package com.example.document_sharing.dtos.response;

import com.example.document_sharing.utils.ActionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogResponse {
    private Long id;
    private ActionType action;
    private String performerName;
    private Long userId;
    private Long documentId;
    private String documentName;
    private Instant createdAt;
}
