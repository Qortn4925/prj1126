import { Box, Card, Image } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button.jsx";
import { GoHeart } from "react-icons/go";
import axios from "axios";

export function ProductItem({ product }) {
  const navigate = useNavigate();
  console.log(product);

  // 채팅방 만들고 , 글로 이동
  //  이미 만든적 있는 채팅방이면 글로 이동 ?
  const createChatRoom = () => {
    var testId;
    var productName = product.productName;
    var writer = product.writer;
    var nickname = "";
    axios
      .post("/api/chat/create", {
        productName: productName,
        writer: writer,
        nickname: nickname,
      })
      .then((res) => {
        console.log(res.data);
        testId = res.data;
        navigate("/chat/room/" + testId);
      });
    // 추가
  };

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
        <Button size="sm" onClick={createChatRoom}>
          채팅방 만들기
        </Button>
        <Box>
          <GoHeart />
        </Box>
      </Card.Footer>
    </Card.Root>
  );
}
