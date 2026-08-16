// controller/SearchController.java
package com.project.management.controller;

import com.project.management.dto.request.SearchRequest;
import com.project.management.dto.response.SearchResponse;
import com.project.management.model.User;
import com.project.management.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @PostMapping
    public ResponseEntity<SearchResponse> search(
            @RequestBody SearchRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(searchService.search(request));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions(
            @RequestParam String query) {
        // Simple suggestion endpoint
        return ResponseEntity.ok(searchService.generateSuggestions(query));
    }
}