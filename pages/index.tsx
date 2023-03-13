import Head from "next/head";
import { API_BASE_URL, TOKEN_REFRESH_ENDPOINT } from "@/lib/constants";
import { GetServerSidePropsContext } from "next";
import { FormattedMessage } from "react-intl";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const accessToken = context.req.cookies.accessToken;

  const responseRedirect = {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };

  if (!accessToken) {
    return responseRedirect;
  }

  // Make a call to the API
  // TODO: for now we only try to refresh the JWT token, but that's not the final use case
  const refreshToken = context.req.cookies.refreshToken;

  const responseRefreshToken = await fetch(
    `${API_BASE_URL}/${TOKEN_REFRESH_ENDPOINT}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    }
  );

  if (!responseRefreshToken.ok) {
    return responseRedirect;
  }

  const dataRefreshToken = await responseRefreshToken.json();

  return {
    props: {
      accessToken: dataRefreshToken.access,
    },
  };
};

export default function Home() {
  return (
    <>
      <Head>
        <title>Pint</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div>
          <FormattedMessage
            id="homeWelcome"
            defaultMessage="Welcome to Pint!"
          />
        </div>
      </main>
    </>
  );
}
