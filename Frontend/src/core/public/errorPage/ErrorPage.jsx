import { Link } from "react-router-dom";
import errorPageImg from "/BG/ErrorPage.png";

const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center h-screen px-4">
      <div className="flex items-center justify-center">
        <img
          src={errorPageImg}
          alt="errorPage"
          className="lg:h-72 md:h-60 h-28"
        />
      </div>
      <h1 className="text-9xl font-bold text-gray-950 lg:mt-8 md:mt-28 mt-20 tracking-wide">
        404
      </h1>
      <div className="text-lg mt-4 text-center">
        <h1 className="font-gilroyMedium mt-4">
          Looks like you’ve got lost...
        </h1>
        <h1 className=" text-gray-600 mt-2 md:text-base text-sm">
          The page you’re looking for doesn’t exist or has been moved.
        </h1>
      </div>

      <Link to={'/'}>
        <button className="font-gilroySemiBold mt-8 text-3xl text-black hover:text-gray-600">
          Go Home
        </button>
      </Link>
    </div>
  );
};

export default ErrorPage;
