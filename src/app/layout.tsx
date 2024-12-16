import "../styles/globals.css";
import { ReactNode } from "react";
import { FrameProvider } from "../contexts/FrameContext";

export const metadata = {
  title: "Amazon Bedrock Gallery - Generative AI 경험하기",
  description:
    "Amazon Bedrock과 AWS 서비스를 활용하여 Generative AI를 체험할 수 있는 프로젝트 전시 페이지입니다.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <FrameProvider>{children}</FrameProvider>
      </body>
    </html>
  );
}
