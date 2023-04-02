import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupForm from "./SignupForm";
import en from "../../lang/en.json";

jest.mock("next/router", () => require("next-router-mock"));

const setIsLoading = jest.fn();
const onSignupSuccess = jest.fn();
const onClickAlreadyHaveAccount = () => {}; // this behavior will be tested in <HomePageUnauthenticated />

const signupForm = (
  <SignupForm
    setIsLoading={setIsLoading}
    onSignupSuccess={onSignupSuccess}
    onClickAlreadyHaveAccount={onClickAlreadyHaveAccount}
  />
);

describe("SignupForm", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    setIsLoading.mockClear();
    onSignupSuccess.mockClear();
  });

  it("should display relevant input errors and should send request only when inputs are valid", async () => {
    const user = userEvent.setup();

    fetchMock.mockResponseOnce(
      JSON.stringify({ access: "access", refresh: "refresh" })
    );

    render(signupForm);

    screen.getByText(en.FIND_NEW_IDEAS);

    const emailInput = screen.getByLabelText(en.EMAIL);
    const passwordInput = screen.getByLabelText(en.PASSWORD);
    const birthdateInput = screen.getByLabelText(en.BIRTHDATE);
    const submitButton = screen.getByText(en.CONTINUE);

    // Fill form with invalid email, invalid pasword and missing birthdate and submit:
    await user.type(emailInput, "test@example");
    await user.type(passwordInput, "Pa$$");
    await user.click(submitButton);

    screen.getByText(en.INVALID_EMAIL_INPUT);

    // Fix email input but not password input or birthdate:
    await user.type(emailInput, ".com");
    await user.click(submitButton);

    expect(screen.queryByText(en.INVALID_EMAIL_INPUT)).toBeNull();
    screen.getByText(en.INVALID_PASSWORD_INPUT);

    // Fix password input but not birthdate:
    await user.type(passwordInput, "w0rd");
    expect(screen.queryByText(en.INVALID_PASSWORD_INPUT)).toBeNull();
    screen.getByText(en.INVALID_BIRTHDATE_INPUT);

    // Fix birthdate ipnut:
    await user.type(birthdateInput, "1970-01-01");
    expect(screen.queryByText(en.INVALID_BIRTHDATE_INPUT)).toBeNull();

    // Submit with correct inputs:
    expect(setIsLoading).toHaveBeenCalledTimes(0);
    await user.click(submitButton);
    expect(setIsLoading).toHaveBeenCalledWith(true);
    expect(onSignupSuccess).toHaveBeenCalledTimes(1);
  });

  it("should display relevant error when receiving a 400 response", async () => {
    const user = userEvent.setup();

    render(signupForm);

    const emailInput = screen.getByLabelText(en.EMAIL);
    const passwordInput = screen.getByLabelText(en.PASSWORD);
    const birthdateInput = screen.getByLabelText(en.BIRTHDATE);
    const submitButton = screen.getByText(en.CONTINUE);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Pa$$w0rd");
    await user.type(birthdateInput, "1970-01-01");

    fetchMock.mockResponseOnce(
      JSON.stringify({ errors: [{ code: "invalid_email" }] }),
      { status: 400 }
    );
    await user.click(submitButton);

    screen.getByText(en.INVALID_EMAIL_SIGNUP);
    expect(onSignupSuccess).toHaveBeenCalledTimes(0);

    fetchMock.mockResponseOnce(
      JSON.stringify({ errors: [{ code: "invalid_password" }] }),
      { status: 400 }
    );
    await user.type(passwordInput, "IsWr0ng");
    await user.click(submitButton);

    screen.getByText(en.INVALID_PASSWORD_SIGNUP);
    expect(onSignupSuccess).toHaveBeenCalledTimes(0);

    fetchMock.mockResponseOnce(
      JSON.stringify({ errors: [{ code: "invalid_birthdate" }] }),
      { status: 400 }
    );
    await user.type(passwordInput, "IsNowRight");
    await user.click(submitButton);

    screen.getByText(en.INVALID_BIRTHDATE_SIGNUP);
    expect(onSignupSuccess).toHaveBeenCalledTimes(0);
  });
});