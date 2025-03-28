import type { Metadata } from "next"
import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import "./globals.css";

export const metadata: Metadata = {
  title: "Dynamic UI ",
  description: "Dynamic UI",
}
const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <body>
      <AntdRegistry>{children}</AntdRegistry>
    </body>
  </html>
);

export default RootLayout;