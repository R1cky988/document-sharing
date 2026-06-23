package com.example.document_sharing.controllers;

import com.example.document_sharing.dtos.request.ShareRequest;
import com.example.document_sharing.dtos.response.AuthenticationResponse;
import com.example.document_sharing.dtos.response.DocumentResponse;
import com.example.document_sharing.dtos.response.DownloadResult;
import com.example.document_sharing.models.Document;
import com.example.document_sharing.services.DocumentService;
import lombok.RequiredArgsConstructor;
import org.simpleframework.xml.Path;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

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
    public ResponseEntity<?> getAllDocument() {

        return ResponseEntity.ok(
                documentService.getMyDocuments()
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
            return ResponseEntity.ok( documentService.shareDocument(shareRequest.getEmail(), id));

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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable Long id
    ) throws Exception {
        try{
            return ResponseEntity.ok(
                    documentService.deleteDocument(id)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
