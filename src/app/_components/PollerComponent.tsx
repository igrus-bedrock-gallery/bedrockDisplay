"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";

// 데이터 polling 하는 api를 호출하는 컴포넌트
export default function PollerComponent({
  setPendingImages,
}: {
  setPendingImages: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [localPendingImages, setLocalPendingImages] = useState(0); // 로컬 상태
  const previousPendingImagesRef = useRef<number>(0); // 이전 상태 추적

  let pendingImages = 0;
  // const isPollingRef = useRef(false); // polling 상태 관리

  // pendingImages 변수값 수정하기
  const updatePendingImages = async (
    action: "increment" | "decrement",
    count: number
  ) => {
    try {
      const response = await axios.post("/api/update-pending-images", {
        action,
        count,
      });
      if (response.status === 200) {
        console.log(`Server-side pendingImages updated: ${action} by ${count}`);
      }
    } catch (error) {
      console.error("Error updating server-side pendingImages:", error);
    }
  };

  // pendingImages 변수값 가져오기
  const fetchPendingImages = async () => {
    console.log("fetchPendingImages 실행");
    try {
      const response = await axios.get("/api/pending-status"); //전역변수 pendingImages의 실시간 값 가져옴
      if (response.status === 200 && response.data?.pendingImages >= 0) {
        setPendingImages(response.data.pendingImages); // middle 페이지에서만 사용하는 pendingImages값 업데이트(실시간으로 1초마다 업데이트 되는거임)
        // enqueuePendingImages(response.data.pendingImages); // 스트림 순서 관리 큐에 pendingImages 추가

        pendingImages = response.data.pendingImages;
      }
      // setLocalPendingImages(response.data.pendingImages); // 로컬 상태 업데이트
    } catch (error) {
      console.error("Error fetching pendingImages status:", error);
    }
  };

  // aws에서 데이터 받아오기
  const fetchImages = async () => {
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

        // 상태 업데이트 (서버 및 로컬) -> 필요없음. get-images내부에서 처리 중
        // updatePendingImages("decrement", imageCount);
      } else if (response.status === 204) {
        console.log("No more images to process.");
        // isPollingRef.current = false; // 롱폴링 중단
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      // isPollingRef.current = false; // 오류 시 중단
    }
  };

  // 서버 상태를 주기적으로 가져옴
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPendingImages();
    }, 1000); // 1초마다 상태 확인

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 제거
  }, []);

  // `pendingImages` 변화에 따른 롱폴링
  useEffect(() => {
    if (pendingImages > 0) {
      fetchImages();
    }
  }, [pendingImages]);

  return null;
}
