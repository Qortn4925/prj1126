import React, { useContext, useRef, useState } from "react";
import {
  Box,
  Flex,
  Group,
  Heading,
  Input,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Field } from "../../components/ui/field.jsx";
import { Button } from "../../components/ui/button.jsx";
import { InputGroup } from "../../components/ui/input-group.jsx";
import { PiCurrencyKrwBold } from "react-icons/pi";
import { FcAddImage } from "react-icons/fc";
import { MapModal } from "../../components/map/MapModal.jsx";
import { categories } from "../../components/category/CategoryContainer.jsx";
import { useNavigate } from "react-router-dom";
import { AuthenticationContext } from "../../components/context/AuthenticationProvider.jsx";
import axios from "axios";
import { toaster } from "../../components/ui/toaster.jsx";

export function ProductAdd(props) {
  const [pay, setPay] = useState("sell"); // 상태를 하나로 설정
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState([]);
  const [filesUrl, setFilesUrl] = useState([]);
  const [location, setLocation] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열고 닫을 상태
  const [progress, setProgress] = useState(false);
  const fileInputRef = useRef(null); // Image Box로 파일 선택하기 위해 input 참조
  const [mainImage, setMainImage] = useState(null);
  const [detailAddress, setDetailAddress] = useState("");
  const { id } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  // 가격 입력 필터링
  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) setPrice(value);
  };

  // 버튼 클릭 시 해당 버튼을 표시
  const handlePayClick = (type) => {
    setPay(type);
    if (type === "share") setPrice(0);
  };

  const handleBoxClick = () => fileInputRef.current?.click();

  const handleImageUpload = (e) => {
    const newFiles = Array.from(e.target.files);

    // 중복 파일 체크
    const uniqueFiles = newFiles.filter((newFile) => {
      return !files.some((file) => file.name === newFile.name);
    });

    if (uniqueFiles.length > 0) {
      setFiles((prev) => [...prev, ...uniqueFiles]);
      setFilesUrl((prev) => [
        ...prev,
        ...uniqueFiles.map((file) => URL.createObjectURL(file)),
      ]);
      if (!mainImage && uniqueFiles.length > 0) setMainImage(uniqueFiles[0]);
    } else {
      toaster.create({
        description: "중복된 파일이 있습니다.",
        type: "warning",
      });
    }
  };

  const handleRemoveImage = (index) => {
    setFilesUrl((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setMainImage(updated.length > 0 ? updated[0] : null);
      return updated;
    });
  };

  // 선택된 장소 처리
  const handleLocationSelect = ({ lat, lng, locationName }) => {
    setLocation({ latitude: lat, longitude: lng, name: locationName });
  };

  // 카테고리 선택
  const handleCategoryChange = (e) => setCategory(e.target.value);

  // 상품 등록 요청
  const handleSave = () => {
    setProgress(true);
    var fullLocationName = location.name + detailAddress;

    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("latitude", location?.latitude || "");
    formData.append("longitude", location?.longitude || "");
    formData.append("locationName", fullLocationName || "");
    formData.append("pay", pay);
    formData.append("writer", id);

    if (mainImage) formData.append("mainImageName", mainImage.name);
    files.forEach((file) => formData.append("files[]", file));

    axios
      .postForm("/api/product/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data)
      .then((data) => {
        toaster.create({
          description: data.message.text,
          type: data.message.type,
        });
        navigate(`/product/view/${data.data.productId}`);
      })
      .catch((e) => {
        const message = e.response.data.message;
        toaster.create({ description: message.text, type: message.type });
      })
      .finally(() => setProgress(false));
  };

  const disabled = !(
    productName.trim().length > 0 &&
    description.trim().length > 0 &&
    location?.name
  );

  let fileInputInvalid = false;
  let sumOfFileSize = 0;
  let invalidOneFileSize = false;

  for (const file of files) {
    sumOfFileSize += file.size;
    if (file.size > 1024 * 1024) {
      invalidOneFileSize = true;
    }
  }
  if (sumOfFileSize > 10 * 1024 * 1024 || invalidOneFileSize) {
    fileInputInvalid = true;
  }

  return (
    <Box>
      <Heading mb={3}>상품 등록</Heading>
      <Stack gap={5}>
        <Flex alignItems="center">
          <Box
            p="10"
            borderWidth="1px"
            borderColor="lightgray"
            borderRadius="10px"
            onClick={handleBoxClick}
            cursor="pointer"
            textAlign="center"
          >
            <input
              ref={fileInputRef}
              onChange={handleImageUpload}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
            />
            <FcAddImage size="30px" />
          </Box>

          <Box
            display="flex"
            gap="10px"
            mt={6}
            overflowX="auto"
            whiteSpace="nowrap"
            minWidth="100px"
          >
            {filesUrl.map((file, index) => (
              <Box
                key={index}
                width="100px"
                height="100px"
                border="1px solid lightgray"
                borderRadius="10px"
                overflow="hidden"
                cursor="pointer"
                display="inline-block"
                flexShrink={0} // 이미지가 축소되지 않도록 설정
                onClick={() => handleRemoveImage(index)}
              >
                <img
                  src={file}
                  alt={`파일 미리보기: ${index}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            ))}
          </Box>
        </Flex>

        <Text size="xs" mt={-2}>
          {!fileInputInvalid ? (
            "가장 처음 이미지가 대표이미지입니다."
          ) : (
            <span style={{ color: "red", fontSize: "12px" }}>
              각 파일은 1MB 이하, 총 용량은 10MB 이하이어야 합니다.
            </span>
          )}
        </Text>

        <Flex gap={3}>
          <Box minWidth="100px">
            <Field label={"카테고리"}>
              <select
                value={category}
                onChange={handleCategoryChange}
                style={{
                  width: "100px",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                {categories.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </Box>
          <Box flex={8}>
            <Field label={"상품명"}>
              <Input
                value={productName}
                placeholder="상품명을 입력하세요"
                onChange={(e) => setProductName(e.target.value)}
              />
            </Field>
          </Box>
        </Flex>

        <Field label={"거래방식"}>
          <Flex gap={4}>
            <Button
              borderRadius="10px"
              variant={pay === "sell" ? "solid" : "outline"}
              onClick={() => handlePayClick("sell")}
            >
              판매하기
            </Button>
            <Button
              borderRadius="10px"
              variant={pay === "share" ? "solid" : "outline"}
              onClick={() => handlePayClick("share")}
            >
              나눔하기
            </Button>
          </Flex>
        </Field>
        {pay === "sell" && (
          <InputGroup w={"20%"} flex="1" startElement={<PiCurrencyKrwBold />}>
            <Input
              value={price}
              onChange={handlePriceChange}
              placeholder="가격을 입력하세요"
            />
          </InputGroup>
        )}
        <Field label={"상품 설명"}>
          <Textarea
            placeholder="등록할 상품의 게시글 내용을 작성해주세요."
            h={150}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Group>
          <Field label={"거래 희망 장소"}>
            <Input
              value={location?.name || ""}
              onClick={() => setIsModalOpen(true)}
              placeholder="거래 희망 장소를 추가하세요"
              readOnly
            />
          </Field>
          {location?.name && (
            <Field label={"상세지역"}>
              <Input
                value={detailAddress}
                placeholder="ex) (이대역) 4번출구 스타벅스 "
                onChange={(e) => setDetailAddress(e.target.value)}
              />
            </Field>
          )}
        </Group>

        <MapModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectLocation={handleLocationSelect}
        />
        <Button
          w={"10%"}
          disabled={disabled}
          loading={progress}
          onClick={handleSave}
        >
          상품 등록
        </Button>
      </Stack>
    </Box>
  );
}
