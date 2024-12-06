package com.example.backend.service.product;

import com.example.backend.dto.product.Product;
import com.example.backend.mapper.product.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductService {

    final ProductMapper mapper;

    // 상품 추가하기
    public boolean add(Product product, MultipartFile[] files, MultipartFile mainImage, Authentication authentication) {
        product.setWriter(authentication.getName());


        int cnt = mapper.insert(product);

        if (files != null && files.length > 0) {
            // 폴더 만들기
            String directory = STR."C:/Temp/prj1126/\{product.getProductId()}";
            File dir = new File(directory);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            // 파일 업로드
            for (MultipartFile file : files) {
                boolean isMain = false;
                if (mainImage != null && file.getOriginalFilename().equals(mainImage.getOriginalFilename())) {
                    isMain = true; // 해당 파일을 메인 이미지로 설정
                }

                String filePath = STR."C:/Temp/prj1126/\{product.getProductId()}/\{file.getOriginalFilename()}";
                try {
                    file.transferTo(new File(filePath));
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
                // product_file 테이블에 파일명 입력
                mapper.insertFile(product.getProductId(), file.getOriginalFilename(), isMain);
            }
        }

        return cnt == 1;
    }

    // 페이지, 카테고리, 검색, 지불방법 별 상품 목록 가져오기
    public Map<String, Object> getProductList(Integer page, String category, String keyword, String pay) {
        // SQL 의 LIMIT 키워드에서 사용되는 offset
        Integer offset = (page - 1) * 16;
        // 조회되는 게시물들
        List<Product> list = mapper.selectPage(offset, category, keyword, pay);
        // 전체 게시물 수
        Integer count = mapper.countAll(category, keyword, pay);
        return Map.of("list", list,
                "count", count);
    }

    // 상품명과 지역명이 있는지 확인
    public boolean validate(Product product) {
        boolean productName = product.getProductName().trim().length() > 0;
        boolean locationName = product.getLocationName().trim().length() > 0;

        return productName && locationName;
    }

    // 상품 1개의 정보 가져오기
    public Product getProductView(int id) {
        return mapper.selectById(id);
    }

    // 상품 삭제하기
    public boolean deleteProduct(int id) {
        mapper.deleteLike(id);
        mapper.deletePurchasedRecord(id);
        mapper.deleteFileByProductId(id);

        int cnt = mapper.deleteById(id);

        return cnt == 1;
    }

    // 상품 정보 수정하기
    public boolean update(Product product) {
        int cnt = mapper.update(product);
        return cnt == 1;
    }

    // 상품 판매자와 로그인한 사용자가 같은지 확인
    public boolean hasAccess(int id, Authentication authentication) {
        Product product = mapper.selectById(id);

        return product.getWriter().equals(authentication.getName());
    }

    // 상품 좋아요 등록 & 삭제
    public Map<String, Object> like(Product product, Authentication authentication) {
        int cnt = mapper.deleteLikeByMemberId(product.getProductId(), authentication.getName());

        if (cnt == 0) {
            mapper.insertLike(product.getProductId(),
                    authentication.getName());
        }

        int countLike = mapper.countLike(product.getProductId());
        Map<String, Object> result = Map.of("like", (cnt == 0), "count", countLike);
        return result;
    }

    // 상품별 좋아요 수 가져오기
    public List<Map<String, Object>> productLike() {
        List<Map<String, Object>> likeData = mapper.countLikeByProductId();

        return likeData;
    }

    // 본인 상품 좋아요 확인
    public List<Integer> likedProductByMember(Authentication authentication) {
        List<Integer> list = mapper.likedProductByMemberId(authentication.getName());
        return list;
    }

    // 메인 페이지에서 각각 상품 5개씩 가져오기
    public Map<String, List<Product>> getProductMainList() {
        Integer limit = 5;

        List<Product> sellProducts = mapper.selectSellProducts(limit);

        List<Product> shareProducts = mapper.selectShareProducts(limit);

        Map<String, List<Product>> result = new HashMap<>();
        result.put("sellProducts", sellProducts);
        result.put("shareProducts", shareProducts);

        return result;
    }
}

