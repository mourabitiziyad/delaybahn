// SearchDropdown.jsx
import React, { useEffect } from "react";
import { ScrollArea } from "./scroll-area";
import { cn } from "~/lib/utils";
import { Skeleton } from "./skeleton";
import { Stop } from "~/types/types";

export const SearchDropdown = ({
  showResults,
  setSearchVisibility,
  isLoading,
  isError,
  errorMessage,
  searchResults,
  onResultSelect,
}:
  Readonly<{
    showResults: boolean;
    setSearchVisibility: (value: boolean) => void;
    isLoading: boolean;
    isError: boolean;
    errorMessage: string | undefined;
    searchResults: Stop[] | undefined;
    onResultSelect: (result: Stop) => void;
  }>
) => {
  // Hide results when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".search-dropdown")) {
        setSearchVisibility(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setSearchVisibility]);

  return (
    <div className="relative space-y-2">
      {showResults && (
        <div className="search-dropdown absolute z-10 rounded-md pt-2 shadow-lg bg-white">
          <ScrollArea className="h-32 min-w-full">
            {isError && <div>Error: {errorMessage}</div>}
            {isLoading && (
              <div className="">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className={cn(`w-48`, "relative block h-8 cursor-default select-none rounded-sm mx-2 my-1.5")}
                  />
                ))}

              </div>
            )}
            {searchResults && (
              <div>
                {searchResults.map((result: Stop, index: number) => (
                  <div
                    key={index}
                    onClick={() => onResultSelect(result)}
                    className="relative pl-2 flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <button>{result.name}</button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
