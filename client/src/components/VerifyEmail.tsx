import PopUpWrapper from "../wrappers/PopUpWrapper";
import { useEffect, useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import ErrorMessage from "./ErrorMessage";
import { TErrorMessage } from "../@types/TErrorMessage";
import { getAPIErrorMessage } from "../utils/getAPIErrorMessage";
import Button from "./Button";
import { useSearchInputRefs } from "../hooks/useSearchInputRefs";

interface Props {
  setVerifyEmailPopUp: React.Dispatch<React.SetStateAction<boolean>>,
  setSignUpPopUp: React.Dispatch<React.SetStateAction<boolean>>,
  emailAddress: string,
  password: string
}

const VerifyEmail: React.FC<Props> = ({ setVerifyEmailPopUp, setSignUpPopUp, emailAddress, password }) => {
  const inputs = 4;
  const inputRefs = useSearchInputRefs(inputs);
  const [inputIndex, setInputIndex] = useState(0);

  const [errorMessage, setErrorMessage] = useState<TErrorMessage | undefined>();
  const [secretCode, setSecretCode] = useState<string>("");
  const [toggleSecretCode, setToggleSecretCode] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);

  const sendVerificationCode = useCallback(async () => {
    try {
      const response = await axios.post<{ code: string }>(`/api/users/send-code`, { email: emailAddress });
      setSecretCode(response.data.code);
      setErrorMessage(undefined);
    }
    catch (error: any) {
      const errorMsg = getAPIErrorMessage(error as AxiosError<{ error: string }>);
      setErrorMessage(errorMsg);
    }
  }, [emailAddress]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key;

    if (/^\d$/.test(key) && inputIndex < inputRefs.current.length) {
      inputRefs.current[inputIndex].current!.value = key;
      const tmp = Math.min(inputRefs.current.length - 1, inputIndex + 1);
      setInputIndex(tmp);
    } else if (key === "Backspace") {
      inputRefs.current[inputIndex].current!.value = "";
      setInputIndex((cur) => Math.max(0, cur - 1));
    }
  }, [inputRefs, setInputIndex, inputIndex]);

  useEffect(() => {
    sendVerificationCode();
  }, [sendVerificationCode])

  useEffect(() => {
    inputRefs.current[inputIndex].current?.focus();
  }, [inputIndex, inputRefs])

  useEffect(() => {
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keyup", handleKeyUp);
    }
  }, [handleKeyUp])

  const checkVerificationCode = async (): Promise<TErrorMessage | undefined> => {
    const codeInput = inputRefs.current.map((input) => input.current!.value).join("");
    setDisabled(true);

    try {
      await axios.post<string>(`/api/users/verify-email`, { 
        code: codeInput,
        email: emailAddress 
      });
      
      return createAccount();
    }
    catch (error: any) {
      const errorMsg = getAPIErrorMessage(error as AxiosError<{ error: string }>);
      return errorMsg;
    }
    finally {
      setDisabled(false);
    }
  }

  const createAccount = async (): Promise<TErrorMessage | undefined> => {
    try {
      await axios.post<string>(`/api/users/register`, {
        email: emailAddress,
        password: password
      });
  
      setErrorMessage(undefined);
    }
    catch (error: any) {
      const errorMsg = getAPIErrorMessage(error as AxiosError<{ error: string }>);
      return errorMsg;
    }
  }

  const toggleSecretCodeHandler = () => {
    setToggleSecretCode((cur) => !cur);
  }

  const backToSignUp = () => {
    setVerifyEmailPopUp(false);
    setSignUpPopUp(true);
  }

  const closeVerifyEmailPopUp = () => {
    setVerifyEmailPopUp(false);
  }

  return (
    <PopUpWrapper setPopUp={setVerifyEmailPopUp}>
      <h4 className="text-2xl mb-2">Please check your email</h4>
      <p className="text-side-text-light dark:text-side-text-gray text-lg mb-3">
        We've just sent a code to
        <span className="font-semibold">
          {` ${emailAddress}`}
        </span>
      </p>
      {secretCode !== "" &&
      <>
        <button className={`text-bg-primary-btn-hover ${toggleSecretCode ? "mb-1" : "mb-[26px]"} underline`} onClick={toggleSecretCodeHandler}>
          Psst! Want to know a secret?
        </button>
        {toggleSecretCode && 
        <p className="text-main-text-black mb-[26px] dark:text-main-text-white">
          Code:
          <span className="text-in-stock-green-text dark:text-in-stock-green-text-dark">
            {` ${secretCode}`}
          </span>
        </p>}
      </>}
      <div className="flex justify-between">
        {inputRefs.current.map((ref: React.RefObject<HTMLInputElement>, index: number) => {
          return (
            <input 
              type="text" 
              key={index}
              ref={ref}
              className="sm:w-[85px] sm:h-[85px] max-sm:w-[50px] max-sm:h-[50px] text-[45px] text-center text-box-light dark:text-box"
              onClick={() => setInputIndex(index)}
              onChange={(e) => e.target.value = e.target.value.substring(e.target.value.length - 1)}
            />
          )
        })}
      </div>
      <p className="mt-[26px] text-center text-side-text-light dark:text-side-text-gray text-[15px]">
        Didn't get a code?
        <span className={`font-semibold text-main-text-black dark:text-main-text-white underline cursor-pointer ml-2 
        btn hover:!text-bg-primary-btn-hover ${disabled ? "pointer-events-none" : ""}`} onClick={sendVerificationCode}>
          Click to resend.
        </span>
      </p>
      {errorMessage && <ErrorMessage error={errorMessage.message} />}
      <div className="flex gap-4 mt-7 max-xs:flex-col-reverse">
        <button className="login-btn text-base xs:w-1/2 max-xs:w-full" onClick={backToSignUp}>
          Back
        </button>
        <Button
          action={checkVerificationCode}
          completedText="Account created"
          defaultText="Verify"
          loadingText="Verifying email"
          styles="btn-primary xs:w-1/2 max-xs:w-full h-[47px] text-base"
          setErrorMessage={setErrorMessage}
          whenComplete={closeVerifyEmailPopUp}
        />
      </div>
    </PopUpWrapper>
  )
};

export default VerifyEmail;