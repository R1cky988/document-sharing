package com.example.document_sharing.dtos.request;

import java.time.Instant;

public class DocumentDTO {
    public Long id;

    public String name;

    public String accessType;

    public String originalName;

    public Instant createdAt;

    public Long ownerId;
}
