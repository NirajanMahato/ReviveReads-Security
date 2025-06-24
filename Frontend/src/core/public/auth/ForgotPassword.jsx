import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MdEmail } from "react-icons/md";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import logo2 from "/Logos/Logo2.png";
import loadingGif from "/BG/buttonLoading.gif";

const schema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email address"),
}).required();

const ForgotPassword = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.post("/api/user/forgot-password", data);
      if (response.data.success) {
        setIsEmailSent(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-4">
            We've sent password reset instructions to your email address. Please check your inbox.
          </p>
          <Link
            to="/login"
            className="text-purple-700 hover:text-purple-900 underline"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen mx-auto max-w-[1300px] pt-8 px-6 pb-4">
      <div className="w-full max-w-md mx-auto">
        <Link to="/" className="-mt-2">
          <img src={logo2} alt="Logo" className="cursor-pointer md:w-44 w-28" />
        </Link>
        
        <form onSubmit={handleSubmit(onSubmit)} className="mt-16">
          <h1 className="text-2xl md:text-3xl font-ppMori mb-4 text-center">
            Forgot Password
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Enter your email address and we'll send you instructions to reset your password.
          </p>

          {error && (
            <div className="mb-4 text-red-500 text-center text-sm">
              {error}
            </div>
          )}

          <div className="w-full h-12 border rounded-3xl border-gray-300 mb-4 flex items-center pl-4 pr-2">
            <MdEmail className="text-xl text-gray-500 mr-2" />
            <input
              type="email"
              placeholder="Email"
              className="w-full outline-none"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mb-4">{errors.email.message}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-3xl h-12 bg-black text-white text-lg font-normal transition duration-200 ease-in-out hover:bg-[#403a4f] hover:font-semibold flex justify-center items-center"
          >
            {loading ? (
              <img src={loadingGif} alt="Loading..." className="w-10 h-10" />
            ) : (
              "Send Reset Instructions"
            )}
          </button>

          <div className="text-center mt-4">
            <Link
              to="/login"
              className="text-gray-500 hover:text-black transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;