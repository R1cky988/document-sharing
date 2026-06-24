package com.example.document_sharing.dtos.request;

import com.example.document_sharing.models.User;
import com.example.document_sharing.utils.ActionType;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ActivityLogDTO {
    private final ActionType action;
    private final User user;
    private final String guestInfo;
    private final Long documentId;
    private final String documentName;
}
