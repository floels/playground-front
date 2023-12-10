import styles from "./TextAndExploreButton.module.css";

type TextAndExploreButtonProps = {
  labels: { [key: string]: string };
  colors: {
    primary: string;
    secondary: string;
  };
};

const TextAndExploreButton = ({
  labels,
  colors,
}: TextAndExploreButtonProps) => {
  return (
    <div
      className={styles.container}
      style={{ color: `var(${colors.primary})` }}
    >
      <div className={styles.header}>{labels.header}</div>
      <div className={styles.paragraph}>{labels.paragraph}</div>
      <button
        className={styles.link}
        style={{
          backgroundColor: `var(${colors.primary})`,
          color: `var(${colors.secondary})`,
        }}
        data-testid="explore-button"
      >
        {labels.link}
      </button>
    </div>
  );
};

export default TextAndExploreButton;
