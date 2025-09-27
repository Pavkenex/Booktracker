package com.booktracker.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.storage.avatar-dir:uploads/avatars}")
    private String avatarDirectory;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path avatarPath = Paths.get(avatarDirectory).toAbsolutePath().normalize();
        Path uploadsRoot = avatarPath.getParent() != null ? avatarPath.getParent() : avatarPath;

        String resourceLocation = uploadsRoot.toUri().toString();

        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations(resourceLocation);
    }
}
