import { useState, useRef, useEffect, useContext } from "react";
import { Dispatch } from "react";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import GlobalStateContext from "@/app/globalState";
import AccountOptionsFlyout from "./AccountOptionsFlyout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faSearch } from "@fortawesome/free-solid-svg-icons";
import styles from "./HeaderAuthenticated.module.css";
import { API_BASE_URL, ENDPOINT_USER_DETAILS } from "@/lib/constants";

const fetchUserDetails = async () => {
  const accessToken = Cookies.get("accessToken");
  
  const response = await fetch(
    `${API_BASE_URL}/${ENDPOINT_USER_DETAILS}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      }
    }
  );

  if (!response.ok) {
    // TODO: display error
    console.warn("Response of /user-details is not OK!")
    return;
  }

  return response.json();
};

const HeaderAuthenticated = () => {
  const t = useTranslations("HomePageAuthenticated");

  const currentPathname = usePathname();

  const createFlyoutRef = useRef<HTMLDivElement>(null);
  const createButtonRef = useRef<HTMLDivElement>(null);

  const accountOptionsFlyoutRef = useRef<HTMLDivElement>(null);
  const accountOptionsButtonRef = useRef<HTMLDivElement>(null);

  const { dispatch } = useContext(GlobalStateContext);

  // const userDetails = await fetchUserDetails();

  const [isCreateFlyoutOpen, setIsCreateFlyoutOpen] = useState(false);
  const [isAccountOptionsFlyoutOpen, setIsAccountOptionsFlyoutOpen] =
    useState(false);
  const [isSearchBarFocused, setIsSearchBarFocused] = useState(false);

  const handleClickCreateButton = () => {
    setIsCreateFlyoutOpen(!isCreateFlyoutOpen);
  };

  const handleFocusSearchBarInput = () => {
    setIsSearchBarFocused(true);
  };

  const handleBlurSearchBarInput = () => {
    setIsSearchBarFocused(false);
  };

  const handleClickAccountOptionsButton = () => {
    setIsAccountOptionsFlyoutOpen(!isAccountOptionsFlyoutOpen);
  };

  const handleClickDocument = (event: MouseEvent) => {
    const target = event.target as Node;

    if (
      isCreateFlyoutOpen &&
      createFlyoutRef.current &&
      !createFlyoutRef.current.contains(target) &&
      createButtonRef.current &&
      !createButtonRef.current.contains(target)
      // NB: we don't do anything if the user clicks on the account options button
      // as this click is managed by the `handleClickCreateButton` function above
    ) {
      setIsCreateFlyoutOpen(false);
    }

    if (
      isAccountOptionsFlyoutOpen &&
      accountOptionsFlyoutRef.current &&
      !accountOptionsFlyoutRef.current.contains(target) &&
      accountOptionsButtonRef.current &&
      !accountOptionsButtonRef.current.contains(target)
    ) {
      setIsAccountOptionsFlyoutOpen(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      if (isCreateFlyoutOpen) {
        setIsCreateFlyoutOpen(false);
      }
      if (isAccountOptionsFlyoutOpen) {
        setIsAccountOptionsFlyoutOpen(false);
      }
    }
  };

  const handleClickLogOut = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");

    dispatch({ type: "SET_IS_AUTHENTICATED", payload: false });
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickDocument);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickDocument);
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  return (
    <nav className={styles.container}>
      <div className={styles.headerItemsContainer}>
        <Link href="/" className={styles.logoContainer}>
          <Image
            src="/images/logo.svg"
            alt="PinIt logo"
            width={24}
            height={24}
          />
        </Link>
        <Link
          href="/"
          className={`${styles.navigationItem} ${
            currentPathname === "/" ? styles.active : ""
          }`}
        >
          {t("NAV_ITEM_HOME")}
        </Link>
        <div
          className={`
            ${styles.navigationItem}
            ${styles.navigationItemCreate}
            ${currentPathname === "/pin-builder" ? styles.active : ""}
          `}
          ref={createButtonRef}
          onClick={handleClickCreateButton}
        >
          {t("CREATE")}
          <FontAwesomeIcon
            icon={faAngleDown}
            className={styles.createButtonIcon}
          />
        </div>
        {isCreateFlyoutOpen && (
          <div className={styles.createFlyout} ref={createFlyoutRef}>
            <Link href="/pin-builder" className={styles.createFlyoutItem}>
              {t("CREATE_PIN")}
            </Link>
          </div>
        )}
        <div
          className={`${styles.searchBarContainer}
          ${isSearchBarFocused ? styles.searchBarContainerActive : ""} 
        `}
        >
          {!isSearchBarFocused && (
            <FontAwesomeIcon icon={faSearch} className={styles.searchBarIcon} />
          )}
          <input
            type="text"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className={styles.searchBarInput}
            placeholder={t("PLACEHOLDER_SEARCH")}
            onFocus={handleFocusSearchBarInput}
            onBlur={handleBlurSearchBarInput}
          />
        </div>
        <Link href="/florianellis/" className={styles.profileLink}>
          <div className={styles.profileLinkBadge}>
            F
          </div>
        </Link>
        <button
          className={styles.accountOptionsButton}
          onClick={handleClickAccountOptionsButton}
        >
          <FontAwesomeIcon icon={faAngleDown} />
        </button>
      </div>
      {isAccountOptionsFlyoutOpen && (
        <AccountOptionsFlyout
          ref={accountOptionsFlyoutRef}
          handleClickLogOut={handleClickLogOut}
        />
      )}
    </nav>
  );
};

export default HeaderAuthenticated;
