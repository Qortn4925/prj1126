package com.example.backend.controller.mypage;

import com.example.backend.dto.inquiry.Inquiry;
import com.example.backend.dto.product.Product;
import com.example.backend.dto.review.Review;
import com.example.backend.service.mypage.MyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/myPage")
public class MyPageController {

    final MyPageService service;

    @GetMapping("/review")
    public List<Review> getReviews(
            @RequestParam String id,
            @RequestParam String role
    ) {
        return service.getReviewsByStatus(id, role);
    }

    @PostMapping("review/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> addReview(
            @RequestBody Review review) {
        System.out.println(review);
        if (service.validate(review)) {
            if (service.addReview(review)) {
                return ResponseEntity.ok()
                        .body(Map.of("message", Map.of("type", "success",
                                        "text", STR."\{review.getProductName()} 상품에 대한 후기가 작성되었습니다."),
                                "data", review));
            } else {
                return ResponseEntity.internalServerError()
                        .body(Map.of("message", Map.of("type", "error",
                                "text", "상품에 대한 후기 작성이 실패하였습니다.")));
            }
        } else {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", Map.of("type", "error",
                            "text", "별점, 후기 내용이 입력되지 않았습니다.")));
        }
    }


    // 내 구매 상품 목록 가져오기
    @GetMapping("purchased")
    @PreAuthorize("isAuthenticated()")
    public List<Product> getPurchasedProducts(@RequestParam String id) {
        return service.getPurchasedProducts(id);
    }

    // 내 판매 상품 목록 가져오기
    @GetMapping("sold")
    @PreAuthorize("isAuthenticated()")
    public List<Product> getSoldProducts(@RequestParam String id) {
        return service.getSoldProducts(id);
    }

    // 내 관심 상품 목록 가져오기
    @GetMapping("like")
    @PreAuthorize("isAuthenticated()")
    public List<Product> getLikes(@RequestParam String id) {
        return service.getLikes(id);
    }

    // 내 문의 내역 목록 가져오기
    @GetMapping("/list")
    @PreAuthorize("isAuthenticated()")
    public List<Inquiry> List(Authentication auth) {
        String memberId = auth.getName(); // 로그인한 사용자의 ID 가져오기
        return service.getInquiryByMemberId(memberId);
    }

    // 내 문의 내역에서 상세 문의 보기
    @GetMapping("view")
    @PreAuthorize("isAuthenticated()")
    public Inquiry view(@RequestParam int inquiryId, Authentication auth) {
        String memberId = auth.getName();
        return service.getview(memberId, inquiryId);
    }
}
