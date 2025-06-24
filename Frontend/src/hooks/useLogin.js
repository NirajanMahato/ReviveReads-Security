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
      const response = await axios.post("/api/user/sign-in", data);

      if (response.data.twoFactorRequired) {
        // 2FA required, return info for OTP step
        return { twoFactorRequired: true, user: response.data.user };
      }

      // Save user data in Redux and localStorage
      dispatch(authActions.login());
      dispatch(authActions.changeRole(response.data.user.role));
      localStorage.setItem("id", response.data.user.id);
      localStorage.setItem("token", response.data.user.token);
      localStorage.setItem("role", response.data.user.role);

      // Refresh user info in context
      refreshUserInfo();

      toast.success("Login successful!");

      if (response.data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
      return { twoFactorRequired: false };
    } catch (error) {
      toast.error(error.response?.data.message || "Login failed!");
      return { twoFactorRequired: false, error: true };
    }
  };

  return { login };
};

export default useLogin;
