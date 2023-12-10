import { useRef, useState, useEffect, MouseEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ERROR_CODE_INVALID_PASSWORD,
  ERROR_CODE_INVALID_EMAIL,
  ERROR_CODE_CLIENT_FETCH_FAILED,
  API_ROUTE_OBTAIN_TOKEN,
} from "../../lib/constants";
import LabelledTextInput from "../LabelledTextInput/LabelledTextInput";
import styles from "./LoginForm.module.css";
import { isValidEmail, isValidPassword } from "../../lib/utils/validation";

export type LoginFormProps = {
  onClickNoAccountYet: () => void;
};

const computeFormErrors = (values: { email: string; password: string }) => {
  if (!values.email) {
    return { email: "MISSING_EMAIL" };
  }

  if (!isValidEmail(values.email)) {
    return { email: "INVALID_EMAIL_INPUT" };
  }

  if (!isValidPassword(values.password)) {
    return { password: "INVALID_PASSWORD_INPUT" };
  }

  return {};
};

const LoginForm = ({ onClickNoAccountYet }: LoginFormProps) => {
  const t = useTranslations();

  const router = useRouter();

  const emailInputRef = useRef<HTMLInputElement>(null);

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    other?: string;
  }>({ email: "MISSING_EMAIL" });
  const [showFormErrors, setShowFormErrors] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    const newValues = { ...credentials, [name]: value };
    setCredentials(newValues);
    setFormErrors(computeFormErrors(newValues));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setShowFormErrors(true);

    if (formErrors.email || formErrors.password) {
      // Invalid inputs: no need to make a request
      return;
    }

    setIsLoading(true);

    try {
      await fetchTokens();

      router.refresh();
    } catch (error) {
      const errorCode = (error as Error).message;

      updateFormErrorsFromErrorCode(errorCode);
    }
  };

  const fetchTokens = async () => {
    let response;

    try {
      response = await fetch(API_ROUTE_OBTAIN_TOKEN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });
    } catch (error) {
      throw new Error(ERROR_CODE_CLIENT_FETCH_FAILED);
    } finally {
      setIsLoading(false);
    }

    if (!response.ok) {
      const data = await response.json();

      if (data?.errors?.length > 0) {
        const firstErrorCode = data.errors[0]?.code;

        throw new Error(firstErrorCode);
      }

      throw new Error();
    }
  };

  const updateFormErrorsFromErrorCode = (errorCode: string) => {
    switch (errorCode) {
      case ERROR_CODE_CLIENT_FETCH_FAILED:
        setFormErrors({ other: "CONNECTION_ERROR" });
        break;
      case ERROR_CODE_INVALID_EMAIL:
        setFormErrors({ email: "INVALID_EMAIL_LOGIN" });
        break;
      case ERROR_CODE_INVALID_PASSWORD:
        setFormErrors({ password: "INVALID_PASSWORD_LOGIN" });
        break;
      default:
        setFormErrors({ other: "UNFORESEEN_ERROR" });
    }
  };

  const handleClickLoadingOverlay = (event: MouseEvent) => {
    event.preventDefault(); // so that a click on the form has no effect when it's loading
  };

  return (
    <div className={styles.container}>
      <Image
        src="/images/logo.svg"
        alt="PinIt logo"
        width={40}
        height={40}
        className={styles.logo}
      />
      <h1 className={styles.title}>
        {t("LandingPageContent.LoginForm.WELCOME_TO_PINIT")}
      </h1>
      <form noValidate onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.emailInputContainer}>
          <LabelledTextInput
            name="email"
            label={t("LandingPageContent.LoginForm.EMAIL")}
            placeholder={t("LandingPageContent.LoginForm.EMAIL")}
            type="email"
            value={credentials.email}
            errorMessage={
              showFormErrors && formErrors.email
                ? t(`LandingPageContent.LoginForm.${formErrors.email}`)
                : ""
            }
            onChange={handleInputChange}
            autoComplete="email"
            ref={emailInputRef}
          />
        </div>
        <div className={styles.passwordInputContainer}>
          <LabelledTextInput
            name="password"
            label={t("LandingPageContent.LoginForm.PASSWORD")}
            placeholder={t("LandingPageContent.LoginForm.PASSWORD")}
            type="password"
            value={credentials.password}
            errorMessage={
              showFormErrors && formErrors.password
                ? t(`LandingPageContent.LoginForm.${formErrors.password}`)
                : ""
            }
            onChange={handleInputChange}
            withPasswordShowIcon={true}
          />
        </div>
        {showFormErrors && formErrors.other && (
          <div className={styles.otherErrorMessage}>
            <FontAwesomeIcon icon={faCircleXmark} />
            <div className={styles.otherErrorText}>
              {t(`Common.UNFORESEEN_ERROR`)}
            </div>
          </div>
        )}
        <button type="submit" className={styles.submitButton}>
          {t("LandingPageContent.LoginForm.LOG_IN")}
        </button>
      </form>
      <div className={styles.noAccountYet}>
        {t("LandingPageContent.LoginForm.NO_ACCOUNT_YET")}
        <button
          className={styles.noAccountYetButton}
          onClick={onClickNoAccountYet}
        >
          {t("LandingPageContent.LoginForm.SIGN_UP")}
        </button>
      </div>
      {isLoading && (
        <div
          className={styles.loadingOverlay}
          onClick={handleClickLoadingOverlay}
          data-testid="loading-overlay"
        >
          <FontAwesomeIcon
            icon={faSpinner}
            size="2x"
            spin
            className={styles.loadingSpinner}
          />
        </div>
      )}
    </div>
  );
};

export default LoginForm;
