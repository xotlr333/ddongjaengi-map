package com.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.entity.Category;
import com.backend.service.TestService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RequestMapping("/test")
@RestController
public class TestController {

    private final TestService testService;

    @GetMapping("/all")
    public ResponseEntity<List<Category>> getAll() {
        
        return ResponseEntity.ok(testService.getAll());
    }


}
