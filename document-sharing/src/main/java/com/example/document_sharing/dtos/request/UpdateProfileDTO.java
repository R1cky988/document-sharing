package com.example.document_sharing.dtos.request;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class UpdateProfileDTO {
    private String name;
    private String email;
}
