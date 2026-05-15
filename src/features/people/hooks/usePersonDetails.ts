import { useQuery } from "@tanstack/react-query"
import type { PersonDetails } from "../types/person.types"
import { peopleApi } from "../api/peopleApi"


export const usePersonDetails = (id: string | undefined) => {
    return useQuery<PersonDetails>({
        queryKey: ["person-details", id],
        queryFn: () => {
            if (!id) {
                throw new Error("Не передан id актёра")
            }

            return peopleApi.getPresonDetails(id)
        },
        enabled: Boolean(id)
    })
}