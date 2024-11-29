export interface ImageData {
  Image: string;
  Description: string;
}

export interface FrameData {
  key: number;
  Image: string;
  Description: string;
  timestamp: string;
  ReportId?: string; // ReportId 속성 추가
}

export interface Frame {
  frameKey: number; // 프레임 키
  data: {
    Image: string; // 이미지 경로
    Description: string; // 설명 텍스트
  };
}
