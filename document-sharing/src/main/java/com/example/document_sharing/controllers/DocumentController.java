package com.example.document_sharing.controllers;

import com.example.document_sharing.dtos.request.ShareRequest;
import com.example.document_sharing.dtos.response.DocumentResponse;
import com.example.document_sharing.dtos.response.DownloadResult;
import com.example.document_sharing.dtos.response.PermissionResponse;
import com.example.document_sharing.models.Document;
import com.example.document_sharing.services.AuthorizationService;
import com.example.document_sharing.services.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final AuthorizationService authorizationService;

    @PostMapping("/upload")
    public ResponseEntity<DocumentResponse> upload(
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        Document document = documentService.uploadDocument(file);

        return ResponseEntity.ok(
                documentService.toResponse(document)
        );
    }

    @GetMapping("/my-document")
    public ResponseEntity<?> getAllDocument(
            @PageableDefault(size = 10, sort = "id")Pageable pageable
            ) {

        return ResponseEntity.ok(
                documentService.getMyDocuments(pageable)
        );
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Long id
    ) throws Exception {

        DownloadResult result =
                documentService.downloadDocument(id);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                result.getFileName() +
                                "\""
                )
                .contentType(
                        MediaType.parseMediaType(
                                result.getContentType()
                        )
                )
                .body(
                        new InputStreamResource(
                                result.getInputStream()
                        )
                );
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<?> shareDocument(
            @PathVariable Long id,
            @RequestBody ShareRequest shareRequest
    ){
        try{
            return ResponseEntity.ok( authorizationService.shareDocument(shareRequest.getEmail(), id));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/view")
    public ResponseEntity<?> viewDocument(
            @PathVariable Long id
    ) throws Exception{
        try{
            DownloadResult result = documentService.viewDocument(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + result.getFileName() + "\"")
                    .contentType(MediaType.parseMediaType(result.getContentType()))
                    .body(new InputStreamResource(result.getInputStream()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("{id}")
    public ResponseEntity<DocumentResponse> getDocument(
            @PathVariable Long id
    ){
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable Long id
    ) throws Exception {
        try{
            documentService.deleteDocument(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{documentId}/permissions")
    public ResponseEntity<?> getDocumentPermissions(
            @PathVariable Long documentId,
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {

        return ResponseEntity.ok(new PagedModel<>(authorizationService.getPermission(documentId, pageable)));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchDocuments(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String contentType,
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {

        Page<DocumentResponse> result = documentService.search(keyword, contentType, pageable);
        return ResponseEntity.ok(new PagedModel<>(result));
    }

    @PostMapping("/{id}/toggle-star")
    public ResponseEntity<?> starDocument(
            @PathVariable Long id
    ){
        documentService.starDocument(id);
        return ResponseEntity.ok("Starred");
    }

    @GetMapping("/starred")
    public ResponseEntity<Page<DocumentResponse>> getStarredDocuments(
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(
                documentService.getStarredDocuments(pageable)
        );
    }

    @DeleteMapping("/{id}/permission")
    public ResponseEntity<?> removeMyPermission(@PathVariable Long id) {
        documentService.removeMyPermission(id);
        return ResponseEntity.ok().build();
    }
}
