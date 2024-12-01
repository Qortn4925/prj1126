CREATE TABLE product
(
    product_id   INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(50)  NOT NULL,
    price        INT          NOT NULL,
    description  VARCHAR(300),
    writer       VARCHAR(50)  NOT NULL REFERENCES member (member_id),
    category     VARCHAR(100) NOT NULL,
    status       ENUM ('For Sale', 'Sold') DEFAULT 'For Sale',
    created_at   DATE                      DEFAULT CURRENT_DATE
);


ALTER TABLE product
    ADD COLUMN pay           VARCHAR(10)  NOT NULL,
    ADD COLUMN latitude      DOUBLE,
    ADD COLUMN longitude     DOUBLE,
    ADD COLUMN location_name VARCHAR(100) NOT NULL;


# 페이지 연습용
INSERT INTO product
(product_name, price, description, writer, category, status, created_at, pay, latitude, longitude, location_name)
SELECT product_name,
       price,
       description,
       writer,
       category,
       status,
       created_at,
       pay,
       latitude,
       longitude,
       location_name
FROM product;

SELECT COUNT(*)
FROM product;