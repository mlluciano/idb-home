import {WebStorageStateStore} from "oidc-client-ts";


const config = {
    environment: import.meta.env.VITE_APP_ENV,

    oidc_config: {
        authority: 'http://auth.acis.ufl.edu/realms/iDigBio/',
        client_id: 'chat',
        redirect_uri: 'http://localhost:5173/*',
        post_logout_redirect_uri: 'http://localhost:5173/*',
        skipSigninCallback: false,
        disablePKCE: false,
        automaticSilentRenew: true,
        scope: 'openid profile email',
        userStore: new WebStorageStateStore({"prefix": 'KC.', "store": window.localStorage}),
        loadUserInfo: true,
        monitorSession: true,
    },

}

if (config.environment === 'development') {
    Object.assign(config, {
        api_url: 'http://localhost:8989',
    })
}

else if (config.environment === 'production') {
    Object.assign(config, {
        api_url: 'https://chat.acis.ufl.edu'
    })
}




export default config;
