"use client";

import { useState, useEffect } from "react";
import axios from "axios";

// 데이터 polling 하는 api를 호출하는 컴포넌트
export default function PollerComponent({
  setPendingImages,
}: {
  setPendingImages: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [pendingImages, setLocalPendingImages] = useState(0); // 로컬 상태

  // 서버로부터 pendingImages 변수값 가져오기
  const fetchPendingImages = async () => {
    console.log("fetchPendingImages 실행");
    try {
      const response = await axios.get("/api/pending-status"); // 전역변수 pendingImages의 실시간 값 가져옴
      if (response.status === 200 && response.data?.pendingImages >= 0) {
        setPendingImages(response.data.pendingImages); // 외부에서 사용하는 상태 업데이트
        setLocalPendingImages(response.data.pendingImages); // 로컬 상태 업데이트
      }
    } catch (error) {
      console.error("Error fetching pendingImages status:", error);
    }
  };

  // AWS에서 데이터 받아오기
  const fetchImages = async () => {
    console.log("fetchImages 실행. pendingImages:", pendingImages);
    try {
      const response = await axios.get("/api/get-images", {
        params: { pendingImages }, // pendingImages를 쿼리 파라미터로 전달
      });

      if (
        response.status === 200 &&
        response.data &&
        Array.isArray(response.data.images)
      ) {
        const imageCount = response.data.images.length;
        console.log("AWS 요청 성공, 받은 이미지 개수:", imageCount);
      } else if (response.status === 204) {
        console.log("No more images to process.");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  // 서버 상태를 주기적으로 가져옴
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPendingImages();
    }, 1000); // 1초마다 상태 확인

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 제거
  }, []);

  // `pendingImages` 변화에 따라 `/api/get-images` 호출
  useEffect(() => {
    if (pendingImages > 0) {
      fetchImages();
    }
  }, [pendingImages]);

  return null;
}
