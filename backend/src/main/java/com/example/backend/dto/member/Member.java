package com.example.backend.dto.member;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Member {
    private String memberId;
    private String password;
    private String name;
    private String nickname;
    private LocalDateTime inserted;
}