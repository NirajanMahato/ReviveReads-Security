import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BsFillPersonFill } from "react-icons/bs";
import { FaCheck } from "react-icons/fa";
import { IoMdLock } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { Link } from "react-router-dom";
import * as yup from "yup";
import useRegister from "../../../hooks/useRegister";
import loadingGif from "/BG/buttonLoading.gif";
import wallpaper from "/BG/wallpaper.jpg";
import logo2 from "/Logos/Logo2.png";
import { sanitizeUserInput } from "../../../utils/sanitizeHtml";

const schema = yup
  .object({
    name: yup
      .string()
      .required("Name is required")
      .min(3, "Name must be at least 3 characters"),
    email: yup
      .string()
      .required("Email is required")
      .email("Enter a valid email address"),
    password: yup
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
    captchaAnswer: yup
      .string()
      .required("Please type the characters shown")
      .test("captcha", "Incorrect characters", function (value) {
        return value === this.parent.captchaText;
      }),
  })
  .required();

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({ resolver: yupResolver(schema) });

  const { registerUser, loading } = useRegister();
  const [captchaText, setCaptchaText] = useState("");
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const password = watch("password", "");

  useEffect(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let text = "";
    for (let i = 0; i < 5; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    setValue("captchaText", text);
  }, [setValue]);

  // Password strength check
  useEffect(() => {
    if (password) {
      setPasswordChecks({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      });
    }
  }, [password]);

  const submit = async (data) => {
    const cleanData = sanitizeUserInput(data);
  await registerUser(cleanData);
  };

  return (
    <>
      <div className="flex w-full mx-auto max-w-[1300px] pt-8 px-6 pb-4">
        <div className="w-full lg:w-6/12 pb-10">
          <Link to={"/"} className="-mt-2">
            <img
              src={logo2}
              alt="Logo"
              className="cursor-pointer md:w-44 w-28"
            />
          </Link>
          <div className="flex justify-center items-center flex-col mt-8">
            <h1 className="text-2xl md:text-3xl font-ppMori mb-1 flex">
              Welcome to ReviveReads
            </h1>
            <h3>Please enter your details.</h3>
            <form
              onSubmit={handleSubmit(submit)}
              className="w-full flex flex-col items-center"
            >
              <div className="md:w-6/12 w-11/12 h-12 border-solid border rounded-3xl border-gray-300 mt-8 flex items-center pl-4 pr-2">
                <BsFillPersonFill
                  style={{
                    fontSize: "1.4rem",
                    marginRight: "0.5rem",
                    color: "gray",
                  }}
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full outline-none appearance-none"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <h6 className="md:w-5/12 w-11/12 text-red-500 text-xs">
                  {errors.name?.message}
                </h6>
              )}
              <div className="md:w-6/12 w-11/12 h-12 border-solid border rounded-3xl border-gray-300 mt-4 flex items-center pl-4 pr-2">
                <MdEmail
                  style={{
                    fontSize: "1.4rem",
                    marginRight: "0.5rem",
                    color: "gray",
                  }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full outline-none appearance-none"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <h6 className="md:w-5/12 w-11/12 text-red-500 text-xs">
                  {errors.email?.message}
                </h6>
              )}
              <div className="md:w-6/12 w-11/12 h-12 border-solid border rounded-3xl border-gray-300 mt-4 flex items-center pl-4 pr-2">
                <IoMdLock
                  style={{
                    fontSize: "1.4rem",
                    marginRight: "0.5rem",
                    color: "gray",
                  }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full outline-none"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <h6 className="md:w-5/12 w-11/12 text-red-500 text-xs">
                  {errors.password?.message}
                </h6>
              )}
              <div className="md:w-6/12 w-11/12 mt-2">
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

              <div className="md:w-6/12 w-11/12 mt-4">
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-md font-semibold text-gray-700">
                    Type the characters you see below:
                  </span>
                  <div className="flex w-full items-center justify-between space-x-2">
                    <div
                      className="text-lg font-bold px-4 py-2 rounded border bg-gray-100 tracking-widest select-none"
                      style={{
                        letterSpacing: "0.3em",
                        fontFamily: "monospace",
                        fontSize: "1.5rem",
                      }}
                    >
                      {captchaText}
                    </div>
                    <input
                      type="text"
                      placeholder="Type here"
                      className="w-32 flex-1 h-12 border border-gray-300 rounded px-2 text-sm outline-none text-center"
                      {...register("captchaAnswer")}
                    />
                  </div>
                </div>
                {errors.captchaAnswer && (
                  <h6 className="text-red-500 text-xs text-center mt-1">
                    {errors.captchaAnswer?.message}
                  </h6>
                )}
              </div>

              <button
                type="submit"
                className="mt-8 md:w-6/12 w-11/12 flex justify-center items-center rounded-3xl h-12 bg-black text-white text-lg font-normal transition duration-200 ease-in-out hover:bg-[#403a4f] hover:font-semibold"
              >
                {loading ? (
                  <img
                    src={loadingGif}
                    alt="Loading..."
                    className="w-10 h-10"
                  />
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
            <div className="md:w-6/12 w-11/12 flex justify-center pt-3 pr-1">
              <h3 className="text-gray-500">Already have an account?</h3>
              <Link to="/Login">
                <h3 className="text-purple-700 ml-1 cursor-pointer transition-all underline">
                  Sign in
                </h3>
              </Link>
            </div>
          </div>
        </div>
        <div
          className="lg:w-6/12 h-screen relative bg-cover bg-center"
          style={{ backgroundImage: `url(${wallpaper})`, borderRadius: "15%" }}
        ></div>
      </div>
    </>
  );
};

export default RegisterPage;
