import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { BsFillPersonFill } from "react-icons/bs";
import { IoMdLock } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { Link } from "react-router-dom";
import * as yup from "yup";
import useRegister from "../../../hooks/useRegister"; // Import the custom hook
import loadingGif from "/BG/buttonLoading.gif";
import wallpaper from "/BG/wallpaper.jpg";
import logo2 from "/Logos/Logo2.png";

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
      .min(6, "Password must be at least 6 characters"),
  })
  .required();

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const { registerUser, loading } = useRegister();
  const submit = async (data) => {
    await registerUser(data);
  };

  return (
    <>
      <div className="flex w-full h-screen mx-auto max-w-[1300px] pt-8 px-6 pb-4">
        <div className="w-full lg:w-6/12">
          <Link to={"/"} className="-mt-2">
            <img
              src={logo2}
              alt="Logo"
              className="cursor-pointer md:w-44 w-28"
            />
          </Link>
          <div className="flex justify-center items-center flex-col md:mt-14 mt-20">
            <h1 className="text-2xl md:text-3xl font-ppMori mb-1 flex">
              Welcome to ReviveReads
            </h1>
            <h3>Please enter your details.</h3>

            <form
              onSubmit={handleSubmit(submit)}
              className="w-full flex flex-col items-center"
            >
              {/* Full Name Input */}
              <div className="md:w-6/12 w-11/12 h-12 border-solid border rounded-3xl border-gray-300 mt-14 flex items-center pl-4 pr-2">
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

              {/* Email Input */}
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

              {/* Password Input */}
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

            {/* Redirect to Login */}
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

        {/* Background Image */}
        <div
          className="lg:w-6/12 relative bg-cover bg-center"
          style={{ backgroundImage: `url(${wallpaper})`, borderRadius: "15%" }}
        ></div>
      </div>
    </>
  );
};

export default RegisterPage;
