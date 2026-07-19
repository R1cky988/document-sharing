package com.example.document_sharing.controllers;

import com.example.document_sharing.dtos.request.*;
import com.example.document_sharing.dtos.response.AuthenticationResponse;
import com.example.document_sharing.dtos.response.RecentDocumentResponse;
import com.example.document_sharing.models.User;
import com.example.document_sharing.repositories.RecentDocumentRepository;
import com.example.document_sharing.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.naming.Binding;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterDTO registerDTO,
            BindingResult result
    ){
        try{
            if(result.hasErrors()){
                List<String> errorMessages = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessages);
            }

            return ResponseEntity.ok(userService.register(registerDTO));
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginDTO loginDTO,
            BindingResult result
    ){
        try{
            if(result.hasErrors()){
                List<String> errorMessages = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessages);
            }

            AuthenticationResponse loginResult = userService.login(loginDTO);
            return ResponseEntity.ok(loginResult);

        }catch (Exception e){
            return ResponseEntity.badRequest().body("Email/Password is incorrect");
        }

    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {

        try {
            User user = userService.getCurrentUser();

            return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "name", user.getName()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(
            @PathVariable Long id,
            BindingResult result
    ){
        try{
            if(result.hasErrors()){
                List<String> errorMessages = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessages);
            }

            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);

        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }

    @PutMapping("/info")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileDTO dto) {
        try {
            return ResponseEntity.ok(userService.updateProfile(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordDTO dto) {
        try {
            userService.changePassword(dto);
            return ResponseEntity.ok("Đổi mật khẩu thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateAvatar(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Vui lòng chọn một file ảnh");
            }

            String newAvatarUrl = userService.updateAvatar(file);
            return ResponseEntity.ok(newAvatarUrl);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống khi tải ảnh lên: " + e.getMessage());
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteUser(){
        userService.deleteUser();
        return ResponseEntity.ok("Delete successfully");
    }

    @GetMapping("/my-avatar")
    public ResponseEntity<Resource> getMyAvatar() {
        try {
            InputStream inputStream = userService.downloadMyAvatar();
            InputStreamResource resource = new InputStreamResource(inputStream);

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgetPassword(@RequestBody Map<String, String> request){
        String email = request.get("email");
        try {
            userService.createPasswordResetToken(email);
            return ResponseEntity.ok("Vui lòng kiểm tra email của bạn");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordDTO dto){
        try {
            userService.resetPassword(dto.getToken(), dto.getNewPassword());
            return ResponseEntity.ok("Đặt lại mật khẩu thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getRecentViewedDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        try {
            Page<RecentDocumentResponse> response = userService.getRecentViewedDocuments(page, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
