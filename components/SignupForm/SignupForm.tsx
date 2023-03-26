import { useRef, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { API_BASE_URL, ENDPOINT_SIGN_UP } from "@/lib/constants";
import LabelledTextInput from "../LabelledTextInput/LabelledTextInput";
import styles from "./SignupForm.module.css";
import { useIntl } from "react-intl";
import Image from "next/image";
import { isValidBirthdate, isValidEmail, isValidPassword } from "@/lib/helpers";

export type SignupFormProps = {
  onSignupSuccess: () => void;
  setIsLoading: (isLoading: boolean) => void;
  onClickAlreadyHaveAccount: () => void;
};

const computeFormErrors = (values: {
  email: string;
  password: string;
  birthdate: string;
}) => {
  if (!values.email) {
    return { email: "MISSING_EMAIL" };
  }

  if (!isValidEmail(values.email)) {
    return { email: "INVALID_EMAIL_INPUT" };
  }

  if (!isValidPassword(values.password)) {
    return { password: "INVALID_PASSWORD_INPUT" };
  }

  if (!isValidBirthdate(values.birthdate)) {
    return { birthdate: "INVALID_BIRTHDATE_INPUT" };
  }

  return {};
};

const SignupForm = ({
  setIsLoading,
  onSignupSuccess,
  onClickAlreadyHaveAccount,
}: SignupFormProps) => {
  const emailInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    birthdate: "",
  });
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    birthdate?: string;
    other?: string;
  }>({ email: "MISSING_EMAIL" });
  const [showFormErrors, setShowFormErrors] = useState(false);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    setFormErrors(computeFormErrors(newFormData));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setShowFormErrors(true);

    if (formErrors.email || formErrors.password || formErrors.birthdate) {
      // Invalid inputs: no need to make a request
      return;
    }

    setIsLoading(true);

    let data, response;

    try {
      response = await fetch(`${API_BASE_URL}/${ENDPOINT_SIGN_UP}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      data = await response.json();
    } catch (error) {
      setFormErrors({ other: "CONNECTION_ERROR" });
      return;
    } finally {
      setIsLoading(false);
    }

    if (!response.ok) {
      if (response.status == 401) {
        if (true) {
          // TODO: display errors
        } else {
          // Unknown error code
          setFormErrors({ other: "UNFORESEEN_ERROR" });
        }
      } else {
        // Unknown status code
        setFormErrors({ other: "UNFORESEEN_ERROR" });
      }
      return;
    }

    const { access, refresh } = data;

    if (!access || !refresh) {
      // Abnormal response
      setFormErrors({ other: "UNFORESEEN_ERROR" });
      return;
    }

    Cookies.set("accessToken", access, { httpOnly: true });
    Cookies.set("refreshToken", refresh, { httpOnly: true });

    onSignupSuccess();

    router.push("/");
  };

  const intl = useIntl();

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
        {intl.formatMessage({ id: "WELCOME_TO_PINIT" })}
      </h1>
      <div className={styles.subtitle}>
        {intl.formatMessage({ id: "FIND_NEW_IDEAS" })}
      </div>
      <form noValidate onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.emailInputContainer}>
          <LabelledTextInput
            name="email"
            labelMessageId={"EMAIL"}
            placeholderMessageId={"EMAIL"}
            type="email"
            value={formData.email}
            autoComplete="email"
            errorMessageId={showFormErrors ? formErrors.email : ""}
            onChange={handleInputChange}
            ref={emailInputRef}
          />
        </div>
        <div className={styles.passwordInputContainer}>
          <LabelledTextInput
            name="password"
            labelMessageId={"PASSWORD"}
            placeholderMessageId={"CREATE_PASSWORD"}
            type="password"
            value={formData.password}
            autoComplete="new-password"
            errorMessageId={showFormErrors ? formErrors.password : ""}
            onChange={handleInputChange}
            withPasswordShowIcon={true}
          />
        </div>
        <div className={styles.birthdateInputContainer}>
          <LabelledTextInput
            name="birthdate"
            labelMessageId={"BIRTHDATE"}
            type="date"
            value={formData.birthdate}
            autoComplete="bday"
            errorMessageId={showFormErrors ? formErrors.birthdate : ""}
            onChange={handleInputChange}
          />
        </div>
        {showFormErrors && formErrors.other && (
          <div className={styles.otherErrorMessage}>
            <div className={styles.otherErrorText}>
              {intl.formatMessage({ id: formErrors.other })}
            </div>
          </div>
        )}
        <button type="submit" className={styles.submitButton}>
          {intl.formatMessage({ id: "CONTINUE" })}
        </button>
      </form>
      <div className={styles.alreadyHaveAccount}>
        {intl.formatMessage({ id: "ALREADY_HAVE_ACCOUNT" })}
        <button
          className={styles.alreadyHaveAccountButton}
          onClick={onClickAlreadyHaveAccount}
        >
          {intl.formatMessage({ id: "LOG_IN" })}
        </button>
      </div>
    </div>
  );
};

export default SignupForm;
