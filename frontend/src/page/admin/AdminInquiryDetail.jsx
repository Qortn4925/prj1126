import { useParams } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Spinner,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Field } from "../../components/ui/field.jsx";
import { AuthenticationContext } from "../../components/context/AuthenticationProvider.jsx";
import {
  DialogActionTrigger,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog.jsx";
import { toaster } from "../../components/ui/toaster.jsx";

// 특정 문의 상세 정보를 표시하고, 해당 문의의 댓글을 조회, 작성, 수정, 삭제 기능을 제공
export function AdminInquiryDetail({
  handleDeleteClick: handleDeleteClickProp,
}) {
  const { inquiryId } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [savedData, setSavedData] = useState(null);
  const { id } = useContext(AuthenticationContext);

  function DeleteButton({ onClick, id: memberId }) {
    const [open, setOpen] = useState(false);

    return (
      <>
        <DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
          <DialogTrigger asChild>
            <Button colorPalette={"red"}>삭제</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>삭제 확인</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <p>댓글을 삭제하시겠습니까?</p>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger>
                <Button variant={"outline"}>취소</Button>
              </DialogActionTrigger>
              <Button colorPalette={"red"} onClick={onClick}>
                삭제
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>
      </>
    );
  }

  // inquiry가 업데이트될 때 savedData의 category를 설정
  useEffect(() => {
    if (inquiry) {
      setSavedData({
        ...savedData,
        category: inquiry.category,
      });
    }
  }, [inquiry]);

  // 게시글 정보 가져오기
  useEffect(() => {
    axios
      .get(`/api/inquiry/view/${inquiryId}`)
      .then((res) => {
        console.log("문의 데이터:", res.data);
        setInquiry(res.data);
      })
      .catch((error) => {
        console.error("문의 상세 데이터 요청 중 오류 발생:", error);
      });
  }, [inquiryId]);

  // 댓글 목록 가져오기
  useEffect(() => {
    if (inquiryId) {
      axios
        .get(`/api/inquiry/comments/${inquiryId}`)
        .then((res) => {
          console.log("댓글 데이터:", res.data);
          setComments(res.data);
        })
        .catch((error) => {
          console.error("댓글 데이터 요청 중 오류 발생:", error);
        });
    }
  }, [inquiryId]);

  // 댓글 작성 처리 함수
  const handleCommentSubmit = () => {
    if (!comment.trim()) {
      toaster.create({
        type: "error",
        description: "댓글을 입력해 주세요.",
      });
      return;
    }

    if (editingCommentId) {
      // 수정 모드에서 댓글 업데이트
      axios
        .put(`/api/inquiry/comment/${editingCommentId}`, {
          id: editingCommentId,
          inquiryId: parseInt(inquiryId, 10),
          memberId: id,
          comment: comment,
        })
        .then((res) => {
          toaster.create({
            type: "success",
            description: "댓글이 수정되었습니다.",
          });
          setComment("");
          setEditingCommentId(null);
          setComments((prevComments) =>
            prevComments.map((c) =>
              c.id === editingCommentId ? { ...c, comment } : c,
            ),
          );
        })
        .catch((error) => {
          console.error("댓글 수정 중 오류 발생:", error);
        });
    } else {
      // 댓글 등록
      const newComment = {
        inquiryId: parseInt(inquiryId, 10),
        memberId: id,
        comment: comment,
        inserted: new Date().toISOString(),
      };
      axios
        .post(`/api/inquiry/comment/${id}`, newComment)
        .then((res) => {
          toaster.create({
            type: "success",
            description: "댓글이 등록되었습니다.",
          });
          setComment("");
          setComments(res.data.list);
        })
        .catch((error) => {
          console.error("댓글 등록 중 오류 발생:", error);
        });
    }
  };

  // 댓글 수정 처리 함수
  const handleEditClick = (commentId) => {
    const commentToEdit = comments.find((c) => c.id === commentId);
    if (commentToEdit) {
      setComment(commentToEdit.comment);
      setEditingCommentId(commentId);
    }
  };

  // 댓글 삭제 처리 함수
  const handleDeleteClick = (commentId) => {
    axios
      .delete(`/api/inquiry/comment/${commentId}`)
      .then((res) => {
        setComments((prevComments) =>
          prevComments.filter((c) => c.id !== commentId),
        );
        toaster.create({
          type: "success",
          description: "댓글이 삭제되었습니다.",
        });
      })
      .catch((error) => {
        console.error("댓글 삭제 중 오류 발생:", error);
      });
  };

  if (!inquiry) {
    return <Spinner />;
  }

  return (
    <Box mt="60px">
      <Text fontSize="2xl" fontWeight="bold" mb={5} m={2}>
        1:1 문의
      </Text>
      <Box
        maxW="80%"
        mx="auto"
        mt="4"
        p="3"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="lg"
        bg="white"
      >
        <Heading mb={4}>{inquiry.inquiryId}번 문의</Heading>
        <Stack spacing={5}>
          <Field label="문의 유형">
            <Input value={inquiry ? inquiry.category : ""} readOnly />
          </Field>
          <Field label={"제목"} readOnly>
            <Input value={inquiry.title} readOnly />
          </Field>
          <Field label={"작성자"} readOnly>
            <Input value={inquiry.memberId} readOnly />
          </Field>
          <Field label={"작성일자"} readOnly>
            <Input
              value={new Date(inquiry.inserted).toLocaleDateString()}
              readOnly
            />
          </Field>
          <Field label={"내용"} readOnly>
            <Textarea h="25vh" value={inquiry.content} readOnly />
          </Field>
          <Box mt={4}>
            <Heading size="md" mb={2}>
              COMMENTS
            </Heading>
            <Flex>
              <Textarea
                placeholder="댓글을 입력해 주세요."
                value={editingCommentId ? "" : comment} // 수정 중일 땐 입력 영역 초기화
                onChange={(e) => setComment(e.target.value)}
                flex="1"
                isDisabled={!!editingCommentId} // 수정 중일 때 댓글 작성 비활성화
              />
              <Button
                colorScheme="teal"
                mt={2}
                ml={2}
                onClick={handleCommentSubmit}
                isDisabled={!!editingCommentId} // 수정 중일 때 버튼 비활성화
              >
                등록
              </Button>
            </Flex>
            {comments.map((c) => (
              <Box
                key={c.id}
                borderWidth="1px"
                borderRadius="md"
                p={3}
                mt={4}
                mb={1}
              >
                <Text fontWeight="bold">{c.memberId}</Text>
                {editingCommentId === c.id ? (
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                ) : (
                  <Text>{c.comment}</Text>
                )}
                <Text fontSize="sm" color="gray.500">
                  {new Date(c.inserted).toLocaleDateString()}
                </Text>
                <Flex justify="flex-end" mt={2}>
                  {editingCommentId === c.id ? (
                    <Button
                      colorScheme="teal"
                      onClick={() => handleCommentSubmit()}
                      mr={2}
                    >
                      수정 완료
                    </Button>
                  ) : (
                    <Button
                      colorPalette={"white"}
                      onClick={() => handleEditClick(c.id)}
                      mr={2}
                    >
                      수정
                    </Button>
                  )}
                  <DeleteButton
                    colorPalette={"red"}
                    onClick={() => handleDeleteClick(c.id)}
                  />
                </Flex>
              </Box>
            ))}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
