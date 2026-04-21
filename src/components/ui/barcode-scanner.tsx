"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, StopCircle } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  title?: string;
}

export function BarcodeScanner({ onScan, title = "Barcode Scanner" }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isScanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          onScan(decodedText);
          setIsScanning(false);
        },
        () => {
          // console.warn(error);
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => console.error("Failed to clear scanner", error));
      }
    };
  }, [isScanning, onScan]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isScanning ? (
          <div className="space-y-4">
            <div id="reader" className="overflow-hidden rounded-lg border bg-muted"></div>
            <Button variant="destructive" className="w-full" onClick={() => setIsScanning(false)}>
              <StopCircle className="mr-2 h-4 w-4" />
              Scanner stoppen
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 space-y-4 border-2 border-dashed rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground text-center px-6">
              Nutzen Sie die Kamera, um analoge Ergebnisse via Barcode oder QR-Code schnell zu erfassen.
            </p>
            <Button onClick={() => setIsScanning(true)}>
              Scanner starten
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
