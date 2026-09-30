package com.example.Parking.service;
import com.example.Parking.dto.AuthResponse;
import com.example.Parking.dto.LoginRequest;
import com.example.Parking.dto.RegisterRequest;
import com.example.Parking.entity.User;
import com.example.Parking.repository.UserRepository;
import com.example.Parking.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // 🟢 REGISTER
    public String register(RegisterRequest req) {

        if (!req.getPassword().equals(req.getConfirmPassword())) {
            return "Les mots de passe ne correspondent pas";
        }

        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            return "Cet email est déjà utilisé";
        }

        User user = new User();
        user.setPrenom(req.getPrenom());
        user.setNom(req.getNom());
        user.setEmail(req.getEmail());
        user.setTelephone(req.getTelephone());
        user.setImmatriculation(req.getImmatriculation());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole("ROLE_USER");

        userRepository.save(user);

        return " Utilisateur enregistré avec succès";
    }


    public AuthResponse login(LoginRequest req) {

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Email incorrect"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole());

        AuthResponse res = new AuthResponse();
        res.setToken(token);
        res.setRole(user.getRole());
        res.setEmail(user.getEmail());
        res.setPrenom(user.getPrenom());
        res.setNom(user.getNom());

        return res;
    }

}