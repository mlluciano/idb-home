import {useQuery} from "@tanstack/react-query";
import {apiClient} from "../api/client.js";


export const useSummary = (endpoint) => {

    return useQuery({
        queryKey: ['summary'],
        queryFn: () => apiClient.summary(endpoint),
        onError: (error) => {
            console.log(error)
        }
    })

}









