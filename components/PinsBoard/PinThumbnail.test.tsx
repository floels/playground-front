import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect"; // required to use `expect(element).toHaveAttribute(...)`
import en from "@/messages/en.json";
import PinThumbnail from "./PinThumbnail";
import { getNextImageSrcRegexFromURL } from "@/lib/utils/testing";

it("should render image, title and author details when author details are provided", async () => {
  const pin = {
    id: "999999999999999999",
    title: "Pin title",
    imageURL: "https://pin.url",
    authorUsername: "john.doe",
    authorDisplayName: "John Doe",
    authorProfilePictureURL: "https://profile.picture.url",
    description: "Pin description",
  };

  render(<PinThumbnail pin={pin} />);

  const pinImage = screen.getByAltText("Pin title");
  expect(pinImage).toHaveAttribute("src", "https://pin.url");

  screen.getByText(pin.title);

  screen.getByTestId("pin-author-details");

  const authorProfilePicture = screen.getByAltText(
    "Profile picture of John Doe",
  ) as HTMLImageElement;
  const expectedPatternAuthorProfilePictureSrc = getNextImageSrcRegexFromURL(
    "https://profile.picture.url",
  );
  expect(authorProfilePicture.src).toMatch(
    expectedPatternAuthorProfilePictureSrc,
  );

  screen.getByText(pin.authorDisplayName);
});

it("should not render author details when author's profile picture URL is not provided", async () => {
  const pin = {
    id: "999999999999999999",
    title: "Pin title",
    imageURL: "https://pin.url",
    authorUsername: "john.doe",
    authorDisplayName: "John Doe",
    description: "Pin description",
  };

  render(<PinThumbnail pin={pin} />);

  expect(screen.queryByTestId("pin-author-details")).toBeNull();
});

it("should not render author details when author's display name is not provided", async () => {
  const pin = {
    id: "999999999999999999",
    title: "Pin title",
    imageURL: "https://pin.url",
    authorUsername: "john.doe",
    authorProfilePictureURL: "https://profile.picture.url",
    description: "Pin description",
  };

  render(<PinThumbnail pin={pin} />);

  expect(screen.queryByTestId("pin-author-details")).toBeNull();
});
