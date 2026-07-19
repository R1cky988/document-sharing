package com.example.document_sharing.dtos.request;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class ChangePasswordDTO {
    public String oldPassword;
    public String newPassword;
}
