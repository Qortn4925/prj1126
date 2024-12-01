package com.example.backend.controller.inquiry;

import com.example.backend.dto.inquiry.Inquiry;
import com.example.backend.service.inquiry.InquiryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/inquiry")
public class InquiryController {

    final InquiryService service;

    @GetMapping("/list")
    public List<Inquiry> list() {
        return service.list();
    }

//    // 특정 글을 가져오는 메서드 추가
//    @GetMapping("/{inquiryId}")
//    public Inquiry getInquiryById(@PathVariable Long inquiryId) {
//        return service.getInquiryById(inquiryId);
//    }
}
