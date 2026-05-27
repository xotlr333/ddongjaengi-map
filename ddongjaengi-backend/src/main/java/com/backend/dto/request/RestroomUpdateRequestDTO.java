package com.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RestroomUpdateRequestDTO {
    private String floor;
    private String password;
    private String memo;
    private Long categoryId;
}
