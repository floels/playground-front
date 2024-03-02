"use client";

import { useState, useEffect } from "react";
import { appendQueryParam } from "@/lib/utils/strings";
import PinsBoard from "./PinsBoard";
import { PinWithAuthorDetails } from "@/lib/types";
import { serializePinsWithAuthorDetails } from "@/lib/utils/serializers";
import { ResponseKOError } from "@/lib/customErrors";

type PinsBoardContainerProps = {
  initialPins: PinWithAuthorDetails[];
  fetchPinsAPIRoute: string;
  emptyResultsMessageKey?: string;
};

const PinsBoardContainer = ({
  initialPins,
  fetchPinsAPIRoute,
  emptyResultsMessageKey,
}: PinsBoardContainerProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pins, setPins] = useState<PinWithAuthorDetails[]>(initialPins);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);

  const fetchNextPinsAndFallBack = async () => {
    let newPins: PinWithAuthorDetails[];

    try {
      newPins = await fetchNextPins();
    } catch {
      setFetchFailed(true);
      return;
    } finally {
      setIsFetching(false);
    }

    setPins((currentPins) => [...currentPins, ...newPins]);
    setFetchFailed(false);
  };

  const fetchNextPins = async () => {
    const url = getEndpointURL();

    const response = await fetch(url);

    if (!response.ok) {
      throw new ResponseKOError();
    }

    const responseData = await response.json();

    return serializePinsWithAuthorDetails(responseData.results);
  };

  const getEndpointURL = () => {
    return appendQueryParam({
      url: fetchPinsAPIRoute,
      key: "page",
      value: currentPage.toString(),
    });
  };

  const handleScrolledToBottom = () => {
    if (!isFetching) {
      setIsFetching(true);
      setFetchFailed(false);
      setCurrentPage((previousPage) => previousPage + 1); // will trigger the fetch of next pins, via the 'useEffect' below
    }
  };

  // 'initialPins' will change if user searches for another term:
  useEffect(() => {
    setPins([...initialPins]);
  }, [initialPins]);

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
