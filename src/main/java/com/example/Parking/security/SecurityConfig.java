package com.example.Parking.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.*;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        return http
                // ✅ CORS handled via CorsConfigurationSource bean
                .cors(Customizer.withDefaults())

                // ❌ CSRF désactivé (API REST)
                .csrf(csrf -> csrf.disable())

                // ❌ session stateless (JWT)
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth

                        // ✅ CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 🟢 AUTH
                        .requestMatchers("/auth/**").permitAll()

                        // 🤖 IA PYTHON
                        .requestMatchers("/ia/**").permitAll()

                        // 📡 WEB SOCKET
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/topic/**").permitAll()
                        .requestMatchers("/app/**").permitAll()

                        // 📚 SWAGGER
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()

                        // 👤 USER
                        .requestMatchers("/user/**").authenticated()

                        // 🔒 ADMIN
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // 🔐 reste protégé
                        .anyRequest().authenticated()
                )

                // 🔑 JWT filter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)

                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}