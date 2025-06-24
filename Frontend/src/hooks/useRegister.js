import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const useRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const registerUser = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/user/sign-up", data);
      toast.success(response.data.message);
      navigate("/Login");
    } catch (error) {
      toast.error(error.response?.data.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return { registerUser, loading };
};

export default useRegister;
