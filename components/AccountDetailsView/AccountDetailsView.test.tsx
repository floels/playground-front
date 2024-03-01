import { render, screen } from "@testing-library/react";
import AccountDetailsView from "./AccountDetailsView";
import en from "@/messages/en.json";
import { getNextImageSrcRegexFromURL } from "@/lib/testing-utils/misc";

const accountDetailsWithoutBackgroundPictureURL = {
  displayName: "Brian Brown",
  username: "brian_brown",
  description: "Description for Brian Brown.",
  profilePictureURL: "https://profile.picture.url",
};

it("renders relevant details when provided", () => {
  render(
    <AccountDetailsView
      {...accountDetailsWithoutBackgroundPictureURL}
      backgroundPictureURL="https://background.picture.url"
    />,
  );

  screen.getByText(accountDetailsWithoutBackgroundPictureURL.displayName);
  screen.getByText(accountDetailsWithoutBackgroundPictureURL.username);
  screen.getByText(accountDetailsWithoutBackgroundPictureURL.description);

  const profilePicture = screen.getByAltText(
    `${en.AccountDetails.ALT_PROFILE_PICTURE_OF} Brian Brown`,
  ) as HTMLImageElement;
  const expectedPatternProfilePictureSrc = getNextImageSrcRegexFromURL(
    "https://profile.picture.url",
  );
  expect(profilePicture.src).toMatch(expectedPatternProfilePictureSrc);

  const backgroundPicture = screen.getByAltText(
    `${en.AccountDetails.ALT_BACKGROUND_PICTURE_OF} Brian Brown`,
  ) as HTMLImageElement;
  const expectedPatternBackgroundPictureSrc = getNextImageSrcRegexFromURL(
    "https://background.picture.url",
  );
  expect(backgroundPicture.src).toMatch(expectedPatternBackgroundPictureSrc);
});

it("does not display background picture when corresponding URL is not provided", () => {
  render(
    <AccountDetailsView
      {...accountDetailsWithoutBackgroundPictureURL}
      backgroundPictureURL={null}
    />,
  );

  expect(
    screen.queryByAltText(
      `${en.AccountDetails.ALT_BACKGROUND_PICTURE_OF} Brian Brown`,
    ),
  ).toBeNull();
});
