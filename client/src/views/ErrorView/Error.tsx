import { useLocation, useNavigate } from "react-router-dom";

const Error = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigateHome = () => {
    navigate("/");
    window.scrollTo(0, 0);
  }

  return (
    <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
      <h1 className="text-center text-[50px] text-main-text-black dark:text-main-text-white mb-3 max-md:text-[45px]">Something is wrong...</h1>
      <p className="text-side-text-light dark:text-side-text-gray text-[20px] text-center">
        {location.state ? location.state["error"] : 'The page you are looking for could not be found'}
      </p>
      <button className="btn-primary w-[150px] h-[45px] text-base block m-auto mt-5" onClick={navigateHome}>
        Back to home
      </button>
    </div>
  )
};

export default Error;