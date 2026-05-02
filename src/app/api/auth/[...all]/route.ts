// InsForge Auth wird über Client SDK und Callback-Routen verwaltet
// Diese Catch-All Route wird nicht mehr benötigt
// Siehe: /api/auth/callback und /api/auth/confirm für spezifische Endpunkte

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Verwende InsForge Auth Client SDK" },
    { status: 404 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Verwende InsForge Auth Client SDK" },
    { status: 404 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Verwende InsForge Auth Client SDK" },
    { status: 404 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Verwende InsForge Auth Client SDK" },
    { status: 404 }
  );
}
