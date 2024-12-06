import HeroSection from "@/components/home/Hero.jsx";
import Stats from "@/components/home/Stats.jsx";
import Footer from "@/components/home/Footer.jsx";
import Chat from "@/components/chat/Chat.jsx";
import '@/css/leaflet.css'
import '@/css/leaflet.draw.css'
import '@/css/leaflet.draw.css.css'
import '@/css/search.css'
import {AuthProvider, useAuth} from "react-oidc-context";
import axios from 'axios';
import { useState } from 'react';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import config from "../config/config.js"
import {WebStorageStateStore} from "oidc-client-ts";

const App = () => {
    const queryClient = new QueryClient()
    const [user, setUser] = useState(null)
    const auth = useAuth()
    const API_URL = `${config.api_url}/api`;
    axios.defaults.withCredentials = true;
    console.log(auth?.isAuthenticated)

    const signInCallback = async () => {
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
         )
    }

    const removeUserCallback = async () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            console.log(urlParams)
            const response = await axios.post(`${API_URL}/logout`);
            console.log(response.data)
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    const oidcConfig = Object.assign({
        onSigninCallback: signInCallback,
        onRemoveUser: removeUserCallback,
    }, config.oidc_config)

    return (
        <AuthProvider {...oidcConfig}>
            <div>
                <QueryClientProvider client={queryClient}>
                    <Chat />
                </QueryClientProvider>
            </div>
        </AuthProvider>
    )
}

export default App;
