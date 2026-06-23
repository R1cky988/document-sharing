package com.example.document_sharing.dtos.request;

import lombok.*;

@Builder
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDTO {

    public String email;

    public String password;

    public String name;
}
