
package com.example.Parking.controller;
import com.example.Parking.dto.AuthResponse;
import com.example.Parking.dto.LoginRequest;
import com.example.Parking.dto.RegisterRequest;
import com.example.Parking.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 🟢 REGISTER
    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    // 🔵 LOGIN
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest req) {
        return authService.login(req);
    }
}