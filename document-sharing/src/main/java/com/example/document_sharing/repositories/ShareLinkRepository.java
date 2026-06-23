package com.example.document_sharing.repositories;

import com.example.document_sharing.models.ShareLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShareLinkRepository extends JpaRepository<ShareLink, Long> {
    Optional<ShareLink> findByToken(String token);

    Optional<ShareLink> findByDocumentId(Long documentId);

    void deleteByDocumentId(Long documentId);

    void deleteByExpiresAtBefore(java.time.Instant now);
}
