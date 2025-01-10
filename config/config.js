import {WebStorageStateStore} from "oidc-client-ts";

const env = import.meta.env.VITE_APP_ENV ? import.meta.env.VITE_APP_ENV : "development";

const OIDC_CONFIGS = {
    production: {
        authority: 'https://auth.acis.ufl.edu/realms/iDigBio/',
        client_id: 'chat',
        redirect_uri: 'https://chat.acis.ufl.edu/',
        post_logout_redirect_uri: 'https://chat.acis.ufl.edu/',
        skipSigninCallback: false,
        disablePKCE: false,
        automaticSilentRenew: true,
        scope: 'openid profile email',
        userStore: new WebStorageStateStore({"prefix": 'KC.', "store": window.localStorage}),
        loadUserInfo: true,
        monitorSession: true,
    },
    development: {
        authority: 'https://auth.acis.ufl.edu/realms/iDigBio/',
        client_id: 'chat-dev',
        redirect_uri: 'http://localhost:5173/',
        post_logout_redirect_uri: 'http://localhost:5173/',
        skipSigninCallback: false,
        disablePKCE: false,
        automaticSilentRenew: true,
        scope: 'openid profile email',
        userStore: new WebStorageStateStore({"prefix": 'KC-dev.', "store": window.localStorage}),
        loadUserInfo: true,
        monitorSession: true,
    }
}

const API_URLS = {
    production: '/api',
    development: 'http://localhost:8989',
}

const config = {
    environment: env,
    oidc_config: OIDC_CONFIGS[env],
    api_url: API_URLS[env],
}


export default config;
