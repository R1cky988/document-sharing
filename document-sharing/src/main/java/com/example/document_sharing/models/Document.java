package com.example.document_sharing.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "documents")
@Builder
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "access_type")
    private String accessType;

    @Column(name = "original_name")
    private String originalName;

    @Column(name = "created_at")
    private Instant createdAt;

    @JoinColumn(name = "owner_id")
    private Long ownerId;
}
