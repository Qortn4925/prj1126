import { Box, Flex, Heading, Textarea } from "@chakra-ui/react";
import { Button } from "../ui/button.jsx";
import { useContext, useState } from "react";
import {
  DialogActionTrigger,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog.jsx";
import { AuthenticationContext } from "../context/AuthenticationProvider.jsx";
import { CiEdit, CiTrash } from "react-icons/ci";

function DeleteButton({ onClick }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
        <DialogTrigger asChild>
          <Button colorPalette={"red"} size={"sm"} variant={"subtle"}>
            <CiTrash />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>삭제 확인</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p>댓글을 삭제하시겠습니까? </p>
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

function EditButton({ isEditing, onSaveClick, onCancelClick, onEditClick }) {
  return (
    <>
      {!isEditing ? (
        <Button
          colorPalette={"purple"}
          size={"sm"}
          variant={"subtle"}
          onClick={onEditClick}
        >
          <CiEdit />
        </Button>
      ) : (
        <>
          <Button
            colorPalette={"purple"}
            size={"sm"}
            variant={"subtle"}
            onClick={onSaveClick}
          >
            저장
          </Button>
          <Button variant={"outline"} size={"sm"} onClick={onCancelClick}>
            취소
          </Button>
        </>
      )}
    </>
  );
}

export function CommentItem({ comment, onDeleteClick, onEditClick }) {
  const { hasAccess } = useContext(AuthenticationContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment.comment);

  const handleSaveClick = () => {
    onEditClick(comment.commentId, editedComment); // 수정된 댓글을 부모로 전달
    setIsEditing(false); // 저장 후 수정 모드 종료
  };

  const handleCancelClick = () => {
    setEditedComment(comment.comment); // 원래 댓글로 되돌리기
    setIsEditing(false); // 수정 모드 종료
  };

  const handleEditClick = () => {
    setIsEditing(true); // 수정 모드로 전환
  };

  function formatDate(dateString) {
    return dateString.split("T")[0]; // "T"를 기준으로 날짜만 추출
  }

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={2}
      mt={2}
      Width="100%"
      mx="auto"
      bg="white"
      shadow="sm"
    >
      <Flex
        justify="space-between"
        mb={3}
        pb={0}
        borderBottom="1px solid"
        borderColor="gray.200"
        width="calc(100% + 18px)" // 부모 패딩 보정
        height={"30px"}
        bg="skyblue"
        ml="-9px" // 부모 좌측 패딩 보정
        mt={"-8px"}
        borderTopRadius="lg"
        alignItems="center" // 수직 중앙 정렬
      >
        <Heading size="sm" ml="10px">
          {comment.nickname}
        </Heading>
        <Heading size="sm" mr="10px" color="gray.500">
          {formatDate(comment.inserted)}
        </Heading>
      </Flex>

      {isEditing ? (
        <Textarea
          value={editedComment}
          onChange={(e) => setEditedComment(e.target.value)}
          mb={2}
        />
      ) : (
        <Box whiteSpace="pre-line" mb={2}>
          {comment.comment}
        </Box>
      )}

      {hasAccess(comment.memberId) && (
        <Flex justify="flex-end" gap={2}>
          <EditButton
            isEditing={isEditing}
            onSaveClick={handleSaveClick}
            onCancelClick={handleCancelClick}
            onEditClick={handleEditClick}
          />
          {!isEditing && (
            <DeleteButton onClick={() => onDeleteClick(comment.commentId)} />
          )}
        </Flex>
      )}
    </Box>
  );
}
