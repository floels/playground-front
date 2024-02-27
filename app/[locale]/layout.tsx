// https://fontawesome.com/v5/docs/web/use-with/react#next-js
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

// https://next-intl-docs.vercel.app/docs/next-13/server-components#applocalelayouttsx
import { notFound } from "next/navigation";

// See https://next-intl-docs.vercel.app/docs/environments/server-client-components#option-4-providing-all-messages
import { NextIntlClientProvider, useMessages } from "next-intl";

// https://fkhadra.github.io/react-toastify/installation#the-gist
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import { cookies } from "next/headers";

import "@/styles/globals.css";

import HeaderAuthenticatedContainer from "@/components/Header/HeaderAuthenticatedContainer";
import HeaderUnauthenticated from "@/components/Header/HeaderUnauthenticated";
import AccessTokenRefresher from "@/components/AccessTokenRefresher/AccessTokenRefresher";
import { ACCESS_TOKEN_COOKIE_KEY } from "@/lib/constants";
import QueryClientProvider from "@/components/QueryClientProvider/QueryClientProvider";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export const metadata = {
  title: "PinIt",
  description: "Welcome to PinIt!",
  icons: {
    icon: "/images/favicon.ico",
  },
};

const locales = ["en"];

const Layout = ({ children, params: { locale } }: Props) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Receive messages provided in `i18n.ts`
  const messages = useMessages();

  const accessTokenCookie = cookies().get(ACCESS_TOKEN_COOKIE_KEY);

  const isAuthenticated = !!accessTokenCookie;

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ToastContainer position="bottom-left" autoClose={5000} />
          <QueryClientProvider>
            {isAuthenticated && <AccessTokenRefresher />}
            {isAuthenticated ? (
              <HeaderAuthenticatedContainer />
            ) : (
              <HeaderUnauthenticated />
            )}
            {children}
          </QueryClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default Layout;
