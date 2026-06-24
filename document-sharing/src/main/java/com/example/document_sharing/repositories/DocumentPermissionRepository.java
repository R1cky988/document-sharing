package com.example.document_sharing.repositories;

import com.example.document_sharing.models.DocumentPermission;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentPermissionRepository extends JpaRepository<DocumentPermission, Long> {

    Optional<DocumentPermission>
    findByDocumentIdAndUserId(
            Long documentId,
            Long userId
    );

    boolean existsByDocumentIdAndUserId(
            Long documentId,
            Long userId
    );

    @Modifying
    @Transactional
    @Query("""
    DELETE FROM DocumentPermission dp
    WHERE dp.document.id = :documentId
    """)
    void deleteByDocumentId(Long documentId);

    @Query("""
    SELECT dp
    FROM DocumentPermission dp
    JOIN FETCH dp.document d
    JOIN FETCH d.owner
    WHERE dp.user.id = :userId
    """)
    Page<DocumentPermission> findByUserId(@Param("userId") Long userId, Pageable pageable);

    Page<DocumentPermission> findByDocumentId(Long documentId, Pageable pageable);
}
