import React from 'react';
import {useQuery} from "@tanstack/react-query";
import {apiClient} from "../../api/client.js";


const Search = () => {

    const {data: records, isLoadin, err} = useQuery({
        queryKey: ['records'],
        queryFn: () => apiClient.search(),
    })

    return (
        <div>Hello world</div>
    )

}

export default Search;

















