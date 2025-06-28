import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const SignInSection = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormInputs) => {
      try {
        const response = await axios.post("http://127.0.0.1:8000/auth/login", data, {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        });
        return response.data;
      } catch (error) {
        console.error("Login API Error:", error);
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || "Login failed");
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Login success data:", data);
      const token = data.access_token;
      if (token) {
        Cookies.set("access_token", token, { expires: 7 });
        setToken(token);
        toast.success("Logged in successfully");
        navigate("/dashboard");
      } else {
        toast.error("No access token received");
      }
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please check your credentials.");
    },
  });

  const onSubmit = (data: LoginFormInputs) => {
    console.log("Form submission data:", data);
    loginMutation.mutate(data);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex items-center justify-center md:w-1/2 w-full p-6 bg-white">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold text-center mb-6">Sign In</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <Input
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className={
                  errors.email
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password with Toggle */}
            <div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className={`pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-500 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInSection;