import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import styles from "./SecondFold.module.css";
import TextAndLink from "./TextAndLink";

type SecondFoldProps = {
  labels: { [key: string]: any };
};

const SecondFold = ({ labels }: SecondFoldProps) => {
  const textAndLinkLabels = {
    header: labels.SEARCH_FOR_AN_IDEA,
    paragraph: labels.WHAT_DO_YOU_WANT_TO_TRY_NEXT,
    link: labels.EXPLORE,
  };

  const textAndLinkColors = {
    primary: "--color-purple-dark",
    secondary: "--color-yellow",
  };

  return (
    <div className={styles.container}>
      <div className={styles.picturesArea}>
        <div className={styles.picturesContainer}>
          <div className={styles.pictureLeftContainer}>
            <Image
              src="https://s.pinimg.com/webapp/left-511a9304.png"
              alt="chicken-plate"
              fill
              sizes="204px"
              className={styles.picture}
            />
          </div>
          <div className={styles.pictureTopRightContainer}>
            <Image
              src="https://s.pinimg.com/webapp/topRight-d0230035.png"
              alt="chicken-plate"
              fill
              sizes="178px"
              className={styles.picture}
            />
          </div>
          <div className={styles.pictureBottomRightContainer}>
            <Image
              src="https://s.pinimg.com/webapp/right-88044782.png"
              alt="chicken-plate"
              fill
              sizes="164px"
              className={styles.picture}
            />
          </div>
          <div className={styles.pictureCenterContainer}>
            <Image
              src="https://s.pinimg.com/webapp/center-77497603.png"
              alt="chicken-plate"
              fill
              sizes="298px"
              className={styles.picture}
            />
          </div>
          <a href="#" className={styles.searchBarLink}>
            <FontAwesomeIcon
              icon={faSearch}
              className={styles.searchBarLinkIcon}
            />
            {labels.EASY_CHICKEN_DINNER}
          </a>
        </div>
      </div>
      <div className={styles.textArea}>
        <TextAndLink
          labels={textAndLinkLabels}
          linkTarget="#"
          colors={textAndLinkColors}
        />
      </div>
    </div>
  );
};

export default SecondFold;