import HeroSection from "@/components/home/Hero.jsx";
import Stats from "@/components/home/Stats.jsx";
import Footer from "@/components/home/Footer.jsx";
import Chat from "@/components/chat/Chat.jsx";
import '@/css/leaflet.css'
import '@/css/leaflet.draw.css'
import '@/css/leaflet.draw.css.css'
import '@/css/search.css'

import {
    useQuery,
    useMutation,
    useQueryClient,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
const App = () => {
    const queryClient = new QueryClient()

    return (
        <div>
            <QueryClientProvider client={queryClient}>
                {/* <HeroSection />
                <Stats />
                <Footer /> */}
                <Chat />
            </QueryClientProvider>
        </div>
    )
}

export default App;
