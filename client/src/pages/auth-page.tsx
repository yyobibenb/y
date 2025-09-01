import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

const registerSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, "กรุณาติ๊กเพื่อยอมรับข้อกำหนดและเงื่อนไข"),
}).refine(data => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  const onRegister = (data: RegisterFormData) => {
    console.log('Form data:', data); // Debug log
    registerMutation.mutate({
      email: data.email,
      password: data.password,
      language: "th",
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="betting-gradient text-primary-foreground px-6 py-3 rounded-lg font-bold text-2xl inline-block mb-4">
              ThaiBC
            </div>
            <h1 className="text-2xl font-bold" data-testid="auth-title">เข้าสู่ระบบ ThaiBC Thailand</h1>
            <p className="text-muted-foreground" data-testid="auth-subtitle">
              แพลตฟอร์มเดิมพันกีฬาออนไลน์อันดับ 1
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">เข้าสู่ระบบ</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">สมัครสมาชิก</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="login-title">เข้าสู่ระบบ</CardTitle>
                  <CardDescription data-testid="login-description">
                    กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">อีเมล</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        {...loginForm.register("email")}
                        data-testid="input-login-email"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-destructive" data-testid="error-login-email">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">รหัสผ่าน</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="รหัสผ่านของคุณ"
                          {...loginForm.register("password")}
                          data-testid="input-login-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="toggle-login-password"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive" data-testid="error-login-password">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" />
                        <Label htmlFor="remember" className="text-sm">จดจำฉัน</Label>
                      </div>
                      <Button variant="link" className="px-0 text-sm" data-testid="forgot-password">
                        ลืมรหัสผ่าน?
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full betting-gradient"
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          กำลังเข้าสู่ระบบ...
                        </>
                      ) : (
                        "เข้าสู่ระบบ"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="register-title">สมัครสมาชิก</CardTitle>
                  <CardDescription data-testid="register-description">
                    สร้างบัญชีใหม่เพื่อเริ่มเดิมพัน
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-email">อีเมล</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@email.com"
                        {...registerForm.register("email")}
                        data-testid="input-register-email"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-destructive" data-testid="error-register-email">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">รหัสผ่าน</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="รหัสผ่าน (ขั้นต่ำ 8 ตัว)"
                          {...registerForm.register("password")}
                          data-testid="input-register-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="toggle-register-password"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive" data-testid="error-register-password">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">ยืนยันรหัสผ่าน</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="ยืนยันรหัสผ่าน"
                          {...registerForm.register("confirmPassword")}
                          data-testid="input-confirm-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          data-testid="toggle-confirm-password"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive" data-testid="error-confirm-password">
                          {registerForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-sm text-muted-foreground mb-1">รหัสบัญชีของคุณ:</div>
                      <div className="font-mono text-lg font-bold text-secondary" data-testid="generated-account-id">
                        จะสร้างหลังสมัครสำเร็จ
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">* โปรดบันทึกรหัสนี้สำหรับการฝากเงิน</div>
                    </div>

                    <div className={`border rounded-lg p-3 ${registerForm.formState.errors.terms ? 'border-destructive bg-destructive/5' : 'border-muted'}`}>
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="terms"
                          checked={registerForm.watch("terms")}
                          onCheckedChange={(checked) => registerForm.setValue("terms", !!checked)}
                          data-testid="checkbox-terms"
                          className="mt-1"
                        />
                        <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                          ฉันยอมรับ{" "}
                          <a 
                            href="https://google.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary underline hover:text-primary/80"
                            data-testid="link-terms"
                          >
                            ข้อกำหนดและเงื่อนไข
                          </a>{" "}
                          ของ ThaiBC
                        </Label>
                      </div>
                      {registerForm.formState.errors.terms && (
                        <p className="text-sm text-destructive mt-2" data-testid="error-terms">
                          {registerForm.formState.errors.terms.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full betting-gradient"
                      disabled={registerMutation.isPending}
                      data-testid="button-register"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          กำลังสมัครสมาชิก...
                        </>
                      ) : (
                        "สมัครสมาชิก"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:flex flex-1 betting-gradient items-center justify-center p-8">
        <div className="text-center text-primary-foreground max-w-md">
          <h2 className="text-4xl font-bold mb-4" data-testid="hero-title">
            เดิมพันกีฬาออนไลน์
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90" data-testid="hero-description">
            ประสบการณ์การเดิมพันที่ดีที่สุด พร้อมอัตราต่อรองสูงและการบริการ 24/7
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-primary-foreground/10 p-4 rounded-lg">
              <div className="font-bold text-2xl">24/7</div>
              <div>บริการตลอด 24 ชั่วโมง</div>
            </div>
            <div className="bg-primary-foreground/10 p-4 rounded-lg">
              <div className="font-bold text-2xl">100+</div>
              <div>ลีกกีฬาทั่วโลก</div>
            </div>
            <div className="bg-primary-foreground/10 p-4 rounded-lg">
              <div className="font-bold text-2xl">เร็ว</div>
              <div>ฝาก-ถอนเร็วทันใจ</div>
            </div>
            <div className="bg-primary-foreground/10 p-4 rounded-lg">
              <div className="font-bold text-2xl">ปลอดภัย</div>
              <div>ระบบความปลอดภัยสูง</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
