package com.example.document_sharing.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.InputStream;

@Getter
@AllArgsConstructor
public class DownloadResult {
    private InputStream inputStream;

    private String fileName;

    private String contentType;
}
