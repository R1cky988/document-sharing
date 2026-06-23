package com.example.document_sharing.dtos.request;

import lombok.*;

@Builder
@Data
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ShareRequest {
    public String email;
}
