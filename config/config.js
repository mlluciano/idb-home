import {WebStorageStateStore} from "oidc-client-ts";


const config = {
    environment: import.meta.env.VITE_APP_ENV,

    oidc_config: {
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

}

if (config.environment === 'production') {
    Object.assign(config, {
        api_url: "/api"
    })
}

else {
    Object.assign(config, {
        api_url: 'http://localhost:8989/',
    })
}

export default config;
