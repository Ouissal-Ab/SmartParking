package com.example.Parking.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {

        // 📡 messages backend → frontend
        config.enableSimpleBroker("/topic");

        // 📤 messages frontend → backend
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

        registry.addEndpoint("/ws")
                // 🔥 obligatoire pour Next.js + Spring Security
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}