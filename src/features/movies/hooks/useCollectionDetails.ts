import { useQuery } from "@tanstack/react-query";
import { moviesApi } from "../api/moviesApi";

export const useCollectionDetails = (collectionId?: string | null) => {
  return useQuery({
    queryKey: ["collection-details", collectionId],
    queryFn: () => {
      if (!collectionId) {
        throw new Error("Collection id is required");
      }

      return moviesApi.getCollectionDetails(collectionId);
    },
    enabled: Boolean(collectionId),
  });
};
