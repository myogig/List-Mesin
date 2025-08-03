import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cog } from "lucide-react";

export default function Landing() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Cog className="text-white h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistem PM Mesin</h1>
          <p className="text-gray-600">Preventive Maintenance Management System</p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex space-x-1 mb-6">
              <Button
                variant={activeTab === "login" ? "default" : "ghost"}
                className="flex-1"
                onClick={() => setActiveTab("login")}
              >
                Masuk
              </Button>
              <Button
                variant={activeTab === "register" ? "default" : "ghost"}
                className="flex-1"
                onClick={() => setActiveTab("register")}
              >
                Daftar
              </Button>
            </div>

            {activeTab === "login" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Masukkan email Anda"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password Anda"
                    disabled
                  />
                </div>
                <Button onClick={handleLogin} className="w-full">
                  Masuk dengan Replit
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regEmail">Email</Label>
                  <Input
                    id="regEmail"
                    type="email"
                    placeholder="Masukkan email"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regPassword">Password</Label>
                  <Input
                    id="regPassword"
                    type="password"
                    placeholder="Buat password"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Konfirmasi password"
                    disabled
                  />
                </div>
                <Button onClick={handleLogin} className="w-full">
                  Daftar dengan Replit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
