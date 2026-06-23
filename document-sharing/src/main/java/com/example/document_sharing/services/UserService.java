package com.example.document_sharing.services;

import com.example.document_sharing.components.JwtService;
import com.example.document_sharing.dtos.request.LoginDTO;
import com.example.document_sharing.dtos.request.RegisterDTO;
import com.example.document_sharing.dtos.response.AuthenticationResponse;
import com.example.document_sharing.models.Role;
import com.example.document_sharing.models.User;
import com.example.document_sharing.repositories.RoleRepository;
import com.example.document_sharing.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterDTO registerDTO) throws DataIntegrityViolationException {
        String email = registerDTO.getEmail();

        if(userRepository.existsByEmail(email)){
            throw new DataIntegrityViolationException("Email already exists");
        }

        String password = registerDTO.getPassword();

        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Role USER not found"));

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .name(registerDTO.getName())
                .role(userRole)
                .build();

        userRepository.save(user);

        var accessToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);


        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public AuthenticationResponse login(LoginDTO loginDTO) throws DataIntegrityViolationException{

        var user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow();

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

    public User findUserWithEmail(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(()-> new DataIntegrityViolationException("Cannot find user"));
    }

    public void deleteUser(long id) {
        userRepository.deleteById(id);
    }


}
