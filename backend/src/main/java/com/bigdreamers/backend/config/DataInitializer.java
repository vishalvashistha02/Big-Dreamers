package com.bigdreamers.backend.config;

import com.bigdreamers.backend.entity.User;
import com.bigdreamers.backend.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Find existing admin or initialize new Admin record
        List<User> adminList = userRepository.findByRole("ADMIN");
        User admin;
        if (!adminList.isEmpty()) {
            admin = adminList.get(0);
        } else {
            Optional<User> adminOpt = userRepository.findByUsername("BD_ADMIN_2026")
                    .or(() -> userRepository.findByUsername("admin"))
                    .or(() -> userRepository.findByMobile("9999999999"));
            admin = adminOpt.orElseGet(User::new);
        }

        admin.setName("Big Dreamers Admin");
        admin.setUsername("BD_ADMIN_2026");
        admin.setPassword(BCrypt.hashpw("BD@Admin#2026!", BCrypt.gensalt()));
        admin.setRole("ADMIN");
        admin.setStatus("Active");
        if (admin.getEmail() == null) {
            admin.setEmail("admin@bigdreamers.com");
        }
        if (admin.getMobile() == null) {
            admin.setMobile("9999999999");
        }
        userRepository.save(admin);
        System.out.println("Admin account configured: Admin ID = BD_ADMIN_2026");
    }
}
