package com.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.backend.entity.Category;
import com.backend.repository.TestRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class TestService {

    private final TestRepository testRepository;

    public List<Category> getAll() {

        return testRepository.findAll();
    }


}
