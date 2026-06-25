package com.example.document_sharing.models;

import com.example.document_sharing.utils.ShareType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "share_link")
public class ShareLink {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String token;

    @ManyToOne
    @JoinColumn(name = "document_id")
    private Document document;

    @Enumerated(EnumType.STRING)
    private ShareType shareType;

    private Instant expiresAt;
}
