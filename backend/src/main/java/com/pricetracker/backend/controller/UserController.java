package com.pricetracker.backend.controller;

import com.pricetracker.backend.dto.ApiResponse;
import com.pricetracker.backend.model.User;
import com.pricetracker.backend.repository.UserRepository;
import com.pricetracker.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<String>> deleteAccount(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("Request to delete account for user: {}", userDetails.getUsername());
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        userService.deleteUserAccount(user.getId());

        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully.", "DELETED"));
    }
}
