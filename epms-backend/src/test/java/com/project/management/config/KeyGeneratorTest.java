package com.project.management.config;

import org.junit.jupiter.api.Test;
import java.security.SecureRandom;
import java.util.Base64;

public class KeyGeneratorTest {

    @Test
    public void generateSecureJwtSecret() {
        // Generate 64 secure random bytes (512 bits)
        byte[] secureBytes = new byte[64];
        new SecureRandom().nextBytes(secureBytes);
        
        // Encode to a safe Base64 URL string format
        String jwtSecret = Base64.getUrlEncoder().withoutPadding().encodeToString(secureBytes);
        
        System.out.println("====================================================================");
        System.out.println("COPY AND PASTE THIS INTO YOUR application.properties:");
        System.out.println("====================================================================");
        System.out.println(jwtSecret);
        System.out.println("====================================================================");
    }
}