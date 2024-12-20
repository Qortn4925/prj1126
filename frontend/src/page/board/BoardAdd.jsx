import {
  Box,
  Card,
  FormatNumber,
  HStack,
  Icon,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useContext, useState } from "react";
import { Button } from "../../components/ui/button.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toaster } from "../../components/ui/toaster.jsx";
import { AuthenticationContext } from "../../components/context/AuthenticationProvider.jsx";
import { BoardCategories } from "../../components/category/BoardCategoryContainer.jsx";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { CiFileOn } from "react-icons/ci";
import { Field } from "../../components/ui/field.jsx";

export function BoardAdd() {
  const { isAuthenticated, logout } = useContext(AuthenticationContext);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]); // 미리보기 저장
  const [progress, setProgress] = useState(false);

  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ size: ["small", "medium", "large", "huge"] }],
      ["bold", "italic", "underline"],
      [{ align: [] }],
      ["link"],
      ["blockquote"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "font",
    "size",
    "list",
    "bold",
    "italic",
    "underline",
    "align",
    "link",
    "blockquote",
    "color",
    "background",
  ];

  const editorStyles = {
    width: "100%",
    height: "400px",
    maxHeight: "auto",
    marginBottom: "20px",
    lineHeight: "1.0",
  };

  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <Box
        //border="1px solid red"
        borderRadius="12px"
        p={8}
        textAlign="center"
        maxWidth="450px"
        mx="auto"
        mt={16}
        boxShadow="lg"
      >
        <Box>
          <Text fontSize="3xl" color="red.600" fontWeight="bold" mb={6}>
            권한이 없습니다.
          </Text>
          <Text color="gray.700" fontSize="lg" mb={8}>
            글을 작성하려면 로그인하거나 회원가입이 필요합니다.
          </Text>
          <Stack direction="row" spacing={6} justify="center" mb={4}>
            <Button
              colorScheme="blue"
              variant="outline"
              size="lg"
              onClick={() => navigate("/member/signup")}
            >
              회원가입
            </Button>
            <Button colorScheme="teal" size="lg" onClick={() => navigate("/")}>
              로그인
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  }

  const handleListClick = () => {
    navigate("/board/list");
  };

  const handleSaveClick = () => {
    setProgress(true);
    axios
      .postForm("/api/board/boardAdd", {
        title,
        content,
        category,
        files,
      })
      .then((res) => res.data)
      .then((data) => {
        const message = data.message;
        toaster.create({
          description: message.text,
          type: message.type,
        });
        navigate(`/board/boardView/${data.data.boardId}`);
      })
      .catch((e) => {
        if (e.response && e.response.status === 403) {
          const message = e.response.data.message;
          toaster.create({
            description: message.text,
            type: message.type,
          });
        } else {
          toaster.create({
            description: "오류가 발생했습니다. 다시 시도해 주세요.",
            type: "error",
          });
        }
      })
      .finally(() => {
        setProgress(false);
      });
  };

  const disabled = !(title.trim().length > 0 && content.trim().length > 0);

  const handleFileDelete = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    setFilePreviews((prevPreviews) =>
      prevPreviews.filter((preview) => preview.name !== fileName),
    );
  };

  const handlePreviewDelete = (fileName) => {
    setFilePreviews((prevPreviews) =>
      prevPreviews.filter((preview) => preview.name !== fileName),
    );
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const uniqueFiles = newFiles.filter(
      (newFile) =>
        !files.some((existingFile) => existingFile.name === newFile.name),
    );
    setFiles((prevFiles) => [...prevFiles, ...uniqueFiles]);

    const newPreviews = uniqueFiles.map((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prevPreviews) => [
          ...prevPreviews,
          { name: file.name, preview: reader.result },
        ]);
      };
      reader.readAsDataURL(file);
      return { name: file.name, preview: reader.result };
    });
  };

  const filesList = [];
  let sumOfFileSize = 0;
  let invalidOneFileSize = false;

  for (const file of files) {
    sumOfFileSize += file.size;
    if (file.size > 1024 * 1024) {
      invalidOneFileSize = true;
    }
    filesList.push(
      <Card.Root size={"sm"} key={file.name}>
        <Card.Body>
          <HStack>
            <Text
              color={file.size > 1024 * 1024 ? "red" : "black"}
              fontWeight={"bold"}
              me={"auto"}
              truncate
              onClick={() => handleFileDelete(file.name)}
              style={{ cursor: "pointer" }}
            >
              <Icon>
                <CiFileOn />
              </Icon>
              {file.name}
            </Text>
            <Text>
              <FormatNumber
                value={file.size}
                notation={"compact"}
                compactDisplay="short"
              />
            </Text>
          </HStack>
        </Card.Body>
      </Card.Root>,
    );
  }

  const filePreviewsList = filePreviews.map((filePreview) => (
    <Box
      key={filePreview.name}
      mb={2}
      onClick={() => handlePreviewDelete(filePreview.name)}
    >
      <img
        src={filePreview.preview}
        alt={filePreview.name}
        style={{
          width: "100px",
          height: "100px",
          objectFit: "cover",
          cursor: "pointer",
        }}
      />
      <Text>{filePreview.name}</Text>
    </Box>
  ));

  let fileInputInvalid = false;
  if (sumOfFileSize > 10 * 1024 * 1024 || invalidOneFileSize) {
    fileInputInvalid = true;
  }

  return (
    <Box border="1px solid #ccc" borderRadius="8px" p={2}>
      <h3>게시글 쓰기</h3>
      <hr />
      <Stack gap={4}>
        <Box
          border="1px solid #ccc"
          borderRadius="4px"
          display="flex"
          alignItems="center"
          p={1}
        >
          <Box borderRight="1px solid #ccc" padding="2px">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: "14px",
                height: "30px",
                padding: "0 8px",
              }}
            >
              {BoardCategories.filter((cat) => cat.value).map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </Box>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="카테고리 고르고 후 제목을 입력하세요"
            padding="0 8px"
            fontSize="14px"
            height="30px"
            style={{ border: "none", outline: "none", width: "100%" }}
          />
        </Box>

        <ReactQuill
          style={editorStyles}
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
        />

        <Box>
          <Field>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              mt={2}
              css={{ border: "none" }}
            />
            <Stack mt={2}>{filePreviewsList}</Stack>
          </Field>
        </Box>

        <HStack justify="space-between">
          <Button
            colorScheme="blue"
            variant="outline"
            onClick={handleListClick}
            size="sm"
          >
            목록으로
          </Button>
          <Button
            colorScheme="teal"
            onClick={handleSaveClick}
            size="sm"
            disabled={disabled || progress}
          >
            저장하기
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
}
