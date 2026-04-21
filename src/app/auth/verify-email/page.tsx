"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">E-Mail bestätigen</CardTitle>
          <CardDescription>
            Wir haben dir einen Bestätigungslink gesendet
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600">
            Bitte überprüfe dein E-Mail-Postfach und klicke auf den Link, um dein
            Konto zu aktivieren. Der Link ist 24 Stunden gültig.
          </p>
          <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            <p>
              <strong>Hinweis:</strong> Überprüfe auch deinen Spam-Ordner, falls du
              keine E-Mail erhältst.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/auth/login" className="w-full">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Anmeldung
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
