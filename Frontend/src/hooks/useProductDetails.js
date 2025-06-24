import axios from "axios";
import { useEffect, useState } from "react";

const useProductDetails = (bookId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductDetails = async () => {
    try {
      const productResponse = await axios.get(
        `/api/book/get-book-by-id/${bookId}`
      );
      const productData = productResponse?.data;
      setProduct(productData);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching product details:", err);
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [bookId]);

  return { product, loading, error };
};

export default useProductDetails;
