import "../styles/globals.css";
import { ReactNode } from "react";
import { FrameProvider } from "../contexts/FrameContext";

export const metadata = {
  title: "Next.js Example",
  description: "FrameKey Matching Example",
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
