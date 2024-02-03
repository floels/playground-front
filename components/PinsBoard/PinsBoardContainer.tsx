"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { appendQueryParam } from "@/lib/utils/strings";
import PinsBoard from "./PinsBoard";
import { PinType } from "@/lib/types";
import { getPinsWithCamelCaseKeys } from "@/lib/utils/adapters";

type PinsBoardContainerProps = {
  initialPins: PinType[];
  fetchPinsAPIRoute: string;
  emptyResultsMessageKey?: string;
};

const PinsBoardContainer = ({
  initialPins,
  fetchPinsAPIRoute,
  emptyResultsMessageKey,
}: PinsBoardContainerProps) => {
  const t = useTranslations("Common");

  const [currentPage, setCurrentPage] = useState(1);
  const [pins, setPins] = useState<PinType[]>(initialPins);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);

  const fetchNextPins = async () => {
    const url = appendQueryParam({
      url: fetchPinsAPIRoute,
      key: "page",
      value: currentPage.toString(),
    });

    const nextPinsResponse = await fetch(url);

    return nextPinsResponse;
  };

  const fetchNextPinsAndFallBack = async () => {
    let response;

    try {
      response = await fetchNextPins();
    } catch {
      toast.warn(t("CONNECTION_ERROR"), {
        toastId: "toast-pins-board-connection-error",
      });
      return;
    }

    if (!response.ok) {
      setIsFetching(false);
      setFetchFailed(true);
      return;
    }

    const nextPinsResponseData = await response.json();
    const newPins = getPinsWithCamelCaseKeys(nextPinsResponseData.results);
    setPins((currentPins) => [...currentPins, ...newPins]);

    setFetchFailed(false);
    setIsFetching(false);
  };

  const handleScrolledToBottom = () => {
    if (!isFetching) {
      setIsFetching(true);
      setFetchFailed(false);
      setCurrentPage((previousPage) => previousPage + 1); // will trigger the fetch of next pins, via the 'useEffect' below
    }
  };

  useEffect(() => {
    if (currentPage > 1) {
      fetchNextPinsAndFallBack();
    }
  }, [currentPage]);

  return (
    <PinsBoard
      pins={pins}
      isFetching={isFetching}
      fetchFailed={fetchFailed}
      emptyResultsMessageKey={emptyResultsMessageKey}
      onScrolledToBottom={handleScrolledToBottom}
    />
  );
};

export default PinsBoardContainer;
