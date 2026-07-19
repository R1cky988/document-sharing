package com.example.document_sharing.repositories;

import com.example.document_sharing.models.ResetPasswordToken;
import com.example.document_sharing.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<ResetPasswordToken, Long> {
    Optional<ResetPasswordToken> findByToken(String token);
    void deleteByUser(User user);
}
