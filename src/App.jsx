import HeroSection from "./components/home/Hero.jsx";
import Stats from "./components/home/Stats.jsx";
import Footer from "./components/home/Footer.jsx";
import Chat from "./components/chat/Chat.jsx";
import './components/chat/leaflet.css'
import './components/chat/leaflet.draw.css'
import './components/chat/leaflet.draw.css.css'
import './components/chat/search.css'
// import './components/chat/idigbio.css'
// import './components/chat/idbmap.css'
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