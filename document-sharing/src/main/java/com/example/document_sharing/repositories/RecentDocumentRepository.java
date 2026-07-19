package com.example.document_sharing.repositories;

import com.example.document_sharing.models.Document;
import com.example.document_sharing.models.RecentDocument;
import com.example.document_sharing.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecentDocumentRepository extends JpaRepository<RecentDocument, Long> {
    Page<RecentDocument> findByUserOrderByViewedAtDesc(User user, Pageable pageable);
    Optional<RecentDocument> findByUserAndDocument(User user, Document document);
}
