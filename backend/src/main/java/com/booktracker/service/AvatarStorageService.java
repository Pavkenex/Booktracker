package com.booktracker.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Set;

@Service
public class AvatarStorageService {

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final Path avatarDirectory;

    public AvatarStorageService(@Value("${app.storage.avatar-dir:uploads/avatars}") String avatarDirectory) {
        try {
            this.avatarDirectory = Path.of(avatarDirectory).toAbsolutePath().normalize();
            Files.createDirectories(this.avatarDirectory);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not initialize avatar storage directory", ex);
        }
    }

    public String storeAvatar(Long userId, MultipartFile file) {
        validateFile(file);

        String extension = resolveExtension(file);
        String sanitizedBaseName = sanitizeBaseName(file.getOriginalFilename());
        String fileName = String.format("avatar-%d-%d-%s%s", userId, Instant.now().toEpochMilli(), sanitizedBaseName, extension);
        Path targetLocation = avatarDirectory.resolve(fileName);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to store avatar file", ex);
        }

        return "/uploads/avatars/" + fileName;
    }

    public void deleteAvatar(String avatarUrl) {
        if (avatarUrl == null || avatarUrl.isBlank()) {
            return;
        }

        String normalized = avatarUrl.replace("\\", "/");
        int index = normalized.lastIndexOf('/');
        String fileName = index >= 0 ? normalized.substring(index + 1) : normalized;
        Path target = avatarDirectory.resolve(fileName);

        try {
            if (Files.exists(target)) {
                Files.delete(target);
            }
        } catch (IOException ex) {
            // Log and ignore deletion failures to avoid blocking the user
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Avatar file is required");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Avatar file must be smaller than 5 MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported avatar file type");
        }
    }

    private String resolveExtension(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null) {
            return fallbackExtension(file.getOriginalFilename());
        }

        return switch (contentType.toLowerCase()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> fallbackExtension(file.getOriginalFilename());
        };
    }

    private String fallbackExtension(String originalName) {
        if (originalName == null) {
            return "";
        }
        String ext = StringUtils.getFilenameExtension(originalName);
        return ext != null && !ext.isBlank() ? "." + ext.toLowerCase() : "";
    }

    private String sanitizeBaseName(String originalName) {
        if (originalName == null) {
            return "upload";
        }

        String baseName = StringUtils.stripFilenameExtension(originalName);
        if (baseName == null || baseName.isBlank()) {
            return "upload";
        }

    String sanitized = baseName
        .replaceAll("[^a-zA-Z0-9-_]", "")
        .toLowerCase();

    return sanitized.isBlank() ? "upload" : sanitized;
    }
}
