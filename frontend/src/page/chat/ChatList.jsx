import React, { useContext, useEffect, useState } from "react";
import { Box, Button, HStack, VStack } from "@chakra-ui/react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { ChatListItem } from "../../components/chat/ChatListItem.jsx";
import { toaster } from "../../components/ui/toaster.jsx";
import { AuthenticationContext } from "../../components/context/AuthenticationProvider.jsx";
import { ChatView } from "./ChatView.jsx";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel, Scrollbar } from "swiper/modules";
import { EmptyState } from "../../components/ui/empty-state.jsx";

export function ChatList() {
  const queryLocation = useLocation();
  const [chatList, setChatList] = useState([]);
  let navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { id } = useContext(AuthenticationContext);
  const [chatRoomId, setChatRoomId] = useState(
    queryLocation.state?.roomId || -1,
  );
  const [status, setStatus] = useState("For Sale");
  const [productId, setProductId] = useState(
    queryLocation.state?.productId || -1,
  );
  const token = localStorage.getItem("token");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      navigate("/");
    }

    if (id) {
      fetch(id);
    }

    getChatList();
  }, [searchParams, id, status, navigate]);

  function getChatList() {
    axios
      .get("/api/chat/list", {
        params: {
          memberId: id,
          type: searchParams.get("type"),
        },
      })
      .then((res) => {
        setChatList(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  const removeChatRoom = (roomId, id) => {
    axios
      .delete("/api/chat/delete/" + roomId, {
        params: {
          memberId: id,
        },
      })
      .then(
        setChatList((prev) => prev.filter((chat) => chat.roomId !== roomId)),
      )
      .then((res) => {
        const message = res.data.message;
        toaster.create({
          type: message.type,
          description: message.content,
        });
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setChatRoomId(-1);
        setProductId(-1);
      });
  };

  return (
    <Box h="85vh" overflow="hidden">
      <HStack w="100%" h="100vh" spacing={0}>
        <VStack
          w="20%"
          p={5}
          borderRight="1px solid"
          borderColor="gray.300"
          h="100%"
        >
          <HStack w={"100%"} gap={3} mb={3} align="center">
            <Button
              w="30%"
              onClick={() => {
                setChatRoomId(-1);
                setProductId(-1);
                setSearchParams({ type: "all" });
              }}
            >
              전체
            </Button>
            <Button
              w="30%"
              onClick={() => {
                setChatRoomId(-1);
                setProductId(-1);
                setSearchParams({ type: "buy" });
              }}
            >
              구매
            </Button>
            <Button
              w="30%"
              onClick={() => {
                setChatRoomId(-1);
                setProductId(-1);
                setSearchParams({ type: "sell" });
              }}
            >
              판매
            </Button>
          </HStack>

          <Box
            height="80vh"
            overflow="hidden"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {chatList.length > 0 ? (
              <Swiper
                direction={"vertical"}
                slidesPerView="auto"
                spaceBetween={8}
                freeMode={true}
                scrollbar={{ draggable: true }}
                mousewheel={true}
                modules={[FreeMode, Scrollbar, Mousewheel]}
                style={{ height: "100%", width: "100%" }}
              >
                {chatList.map((chat) => (
                  <SwiperSlide
                    key={chat.roomId}
                    style={{
                      height: "auto",
                      width: "100%",
                    }}
                  >
                    <ChatListItem
                      chat={chat}
                      onDelete={() => removeChatRoom(chat.roomId, id)}
                      onClick={() => {
                        setProductId(chat.productId);
                        setChatRoomId(chat.roomId);
                      }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <EmptyState title="채팅방이 없습니다." />
            )}
          </Box>
        </VStack>

        <Box w="100%" h="100%">
          {chatRoomId === -1 ? null : (
            <ChatView
              zIndex={1}
              statusControl={() => {
                setStatus("Sold");
              }}
              key={chatRoomId}
              chatRoomId={chatRoomId}
              onDelete={() => removeChatRoom(chatRoomId, id)}
            />
          )}
          {/*{productId === -1 ? null : (*/}
          {/*  <ProductDetail key={productId} productId={productId} />*/}
          {/*)}*/}
        </Box>
      </HStack>
    </Box>
  );
}
