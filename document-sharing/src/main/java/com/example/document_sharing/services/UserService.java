package com.example.document_sharing.services;

import com.example.document_sharing.dtos.request.ChangePasswordDTO;
import com.example.document_sharing.dtos.request.LoginDTO;
import com.example.document_sharing.dtos.request.RegisterDTO;
import com.example.document_sharing.dtos.request.UpdateProfileDTO;
import com.example.document_sharing.dtos.response.AuthenticationResponse;
import com.example.document_sharing.dtos.response.RecentDocumentResponse;
import com.example.document_sharing.models.RecentDocument;
import com.example.document_sharing.models.ResetPasswordToken;
import com.example.document_sharing.models.Role;
import com.example.document_sharing.models.User;
import com.example.document_sharing.repositories.PasswordResetTokenRepository;
import com.example.document_sharing.repositories.RecentDocumentRepository;
import com.example.document_sharing.repositories.RoleRepository;
import com.example.document_sharing.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RecentDocumentRepository recentDocumentRepository;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender javaMailSender;
    private final MinioService minioService;
    private final JwtService jwtService;

    public AuthenticationResponse register(RegisterDTO registerDTO) throws DataIntegrityViolationException {
        String email = registerDTO.getEmail();

        if(userRepository.existsByEmail(email)){
            throw new DataIntegrityViolationException("Email already exists");
        }

        String password = registerDTO.getPassword();

        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Role USER not found"));

        String defaultAvatarUrl = "avatars/default-avatar.png";

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .name(registerDTO.getName())
                .role(userRole)
                .avatarUrl(defaultAvatarUrl)
                .build();

        userRepository.save(user);

        var accessToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);


        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public AuthenticationResponse login(LoginDTO loginDTO) throws Exception{

        var user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(()-> new RuntimeException("Email/Password is incorrect"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDTO.getEmail(),
                        loginDTO.getPassword())
        );
        var accessToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();

    }

    public User getUserById(Long userId){
        return userRepository.findById(userId)
                .orElseThrow(()->new DataIntegrityViolationException("Cannot find user"));
    }


    public User getCurrentUser() {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        System.out.println("Name" + email);

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getCurrentUserOrNull() {
        try {
            return getCurrentUser();
        } catch (Exception e) {
            return null;
        }
    }

    public User findUserWithEmail(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(()-> new DataIntegrityViolationException("Cannot find user"));
    }

    public void deleteUser() {
        User currentUser = getCurrentUser();

        userRepository.deleteById(currentUser.getId());
    }

    @Transactional
    public AuthenticationResponse updateProfile(UpdateProfileDTO dto) {
        User currentUser = getCurrentUser();

        if (!currentUser.getEmail().equals(dto.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new RuntimeException("Email already in use");
            }
            currentUser.setEmail(dto.getEmail());
        }

        currentUser.setName(dto.getName());
        userRepository.save(currentUser);

        var accessToken = jwtService.generateToken(currentUser);
        var refreshToken = jwtService.generateRefreshToken(currentUser);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Transactional
    public void changePassword(ChangePasswordDTO dto) {
        User currentUser = getCurrentUser();

        if (!passwordEncoder.matches(dto.getOldPassword(), currentUser.getPassword())) {
            throw new RuntimeException("Wrong old password");
        }

        currentUser.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(currentUser);
    }

    public String updateAvatar(MultipartFile file) throws Exception {

        User currentUser = getCurrentUser();

        String oldAvatar = currentUser.getAvatarUrl();

        String newAvatar = minioService.uploadAvatar(file);

        currentUser.setAvatarUrl(newAvatar);
        userRepository.save(currentUser);

        if (oldAvatar != null &&
                !oldAvatar.equals("avatars/default-avatar.png")) {
            minioService.delete(oldAvatar);
        }

        return newAvatar;
    }

    public InputStream downloadMyAvatar() throws Exception {

        User currentUser = getCurrentUser();

        String avatarPath = currentUser.getAvatarUrl();

        if (avatarPath == null || avatarPath.isEmpty()) {
            avatarPath = "avatars/default-avatar.png";
        }

        return minioService.download(avatarPath);
    }

    @Transactional
    public void createPasswordResetToken(String email){
        User user = userRepository.findByEmail(email)
                .orElseThrow(()-> new RuntimeException("Cannot find user"));

        passwordResetTokenRepository.deleteByUser(user);
        passwordResetTokenRepository.flush();

        String token = UUID.randomUUID().toString();
        ResetPasswordToken resetPasswordToken = ResetPasswordToken.builder()
                .token(token)
                .user(user)
                .expirationDate(LocalDateTime.now().plusMinutes(15))
                .build();
        passwordResetTokenRepository.save(resetPasswordToken);
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        sendMail(user.getEmail(), resetLink);
    }

    public void sendMail(String recipientEmail, String link){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipientEmail);
        message.setSubject("Yêu cầu đặt lại mật khẩu");
        message.setText("Bạn đã yêu cầu đặt lại mật khẩu.\n\n"
                + "Vui lòng click vào đường dẫn dưới đây để đặt lại mật khẩu của bạn (Đường dẫn có hiệu lực trong 15 phút):\n"
                + link + "\n\n"
                + "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.");
        javaMailSender.send(message);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        ResetPasswordToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token đặt lại mật khẩu không hợp lệ"));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new RuntimeException("Đường dẫn khôi phục mật khẩu đã hết hạn");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);
    }

    public Page<RecentDocumentResponse> getRecentViewedDocuments(int page, int size) {
        User currentUser = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<RecentDocument> recentPage = recentDocumentRepository.findByUserOrderByViewedAtDesc(currentUser, pageable);
        return recentPage.map(recent -> new RecentDocumentResponse(
                recent.getDocument().getId(),
                recent.getDocument().getOriginalName(),
                recent.getDocument().getContentType(),
                recent.getViewedAt(),
                recent.getUser().getName()
        ));
    }

}
