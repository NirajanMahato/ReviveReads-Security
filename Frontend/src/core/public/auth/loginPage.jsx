import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { IoMdLock } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { Link } from "react-router-dom";
import * as yup from "yup";
import useLogin from "../../../hooks/useLogin";
import loadingGif from "/BG/buttonLoading.gif";
import wallpaper from "/BG/wallpaper.jpg";
import logo2 from "/Logos/Logo2.png";

const schema = yup
  .object({
    email: yup
      .string()
      .required("Email is required")
      .email("Enter a valid email address"),
    password: yup.string().required("Password is required"),
  })
  .required();

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useLogin();

  const submit = async (data) => {
    setLoading(true);
    const result = await login(data);
    setLoading(false);
    if (result?.twoFactorRequired) {
      setTwoFactorRequired(true);
      setOtpEmail(result.user.email);
      toast.success("OTP sent to your email. Please check your inbox.");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        "/api/user/verify-otp",
        { email: otpEmail, otp },
        {
          withCredentials: true,
        }
      );
      // Cookies are automatically set by the server
      // Just refresh the page to update the context
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data.message || "OTP verification failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={"flex w-full h-screen mx-auto max-w-[1300px] pt-8 px-6 pb-4"}
      >
        <div className="w-full lg:w-6/12">
          <Link to={"/"} className="-mt-2">
            <img
              src={logo2}
              alt="Logo"
              className="cursor-pointer md:w-44 w-28"
            />
          </Link>
          {!twoFactorRequired ? (
            <form
              onSubmit={handleSubmit(submit)}
              className={
                "flex justify-center items-center flex-col md:mt-14 mt-20"
              }
            >
              <h1 className={"text-2xl md:text-3xl font-ppMori mb-1 flex"}>
                Welcome to ReviveReads
              </h1>
              <h3>Please enter your credentials.</h3>
              <div
                className={
                  "md:w-6/12 w-11/12 h-12 border-solid border rounded-3xl border-gray-300 mt-14 flex items-center pl-4 pr-2"
                }
              >
                <MdEmail
                  style={{
                    fontSize: "1.4rem",
                    marginRight: "0.5rem",
                    color: "gray",
                  }}
                />
                <input
                  type={"email"}
                  placeholder={"Email"}
                  className={"w-full outline-none appearance-none"}
                  {...register("email")}
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <h6 className="md:w-5/12 w-11/12 text-red-500 text-xs">
                  {errors.email.message}
                </h6>
              )}
              <div
                className={
                  "md:w-6/12 w-11/12 h-12 border-solid border rounded-3xl border-gray-300 mt-4 flex items-center pl-4 pr-2"
                }
              >
                <IoMdLock
                  style={{
                    fontSize: "1.4rem",
                    marginRight: "0.5rem",
                    color: "gray",
                  }}
                />
                <input
                  type={"password"}
                  placeholder={"Password"}
                  className={"w-full outline-none"}
                  {...register("password")}
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <h6 className="md:w-5/12 w-11/12 text-red-500 text-xs">
                  {errors.password.message}
                </h6>
              )}

              <div className={"md:w-6/12 w-11/12 flex justify-end pt-3 pr-1"}>
                <Link to={"/forgot-password"}>
                  <h3
                    className={
                      "text-gray-500 cursor-pointer transition-all hover:text-black"
                    }
                  >
                    Forgot password?
                  </h3>
                </Link>
              </div>
              <button
                className={
                  "mt-8 md:w-6/12 w-11/12 rounded-3xl h-12 bg-black text-white text-lg font-normal transition duration-200 ease-in-out hover:bg-[#403a4f] hover:font-semibold flex items-center justify-center"
                }
                type={"submit"}
                disabled={loading}
              >
                {loading ? (
                  <img
                    src={loadingGif}
                    alt="Loading..."
                    className="w-7 h-7 mr-2"
                  />
                ) : null}
                {loading ? "Sending OTP..." : "Login"}
              </button>
              <div
                className={"md:w-6/12 w-11/12 flex justify-center pt-3 pr-1"}
              >
                <h3 className={"text-gray-500"}>Don`t have an account? </h3>
                <Link to={"/Signup"}>
                  <h3
                    className={
                      "text-purple-700 ml-1 cursor-pointer transition-all underline"
                    }
                  >
                    Sign up
                  </h3>
                </Link>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleOtpSubmit}
              className="flex flex-col items-center mt-20"
            >
              <h2 className="text-2xl font-gilroySemiBold mb-4">Enter OTP</h2>
              <p className="mb-4 text-gray-600">
                An OTP has been sent to your email. Please enter it below.
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-80 p-2 border rounded-3xl mb-4 text-center text-lg tracking-widest"
                placeholder="Enter 6-digit OTP"
                required
                disabled={loading}
              />
              <button
                type="submit"
                className="w-80 bg-black text-white py-3 rounded-3xl hover:bg-gray-900 transition duration-200 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <img
                    src={loadingGif}
                    alt="Loading..."
                    className="w-7 h-7 mr-2"
                  />
                ) : null}
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}
        </div>
        <div
          className="lg:w-6/12 relative bg-cover bg-center"
          style={{ backgroundImage: `url(${wallpaper})`, borderRadius: "15%" }}
        ></div>
      </div>
    </>
  );
};

export default LoginPage;
