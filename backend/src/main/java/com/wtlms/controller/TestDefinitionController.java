package com.wtlms.controller;

import com.wtlms.dto.ApiResponse;
import com.wtlms.model.TestDefinition;
import com.wtlms.service.TestDefinitionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
public class TestDefinitionController {

    private final TestDefinitionService testDefinitionService;

    public TestDefinitionController(TestDefinitionService testDefinitionService) {
        this.testDefinitionService = testDefinitionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TestDefinition>>> getAllDefinitions() {
        List<TestDefinition> list = testDefinitionService.getAllDefinitions();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TestDefinition>> getDefinitionById(@PathVariable String id) {
        TestDefinition def = testDefinitionService.getDefinitionById(id);
        return ResponseEntity.ok(ApiResponse.ok(def));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TestDefinition>> createDefinition(@RequestBody TestDefinition def) {
        TestDefinition created = testDefinitionService.createDefinition(def);
        return ResponseEntity.ok(ApiResponse.ok("Test definition created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TestDefinition>> updateDefinition(
            @PathVariable String id,
            @RequestBody TestDefinition def) {
        TestDefinition updated = testDefinitionService.updateDefinition(id, def);
        return ResponseEntity.ok(ApiResponse.ok("Test definition updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDefinition(@PathVariable String id) {
        testDefinitionService.deleteDefinition(id);
        return ResponseEntity.ok(ApiResponse.ok("Test definition deleted successfully", null));
    }
}
