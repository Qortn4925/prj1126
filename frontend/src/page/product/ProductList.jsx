import {
  Box,
  Card,
  Center,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Spinner,
} from "@chakra-ui/react";

import { CategoryContainer } from "../../components/category/CategoryContainer.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { GoHeart } from "react-icons/go";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "../../components/ui/pagination.jsx";

function ProductItem({ product }) {
  const navigate = useNavigate();
  return (
    <Card.Root maxW="sm" overflow="hidden">
      <Image src="/image/productItem.png" alt={product.productName} />
      <Card.Body gap="2">
        <Card.Title>{product.productName}</Card.Title>
        <Card.Description>{product.price}</Card.Description>
      </Card.Body>
      <Card.Footer gap="2">
        <Button
          onClick={() => navigate(`/product/view/${product.productId}`)}
          variant="solid"
        >
          거래하기
        </Button>
        <Box>
          <GoHeart />
        </Box>
      </Card.Footer>
    </Card.Root>
  );
}

export function ProductList() {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [sortOption, setSortOption] = useState("newest");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 페이지 번호
  const pageParam = searchParams.get("page") ? searchParams.get("page") : "1";
  const page = Number(pageParam);

  // 컴포넌트 마운트 시 상품 목록 가져오기
  useEffect(() => {
    const controller = new AbortController();
    axios
      .get("/api/product/list", {
        params: searchParams,
        signal: controller.signal,
      })
      .then((res) => res.data)
      .then((data) => {
        setProductList(data.list);
        setCount(data.count);
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [searchParams]);

  // 페이지 이동
  const handlePageChange = (e) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("page", e.page);
    setSearchParams(nextSearchParams);
  };

  // 정렬 옵션 변경
  const handleSortChange = (e) => {
    const sortValue = e.target.value;
    setSortOption(sortValue); // 상태 업데이트
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("sort", sortValue); // 쿼리 파라미터에 정렬 기준 추가
    setSearchParams(nextSearchParams); // URL 업데이트
  };

  // 클라이언트 정렬
  const sortedList = [...productList].sort((a, b) => {
    if (sortOption === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt); // 최신순
    } else if (sortOption === "popular") {
      return b.popularity - a.popularity; // 인기순
    } else if (sortOption === "low-to-high") {
      return a.price - b.price; // 저가순
    } else if (sortOption === "high-to-low") {
      return b.price - a.price; // 고가순
    }
    return 0;
  });

  if (loading) {
    return <Spinner />;
  }

  return (
    <Box>
      <CategoryContainer />
      <Heading textAlign="center">카테고리</Heading>

      <Flex justify="space-between" align="center" mb={4}>
        <Flex gap={4}>
          <select value={sortOption} onChange={handleSortChange} size="sm">
            <option value="newest">최신순</option>
            <option value="popular">인기순</option>
            <option value="low-to-high">저가순</option>
            <option value="high-to-low">고가순</option>
          </select>
        </Flex>
        <Button
          onClick={() => navigate(`/product/add`)}
          colorScheme="teal"
          size="sm"
        >
          판매하기
        </Button>
      </Flex>
      <Grid templateColumns="repeat(4, 1fr)" gap="6">
        {sortedList?.map((product) => (
          // key prop을 추가하여 각 항목을 고유하게 지정 (각 항목을 추적하기 위해 key 사용)
          <ProductItem key={product.productId} product={product} />
        ))}
      </Grid>
      <Center>
        <PaginationRoot
          onPageChange={handlePageChange}
          count={count}
          pageSize={16}
          page={page}
          variant="solid"
        >
          <HStack>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </HStack>
        </PaginationRoot>
      </Center>
    </Box>
  );
}
