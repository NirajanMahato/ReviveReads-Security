import axios from "axios";
import { useContext } from "react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { authActions } from "../store/auth";

const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { refreshUserInfo } = useContext(UserContext);

  const login = async (data) => {
    try {
      const response = await axios.post("/api/user/sign-in", data, {
        withCredentials: true,
      });

      if (response.data.twoFactorRequired) {
        return { twoFactorRequired: true, user: response.data.user };
      }

      dispatch(authActions.login());
      dispatch(authActions.changeRole(response.data.user.role));

      refreshUserInfo();

      toast.success("Login successful!");

      if (response.data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

      return { twoFactorRequired: false };
    } catch (error) {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || "Login failed!";

      // Distinguish between invalid credentials and lockout
      if (status === 403) {
        toast.error(
          "Your account is locked. Please try again after 15 minutes."
        );
        return {
          error: true,
          errorMessage:
            "Your account is locked. Please try again after 15 minutes.",
        };
      }

      toast.error(errorMessage);
      return {
        twoFactorRequired: false,
        error: true,
        errorMessage,
      };
    }
  };

  return { login };
};

export default useLogin;
