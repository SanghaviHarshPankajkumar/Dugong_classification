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
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormInputs): Promise<LoginResponse> => {
      try {
        const payload = { ...data, email: data.email.toLowerCase() };
        const response = await axios.post<LoginResponse>(
          "/auth/login",
          payload,
          {
            headers: { "Content-Type": "application/json" },
            timeout: 10000,
          }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const apiError = error.response?.data as ApiError;
          throw new Error(
            apiError?.message ||
              apiError?.detail ||
              apiError?.error ||
              "Login failed. Please check your credentials."
          );
        }
        throw new Error("Network error. Please try again.");
      }
    },
    onError: (error: ApiError) => {
      toast.error(
        error.detail || error.message || error.error || "Login failed"
      );
    },
    onSuccess: (data: LoginResponse & { session_id?: string }) => {
      const token = data.access_token || data.token;
      if (token) {
        try {
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
        } catch {
          toast.error("Login successful but session setup failed");
        }
      } else {
        toast.error("Login failed: No access token received");
      }
    },
  });

  const onSubmit = (data: LoginFormInputs) => loginMutation.mutate(data);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between relative">
      {/* Bottom Right Logos - Fixed Position (Desktop only) */}
      <div className="fixed bottom-6 right-6 z-10 hidden sm:flex gap-3">
        {["UAE-2.png", "UAE-1.png"].map((logo, idx) => (
          <div key={idx} className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32">
            <img
              src={`./${logo}`}
              alt={`UAE Agency ${idx + 1}`}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>

      {/* UAE-3 Logo */}
      {/* UAE-3 Logo */}
      <div className="flex justify-center items-center mt-6 md:absolute md:top-8 md:left-1/2 md:-translate-x-1/2">
        <div className="w-48 sm:w-64 md:w-72 lg:w-80 max-w-full">
          <img
            src="./UAE-3.png"
            alt="UAE Agency 3"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Main Form Container */}
      <div className="flex flex-col items-center justify-center px-4 py-8 flex-1">
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
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-red-500 text-xs" role="alert">
                  {errors.email.message}
                </p>
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
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
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
                <p className="text-red-500 text-xs" role="alert">
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

      {/* Mobile Bottom Logos */}
      <div className="sm:hidden flex justify-end gap-2 pb-4 pt-2 pr-4">
        {["UAE-2.png", "UAE-1.png"].map((logo, idx) => (
          <div key={idx} className="w-24 h-24">
            <img
              src={`./${logo}`}
              alt={`UAE Agency ${idx + 1}`}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignInSection;
