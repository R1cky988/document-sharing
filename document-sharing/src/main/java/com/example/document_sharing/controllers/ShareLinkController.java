package com.example.document_sharing.controllers;

import com.example.document_sharing.dtos.response.DownloadResult;
import com.example.document_sharing.services.ShareLinkService;
import com.example.document_sharing.utils.ShareType;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/shared")
@RequiredArgsConstructor
public class ShareLinkController {
    private final ShareLinkService shareLinkService;

    @PostMapping("/{documentId}/generate")
    public ResponseEntity<String> generateLink(@PathVariable Long documentId, @RequestParam ShareType shareType) {
        try{
            return ResponseEntity.ok(shareLinkService.createSharedLink(documentId, shareType));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/view/{token}")
    public ResponseEntity<?> viewSharedDocument(@PathVariable String token) throws Exception {
        try{
            DownloadResult result = shareLinkService.viewSharedDocument(token);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + result.getFileName() + "\"")
                    .contentType(MediaType.parseMediaType(result.getContentType()))
                    .body(new InputStreamResource(result.getInputStream()));
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<String> deleteShareLink(@PathVariable Long documentId) {
        try{
            shareLinkService.deleteShareLink(documentId);
            return ResponseEntity.ok("Share link deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }



}
