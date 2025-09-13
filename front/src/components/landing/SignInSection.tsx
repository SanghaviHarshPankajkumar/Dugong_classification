import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { useUploadStore } from "@/store/upload";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

interface LoginResponse {
  access_token?: string;
  token?: string;
  message?: string;
  username?: string;
  email?: string;
  session_id?: string;
}

interface ApiError {
  message?: string;
  detail?: string;
  error?: string;
}

const SignInSection = () => {
  const navigate = useNavigate();
  const { setToken, setUsername, setEmail, setSessionId } = useAuthStore();
  const { setSessionId: setUploadSessionId } = useUploadStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormInputs): Promise<LoginResponse> => {
      const payload = { ...data, email: data.email.toLowerCase() };
      const response = await axios.post<LoginResponse>("/auth/login", payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });
      return response.data;
    },
    onError: (error: ApiError) => {
      toast.error(
        error.detail || error.message || error.error || "Login failed"
      );
    },
    onSuccess: (data: LoginResponse) => {
      const token = data.access_token || data.token;
      if (token) {
        Cookies.set("access_token", token, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        setToken(token);
        setUsername(data.username || "User");
        setEmail(data.email || "user@gmail.com");
        if (data.session_id) {
          setSessionId(data.session_id);
          setUploadSessionId(data.session_id);
        }
        toast.success("Logged in successfully");
        navigate("/dashboard", { replace: true });
      } else {
        toast.error("Login failed: No access token received");
      }
    },
  });

  const onSubmit = (data: LoginFormInputs) => loginMutation.mutate(data);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top Logo */}
      <div className="flex justify-center pt-6">
        <img
          src="./UAE-3.png"
          alt="UAE Agency 3"
          className="w-[350px] h-[350px] object-contain"
        />
      </div>
      {/* Form Section */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-4">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
            Sign In
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Provide your details to proceed to the dashboard
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter Email"
                autoComplete="email"
                {...register("email")}
                className={`h-11 bg-gray-50 rounded-lg ${
                  errors.email
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-gray-200 focus-visible:ring-blue-500"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  autoComplete="current-password"
                  {...register("password")}
                  className={`h-11 bg-gray-50 rounded-lg pr-10 ${
                    errors.password
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-gray-200 focus-visible:ring-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 bg-[#0077B6] hover:bg-[#00689E] text-white font-medium rounded-lg"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>

      {/* Bottom Logos */}
      <div className="flex justify-center sm:justify-end gap-3 p-6">
        {["UAE-2.png", "UAE-1.png"].map((logo, idx) => (
          <img
            key={idx}
            src={`./${logo}`}
            alt={`UAE Agency ${idx + 1}`}
            className="max-w-[90px] sm:max-w-[110px] md:max-w-[130px] lg:max-w-[150px] h-auto object-contain"
          />
        ))}
      </div>
    </div>
  );
};

export default SignInSection;
