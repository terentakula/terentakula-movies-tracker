import { tmdbClient } from "../../../shared/api/tmdbClient";
import type { PersonDetails } from "../types/person.types";

const PERSON_APPEND_TO_RESPONSE = "combined_credits,external_ids,images";

export const peopleApi = {
  getPresonDetails: async (id: string) => {
    const response = await tmdbClient.get<PersonDetails>(`/person/${id}`, {
      params: {
        append_to_response: PERSON_APPEND_TO_RESPONSE,
      },
    });

    return response.data;
  },
};
