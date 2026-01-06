"use client";

import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useRef } from "react";

interface QRCodeDisplayProps {
  url: string;
  size?: number;
  includeDownload?: boolean;
  className?: string;
}

export function QRCodeDisplay({
  url,
  size = 128,
  includeDownload = true,
  className,
}: QRCodeDisplayProps) {
  const svgRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!svgRef.current) return;

    const svg = svgRef.current.querySelector("svg");
    if (!svg) return;

    // Create a canvas to convert SVG to PNG
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size (with padding)
    const padding = 16;
    canvas.width = size + padding * 2;
    canvas.height = size + padding * 2;

    // Fill white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, padding, padding);
      URL.revokeObjectURL(svgUrl);

      // Download the image
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = "resume-qr-code.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    img.src = svgUrl;
  };

  return (
    <div className={className}>
      <div
        ref={svgRef}
        className="bg-white p-4 rounded-lg inline-block"
      >
        <QRCodeSVG
          value={url}
          size={size}
          level="M"
          includeMargin={false}
          bgColor="white"
          fgColor="black"
        />
      </div>
      {includeDownload && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="mt-3 w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          Download QR Code
        </Button>
      )}
    </div>
  );
}
