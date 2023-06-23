import { EMAIL_ADDRESS, PASSWORD } from "../../fixtures/authentication";
import { API_BASE_URL } from "../../../lib/constants";
import en from "../../../messages/en.json";

describe("Signup", () => {
  beforeEach(() => {
    cy.clearCookies();
  });

  it("should be able to sign up", () => {
    // Configure mock API response
    cy.request({
      method: "POST",
      url: `${API_BASE_URL}/signup/configure`,
      body: {
        mockStatusCode: 200,
        mockBody: {
          access_token: "mock_access_token",
          refresh_token: "mock_refresh_token",
        },
      },
    });

    cy.visit("/");
    cy.wait(5000); // needed to guarantee page has become interactive

    cy.contains(en.HomePageUnauthenticated.Header.SIGN_UP).click();

    cy.get("input[name='email']").type(EMAIL_ADDRESS);
    cy.get("input[name='password']").type(PASSWORD);
    cy.get("input[name='birthdate']").type("1970-01-01");

    cy.contains(en.HomePageUnauthenticated.Header.SignupForm.CONTINUE).click();

    cy.contains(en.HomePageAuthenticated.Header.NAV_ITEM_HOME);

    // Check presence of authentication cookies:
    cy.getCookie("accessToken").should("exist");
    cy.getCookie("refreshToken").should("exist");
  });
});
