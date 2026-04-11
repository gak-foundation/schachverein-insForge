import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-5xl">♔</div>
          <CardTitle className="text-2xl">E-Mail bestätigen</CardTitle>
          <CardDescription>
            Wir haben Ihnen einen Verifizierungs-Link gesendet. Bitte prüfen Sie Ihr E-Mail-Postfach.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-gray-600">
            Klicken Sie auf den Link in der E-Mail, um Ihre Adresse zu bestätigen. Danach können Sie sich anmelden.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/login">
              <Button className="w-full">Zum Login</Button>
            </Link>
          </div>
          <p className="text-center text-xs text-gray-500">
            Keine E-Mail erhalten? Prüfen Sie Ihren Spam-Ordner oder{" "}
            <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
              versuchen Sie es erneut
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}