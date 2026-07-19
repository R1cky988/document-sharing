package com.example.document_sharing.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "recent_documents",
        uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "document_id"})})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(name = "viewed_at", nullable = false)
    private LocalDateTime viewedAt;
}