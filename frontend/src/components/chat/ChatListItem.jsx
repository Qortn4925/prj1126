import { useNavigate } from "react-router-dom";
import { Badge, Box, Card, HStack, Image } from "@chakra-ui/react";
import { Button } from "../../components/ui/button.jsx";

export function ChatListItem({ chat, onDelete, onClick }) {
  const navigate = useNavigate();

  return (
    <Box variant={"outline"} p={3} onClick={onClick}>
      <Card.Root
        flex
        Direction="row"
        maxW="xl"
        _hover={{
          borderColor: "gray",
        }}
      >
        <HStack>
          <Image
            objectFit={"cover"}
            maxW={"200px"}
            src="data:image/jpeg;base64,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"
            alt={"너구리"}
          />
          <Box>
            <Card.Body>
              <Card.Title> 상품명: {chat.productName} </Card.Title>
              {/*<Card.Description>*/}
              {/*  제품 설명 ~~~~~~ Lorem ipsum dolor sit amet.*/}
              {/*</Card.Description>*/}
              <HStack mt="4">
                <Badge> 제품등록자명 : {chat.writer}</Badge>
              </HStack>
            </Card.Body>
            <Card.Footer>
              <Button
                variant={"outline"}
                onClick={() => {
                  navigate(`/chat/room/${chat.roomId}`);
                }}
              >
                대화하러 가기
              </Button>
              {/*<Button*/}
              {/*  variant={"outline"}*/}
              {/*  colorPalette={"red"}*/}
              {/*  onClick={onDelete}*/}
              {/*>*/}
              {/*  삭제 버튼*/}
              {/*</Button>*/}
            </Card.Footer>
          </Box>
        </HStack>
      </Card.Root>
    </Box>
  );
}
