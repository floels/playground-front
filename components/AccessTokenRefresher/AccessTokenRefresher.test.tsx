import { render, waitFor, screen, act } from "@testing-library/react";
import AccessTokenRefresher from "./AccessTokenRefresher";
import en from "@/messages/en.json";
import { API_ROUTE_LOG_OUT, API_ROUTE_REFRESH_TOKEN } from "@/lib/constants";

const mockRouterRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: mockRouterRefresh,
  }),
  usePathname: jest.fn(),
}));

afterEach(() => {
  jest.resetAllMocks();
});

it("should refresh the current route when receiving OK response from token refresh endpoint", async () => {
  fetchMock.doMockOnceIf(
    API_ROUTE_REFRESH_TOKEN,
    JSON.stringify({ access_token: "refreshedAccessToken" }),
  );

  render(<AccessTokenRefresher />);

  await waitFor(() => expect(mockRouterRefresh).toHaveBeenCalledTimes(1));
});

it("should call logout endpoint and refresh page when receiving KO response from token refresh endpoint", async () => {
  fetchMock.doMockOnceIf(
    API_ROUTE_REFRESH_TOKEN,
    JSON.stringify({ errors: [{ code: "invalid_refresh_token" }] }),
    { status: 401 },
  );

  render(<AccessTokenRefresher />);

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(API_ROUTE_LOG_OUT, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    expect(mockRouterRefresh).toHaveBeenCalledTimes(1);
  });
});

it("should render landing homepage when fetch fails", async () => {
  fetchMock.mockReject(new Error("Network failure"));

  // Since there is asynchronous behavior in the `useEffect` hook of <AccessTokenRefresher />, we need to wrap the `render()` in an `act()`.
  // Otherwise, the test fails.
  await act(async () => {
    render(<AccessTokenRefresher />);
  });

  screen.getByText(en.LandingPageContent.PictureSlider.GET_YOUR_NEXT);
});