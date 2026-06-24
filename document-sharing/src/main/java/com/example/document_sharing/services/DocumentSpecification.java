package com.example.document_sharing.services;

import com.example.document_sharing.models.Document;
import com.example.document_sharing.models.DocumentPermission;
import jakarta.persistence.criteria.Join;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;


@RequiredArgsConstructor
public class DocumentSpecification {


    public static Specification<Document> hasKeyword(
            String keyword
    ) {
        return (root, query, cb) -> {

            if(keyword == null || keyword.isBlank()) {
                return cb.conjunction();
            }

            return cb.like(
                    cb.lower(root.get("originalName")),
                    "%" + keyword.toLowerCase() + "%"
            );
        };
    }
    public static Specification<Document> hasContentType(String contentType) {
        return (root, query, cb) -> {
            if (contentType == null || contentType.isBlank()) {
                return cb.conjunction();
            }

            return cb.equal(root.get("contentType"), contentType);
        };
    }


    public static Specification<Document> accessibleByUser(
            Long userId
    ) {

        return (root, query, cb) -> {
            if (Long.class != query.getResultType()) {
                query.distinct(true);
            }

            Join<Document, DocumentPermission> permissionJoin =
                    root.join("permissions");

            return cb.equal(
                    permissionJoin.get("user").get("id"),
                    userId
            );
        };
    }
}
