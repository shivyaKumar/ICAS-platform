"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const rawToken = searchParams.get("token");
  const token = rawToken ? decodeURIComponent(rawToken) : null; // ✅ decode
  const email = searchParams.get("email");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Password validation rules (mirror backend rules from Program.cs)
  const validatePassword = (pw: string) => {
    return [
      { test: /.{12,}/, message: "At least 12 characters" },
      { test: /[A-Z]/, message: "At least one uppercase letter" },
      { test: /[a-z]/, message: "At least one lowercase letter" },
      { test: /[0-9]/, message: "At least one number" },
      { test: /[^A-Za-z0-9]/, message: "At least one special character" },
    ].map(rule => ({
      message: rule.message,
      valid: rule.test.test(pw),
    }));
  };

  const passwordChecks = validatePassword(password);
  const allValid = passwordChecks.every(r => r.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !email) {
      setMessage("Invalid or missing reset token/email.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (!allValid) {
      setMessage("Password does not meet requirements.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        //Call your Next.js API route, not backend directly
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password }),
      });

      if (res.ok) {
        setMessage("Password reset successful! Redirecting...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        const error = await res.text();
        setMessage("Failed: " + error);
      }
    } catch (err) {
      setMessage("Error: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md rounded-none shadow-md border border-gray-200">
        <CardHeader className="bg-[#f6f0fb] border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Reset Password
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {message && (
              <p
                className={`text-sm ${
                  message.includes("successful")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}

            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <ul className="mt-2 text-xs space-y-1">
                {passwordChecks.map((r, i) => (
                  <li
                    key={i}
                    className={r.valid ? "text-green-600 flex items-center gap-1" : "text-gray-500 flex items-center gap-1"}
                  >
                    {r.valid && <Check className="h-4 w-4 text-green-600" />}
                    {r.message}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !allValid}
              className="w-full bg-yellow-500 text-black font-semibold rounded-none hover:bg-yellow-600 transition disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
