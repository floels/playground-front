import { useState, useEffect } from "react";
import PictureSlider from "./PictureSlider";
import styles from "./HomePageContentNotLoggedIn.module.css";

const ANCHORS = ["top", "search"];

const HomePageContentNotLoggedIn = () => {
  const [currentScrollPosition, setCurrentScrollPosition] = useState(0);
  const [currentAnchor, setCurrentAnchor] = useState(0);

  const handleScroll = () => {
    const newScrollPosition = window.scrollY;
    let newAnchor = currentAnchor;

    if (
      newScrollPosition > currentScrollPosition &&
      currentAnchor !== ANCHORS.length - 1
    ) {
      newAnchor = currentAnchor + 1;
    } else if (newScrollPosition < currentScrollPosition && currentAnchor > 0) {
      newAnchor = currentAnchor - 1;
    }

    setCurrentScrollPosition(newScrollPosition);

    if (newAnchor !== currentAnchor) {
      setCurrentAnchor(newAnchor);

      let offsetNewAnchor;

      if (newAnchor === 0) {
        offsetNewAnchor = 0;
      } else {
        offsetNewAnchor = (
          document.querySelector(`#${ANCHORS[newAnchor]}`) as HTMLElement
        ).offsetTop;
      }

      document.removeEventListener("scroll", handleScroll);
      window.scrollTo({
        top: offsetNewAnchor,
        behavior: "smooth",
      });
      document.addEventListener("scroll", handleScroll);
    }
  };

  useEffect(() => {
    document.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  });

  return (
    <div>
      <div className={styles.hero}>
        <PictureSlider />
      </div>
      <div className={styles.section} id="search"></div>
    </div>
  );
};

export default HomePageContentNotLoggedIn;
