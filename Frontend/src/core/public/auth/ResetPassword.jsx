import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa";
import { IoMdLock } from "react-icons/io";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { sanitizeText, sanitizeUserInput } from "../../../utils/sanitizeHtml";
import loadingGif from "/BG/buttonLoading.gif";
import logo2 from "/Logos/Logo2.png";

const schema = yup
  .object({
    newPassword: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)'
      ),
    confirmPassword: yup
      .string()
      .required("Please confirm your password")
      .oneOf([yup.ref("newPassword")], "Passwords must match"),
  })
  .required();

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [newPasswordValue, setNewPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Password strength check
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPasswordValue(value);
    setPasswordChecks({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    });
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");

      const cleanData = sanitizeUserInput(data);
      const response = await axios.post("/api/user/reset-password", {
        token,
        newPassword: cleanData.newPassword,
      });

      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      setError(
        sanitizeText(err.response?.data?.message || "An error occurred")
      );
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">
            Password Reset Successful!
          </h2>
          <p className="text-gray-600 mb-4">
            Your password has been successfully reset. You will be redirected to
            the login page shortly.
          </p>
          <Link
            to="/login"
            className="text-purple-700 hover:text-purple-900 underline"
          >
            Go to Login
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
            Reset Password
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Please enter your new password.
          </p>

          {error && (
            <div className="mb-4 text-red-500 text-center text-sm">{error}</div>
          )}
          <div className="w-full h-12 border rounded-3xl border-gray-300 mb-4 flex items-center pl-4 pr-2">
            <IoMdLock className="text-xl text-gray-500 mr-2" />
            <input
              type="password"
              placeholder="New Password"
              className="w-full outline-none"
              {...register("newPassword")}
              value={newPasswordValue}
              onChange={handlePasswordChange}
            />
          </div>
          {errors.newPassword && (
            <p className="text-red-500 text-xs mb-4">
              {errors.newPassword.message}
            </p>
          )}
          <div className="mb-4">
            <p className="text-xs text-gray-600">
              Password must contain at least 8 characters, including:
            </p>
            <ul className="text-xs text-gray-500 ml-4 mt-1 space-y-1">
              <li
                className={`flex items-center ${
                  passwordChecks.length ? "text-green-600" : ""
                }`}
              >
                {passwordChecks.length && (
                  <FaCheck className="text-green-500 mr-2" />
                )}
                • At least 8 characters
              </li>
              <li
                className={`flex items-center ${
                  passwordChecks.uppercase ? "text-green-600" : ""
                }`}
              >
                {passwordChecks.uppercase && (
                  <FaCheck className="text-green-500 mr-2" />
                )}
                • One uppercase letter (A-Z)
              </li>
              <li
                className={`flex items-center ${
                  passwordChecks.lowercase ? "text-green-600" : ""
                }`}
              >
                {passwordChecks.lowercase && (
                  <FaCheck className="text-green-500 mr-2" />
                )}
                • One lowercase letter (a-z)
              </li>
              <li
                className={`flex items-center ${
                  passwordChecks.number ? "text-green-600" : ""
                }`}
              >
                {passwordChecks.number && (
                  <FaCheck className="text-green-500 mr-2" />
                )}
                • One number (0-9)
              </li>
              <li
                className={`flex items-center ${
                  passwordChecks.special ? "text-green-600" : ""
                }`}
              >
                {passwordChecks.special && (
                  <FaCheck className="text-green-500 mr-2" />
                )}
                • One special character (!@#$%^&*(),.?":{}|&lt;&gt;)
              </li>
            </ul>
          </div>
          <div className="w-full h-12 border rounded-3xl border-gray-300 mb-4 flex items-center pl-4 pr-2">
            <IoMdLock className="text-xl text-gray-500 mr-2" />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full outline-none"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mb-4">
              {errors.confirmPassword.message}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-3xl h-12 bg-black text-white text-lg font-normal transition duration-200 ease-in-out hover:bg-[#403a4f] hover:font-semibold flex justify-center items-center"
          >
            {loading ? (
              <img src={loadingGif} alt="Loading..." className="w-10 h-10" />
            ) : (
              "Reset Password"
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

export default ResetPassword;
