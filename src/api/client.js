// api/client.js

const getHost = () => {
    if (typeof window !== 'undefined' && window.idbapi?.host) {
        return window.idbapi.host;
    } else if (import.meta.env.VITE_ENV === "beta") {
        return 'https://beta-search.idigbio.org/v2/';
    } else {
        return 'https://search.idigbio.org/v2/';
    }
};

const getMediaHost = () => {
    if (typeof window !== 'undefined' && window.idbapi?.media_host) {
        return window.idbapi.media_host;
    } else if (import.meta.env.VITE_ENV === "beta") {
        return 'https://api.idigbio.org/';
    } else {
        return 'https://api.idigbio.org/';
    }
};

const HOST = getHost();
const MEDIA_HOST = getMediaHost();

const apiRequest = async (method, endpoint, data = null) => {
    const url = `${HOST}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`API call failed: ${endpoint}`);
    }
    return response.json();
};



export const apiClient = {
    search: (query) => apiRequest('POST', 'search/records/', query),
    media: (query) => apiRequest('POST', 'search/media/', query),
    publishers: (query) => apiRequest('POST', 'search/publishers/', query),
    recordsets: (query) => apiRequest('POST', 'search/recordsets/', query),
    createMap: (query) => apiRequest('POST', 'mapping/', query),
    mapping: (path) => apiRequest('GET', `mapping/${path}`),
    view: (type, uuid) => apiRequest('GET', `view/${type}/${uuid}`),
    summary: (type, query) => apiRequest('POST', `summary/${type}`, query),
    countRecords: (query) => apiRequest('POST', 'summary/count/records/', query),
};