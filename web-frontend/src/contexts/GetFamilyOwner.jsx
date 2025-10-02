import { useQuery } from "@apollo/client/react"
import { GET_FAMILY_OWNER } from "../schema/queries"

export const useFamilyOwner = (familyId) => {
    const { data, loading, error } = useQuery(GET_FAMILY_OWNER, {
        variables: { familyId },
        skip: !familyId,
    })

    return {
        owner: data?.familyOwner?.id,
        loading,
        error,
    }
}