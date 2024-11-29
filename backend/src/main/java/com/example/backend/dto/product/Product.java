package com.example.backend.dto.product;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class Product {
    private Integer productId;
    private String productName;
    private String description;
    private Integer price;
    private String category;
    private String writer;
    private String pay;
    private String status;
    private Double latitude;
    private Double longitude;
    private String locationName;
    private LocalDateTime createdAt;

    private List<ProductFile> fileList;
    private String mainImage;
}
