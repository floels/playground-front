import { test, expect } from "@playwright/test";
import { Request, Response, Express } from "express";
import { Server } from "http";
import en from "@/messages/en.json";
import { PORT_MOCK_API_SERVER, getExpressApp } from "@/e2e-tests/utils";

const EMAIL_FIXTURE = "john.doe@example.com";
const PASSWORD_FIXTURE = "Pa$$w0rd";

const NUMBER_PIN_SUGGESTIONS = 100;

let mockAPIApp: Express;
let mockAPIServer: Server;

const configureAPIResponses = () => {
  mockAPIApp.post("/api/token/obtain/", (_, response: Response) => {
    response.json({
      access_token: "mock_access_token",
      refresh_token: "mock_refresh_token",
    });
  });

  mockAPIApp.get("/api/accounts/", (_, response: Response) => {
    response.json({
      results: [
        {
          type: "personal",
          username: "johndoe",
          display_name: "John Doe",
          initial: "J",
          owner_email: "john.doe@example.com",
        },
      ],
    });
  });

  mockAPIApp.get(
    "/api/pin-suggestions/",
    (request: Request, response: Response) => {
      if (request.query.page) {
        response.status(404).send();
      } else {
        response.json({
          results: Array.from(
            { length: NUMBER_PIN_SUGGESTIONS },
            (_, index) => ({
              id: index + 1,
              image_url: "https://some.url",
              title: "",
              description: "",
              author: {
                username: "johndoe",
                display_name: "John Doe",
              },
            }),
          ),
        });
      }
    },
  );
};

const launchMockAPIServer = () => {
  return new Promise<void>((resolve) => {
    mockAPIApp = getExpressApp();

    configureAPIResponses();

    mockAPIServer = mockAPIApp.listen(PORT_MOCK_API_SERVER, resolve);
  });
};

test("User should be able to log in and then log out", async ({ page }) => {
  await launchMockAPIServer();

  // Visit home page and log in
  await page.goto("/");

  await page.click(`text=${en.LandingPage.Header.LOG_IN}`);

  await page.fill("input[name='email']", EMAIL_FIXTURE);
  await page.fill("input[name='password']", PASSWORD_FIXTURE);

  await page.click(`text=${en.LandingPage.Header.LoginForm.LOG_IN}`);

  // We should land on authenticated homepage
  await page.waitForSelector(`text=${en.HomePage.Header.NAV_ITEM_HOME}`);

  // Check that all pin suggestions received from the API are displayed
  await page.waitForSelector('[data-testid="pin-suggestion"]');
  const pinSuggestions = await page.$$('[data-testid="pin-suggestion"]');
  expect(pinSuggestions.length).toBe(NUMBER_PIN_SUGGESTIONS);

  // Log out
  await page.click('[data-testid="account-options-button"]');
  await page.click(`text=${en.HomePage.Header.AccountOptionsFlyout.LOG_OUT}`);

  // We should land back on landing page
  await page.waitForSelector(`text=${en.LandingPage.Header.LOG_IN}`);

  // If we visit the base route again, we should still land on the landing page
  await page.goto("/");

  await page.waitForSelector(`text=${en.LandingPage.Header.LOG_IN}`);

  // Close mock API server
  mockAPIServer.close();
});
