
package com.saferoute.service;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.saferoute.entity.User;
import com.saferoute.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User registerUser(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        String encodedPassword =
                passwordEncoder.encode(user.getPassword());

        user.setPassword(encodedPassword);

        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("Email not registered");
        }

        boolean passwordMatches =
                passwordEncoder.matches(password, user.getPassword());

        if (!passwordMatches) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }

    // Update user profile
    public User updateProfile(Long id, String fullName, String phone) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (fullName == null || fullName.trim().isEmpty()) {
            throw new RuntimeException("Full name cannot be empty");
        }

        if (phone == null || phone.trim().isEmpty()) {
            throw new RuntimeException("Phone number cannot be empty");
        }

        user.setFullName(fullName.trim());
        user.setPhone(phone.trim());

        return userRepository.save(user);
    }
}
