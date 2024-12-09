import React, {useEffect, useRef, useState} from 'react';
import {
    Form,
    TextArea,
    Header,
    Icon, Popup
} from 'semantic-ui-react';
import '../../css/chat.css'
import {streamMessages_OBOE} from '../../helpers/parsers'
import Artifact from "./Artifact.jsx";
import Messages from "./messages/Messages.jsx";
import Menu from "./menus/Menu.jsx"
import { useAuth } from "react-oidc-context";
import { Log } from 'oidc-client-ts';
import axios from "axios";
import config from '../../../config/config.js'
Log.setLogger(console);

const Chat = () => {
    const [messages, setMessages] = useState([])
    const [currentMessage, setCurrentMessage] = useState({type: '', value: ''});
    const [currentInput, setCurrentInput] = useState('')
    const [openChat, setOpenChat] = useState(false)
    const [maps, setMaps] = useState([])
    const [isVisible, setIsVisible] = useState(false);
    const [artifactOpen, setArtifactOpen] = useState(false);
    const [activeArtifactIndex, setActiveArtifactIndex] = useState()
    const [loading, setLoading] = useState()
    const auth = useAuth()
    const [conversations, setConversations] = useState([])
    const [newChatModalOpen, setNewChatModalOpen] = useState(false)
    const messagesEndRef = useRef(null);
    const [sidebarHidden, setSidebarHidden] = useState(false)
    const [currentConversation, setCurrentConversation] = useState('')

    const API_URL = config.api_url;
    axios.defaults.withCredentials = true;

    async function fetchConversations() {
        const response = await axios.post(`${API_URL}/conversations`, {}, {
            headers: {Authorization: `Bearer ${auth?.user?.access_token}`}
        })
        if (response) {
            return response.data
        }
    }

    const getConversations = async () => {
        if (auth?.user?.access_token) {
            try {
                const response = await fetchConversations();
                setConversations(response)
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        }
    }

    useEffect(() => {
        getConversations()
        return () => {

        }

    }, [auth])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const submit = (message) => {
        setLoading(true)
        streamMessages_OBOE(message, setMessages, setCurrentMessage, setLoading, auth, currentConversation)
    }

    const handleSubmit = () => {
        if (currentInput!== '' ) {
            if (!openChat) {
                setOpenChat(true)
            }

            const user_message = {
                type: "user_chat_message",
                value: currentInput
            }

            setCurrentInput('')
            setMessages(prevMessages => [...prevMessages, user_message]);
            submit(user_message)
        }
    }

    async function start_over() {
        const start_over = {
            type: "user_chat_message",
            value: ""
        }

        setCurrentConversation(crypto.randomUUID())
        setCurrentInput('')
        setMessages(prevMessages => []);
        submit(start_over)
    }

    useEffect(() => {
        document.title = "Chat";
        start_over()
    }, [])

    useEffect(() => {
        let m = []
        for (let i = 0; i < messages.length; i++) {
            if (messages[i].type === 'ai_map_message') {
                m.push({
                    rq: messages[i].value.rq,
                })
            }
        }
        if (m.length > 0) {
            setMaps(m)
        }
    }, [messages]);

    useEffect(() => {
        if (artifactOpen) {
            setSidebarHidden(artifactOpen)
        }
    }, [artifactOpen]);

    useEffect(() => {
        if (!sidebarHidden) {
            if (artifactOpen) {
                setArtifactOpen(false)
            }
        }
    }, [sidebarHidden])


    return (
        <div className='flex flex-col flex-1 w-full bg-zinc-800 min-h-screen overflow-hidden'>

            <div className='flex flex-0'>
                <img className='fixed top-0 left-0' src="src/assets/chat_logo.png" alt="iDigBio" border="0" id="logo"
                     style={{width: '75px', height: '75px'}}></img>
            </div>

            <div className='flex justify-end p-4 text-white'>
                {!auth.isAuthenticated
                    ?
                    <button onClick={() => void auth.signinRedirect()}>Log in</button>
                    :
                    <button onClick={() => {
                        void auth.removeUser()
                        void auth.signoutRedirect()
                    }}>Log out
                    </button>
                }
            </div>


            <div
                className={`flex flex-1 justify-center items-start gap-20 p-10 pt-20 pl-20 ${!sidebarHidden ? 'pl-[225px]' : 'pl-[75px]'} `}>
                <div className="flex flex-1 justify-center">
                {messages.length > 0
                        ? <Messages messages={messages} currentMessage={currentMessage}
                                    currentInput={currentInput} setCurrentInput={setCurrentInput}
                                    handleSubmit={handleSubmit}
                                    activeArtifactIndex={activeArtifactIndex}
                                    setActiveArtifactIndex={setActiveArtifactIndex}
                                    artifactOpen={artifactOpen} setArtifactOpen={setArtifactOpen}
                                    setIsVisible={setIsVisible} loading={loading} setLoading={setLoading} messagesEndRef={messagesEndRef}/>

                        : <Home currentInput={currentInput} setCurrentInput={setCurrentInput}
                                handleSubmit={handleSubmit} conversations={conversations} />
                    }
                </div>

                {artifactOpen &&
                    <div className={`relative flex flex-1 justify-end `}>
                        <Artifact messages={messages}
                                  artifactOpen={artifactOpen} setArtifactOpen={setArtifactOpen}
                                  isVisible={isVisible} setIsVisible={setIsVisible}
                                  activeArtifactIndex={activeArtifactIndex}
                                  setActiveArtifactIndex={setActiveArtifactIndex}/>
                    </div>
                }


            </div>

            {sidebarHidden  ?
                <Popup
                    trigger={
                        <button id='sui' className='fixed top-20 left-0 text-white ml-2' onClick={() => {
                            setSidebarHidden(false)
                        }}>
                            <Icon size='large' color='white' name={'chevron circle right'}/>
                        </button>
                    }
                    content={'Open sidebar'}
                    style={{
                        backgroundColor: 'black',
                        color: 'white',
                        padding: '5px',
                        marginTop: '5px',
                        fontSize: '12px'
                    }}
                    position="bottom right"
                />

                :
                <div className='flex flex-1 max-w-[70px]'>
                    <Sidebar className='relative' conversations={conversations} setMessages={setMessages}
                             sidebarHidden={sidebarHidden} setSidebarHidden={setSidebarHidden}
                             setLoading={setLoading} openChat={openChat} setOpenChat={setOpenChat}
                             setCurrentConversation={setCurrentConversation} clear={start_over} newChatModalOpen={newChatModalOpen} setNewChatModalOpen={setNewChatModalOpen}
                    />

                </div>
            }

        </div>

    )
}

export const NewTabLink = ({ href, children }) => {
    const isExternal = href.startsWith('http') || href.startsWith('https');
    return isExternal ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
        </a>
    ) : (
        <a href={href}>{children}</a>
    );
};

const Home = ({currentInput, setCurrentInput, handleSubmit}) => {
    const auth  = useAuth()

    useEffect(() => {
        if (auth.isLoading) {
            return;
        }

        // Check if we need to restore the session
        if (!auth.isAuthenticated && auth.error) {
            console.log("Authentication error:", auth.error);
            auth.signinSilent().catch(err => {
                console.log("Silent sign-in failed:", err);
                // Optionally redirect to login
                // auth.signinRedirect();
            });
        }
    }, [auth.isLoading]);

    return (
        <div id='sui' className='flex flex-col justify-center items-center w-full'>
            <div id='sui' className='flex w-1/2 justify-center max-w-screen-md'>
                <Form className='flex w-full'>
                    <TextArea
                        onKeyDown={(e) => {
                            if (e.keyCode === 13 && !e.shiftKey) {
                                e.preventDefault()
                                handleSubmit()
                            }
                        }}
                        value={currentInput}
                        onChange={(e) => {
                            setCurrentInput(e.target.value)
                        }}
                        placeholder='How can I help you today?'
                        className="flex text-white bg-zinc-700 border rounded-lg border-zinc-600 mt-5" rows={1}
                        style={{height: '100px'}}/>
                </Form>
            </div>
            <div className='mt-10 text-red-500'>This is a research prototype not yet ready for public use.</div>

        </div>
    )
}

const Sidebar = ({
                     conversations,
                     setSidebarHidden,
                     setMessages,
                     setLoading,
                     openChat,
                     setOpenChat,
                     setCurrentConversation,
                     clear,
                     newChatModalOpen,
                     setNewChatModalOpen
 }) => {
    const auth = useAuth()

    const menuItems = [
        { id: 1, label: 'Dashboard', icon: '📊' },
        { id: 2, label: 'Analytics', icon: '📈' },
        { id: 3, label: 'Customers', icon: '👥' },
        { id: 4, label: 'Orders', icon: '📦' },
        { id: 5, label: 'Products', icon: '🏷️' },
        { id: 6, label: 'Settings', icon: '⚙️' },
        { id: 7, label: 'Reports', icon: '📄' },
        { id: 8, label: 'Integrations', icon: '🔌' },
        { id: 9, label: 'Help Center', icon: '❓' },
        { id: 10, label: 'Documentation', icon: '📚' },
        { id: 11, label: 'API Keys', icon: '🔑' },
        { id: 12, label: 'Notifications', icon: '🔔' },
    ];

    async function selectChat (conversation_id){
        const API_URL = `${config.api_url}/get-conversation`;
        const response = await axios.post(`${API_URL}`, {conversation_id: conversation_id}, {
            headers: {"Authorization": `Bearer ${auth?.user?.access_token}`}
        })

        if (response) {
            return response.data
        }
    }

    const getChat = async (conversation_id) => {
        try {
            const response = await selectChat(conversation_id)
            setCurrentConversation(conversation_id)
            // setLoading(true)
            if (!openChat) {
                setOpenChat(true)
            }
            setMessages(response.history)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="fixed top-0 left-0 h-screen w-64 bg-black text-white shadow-lg">

            <div className="flex justify-between px-6 py-4 border-b border-gray-700">
                <button id="sui" onClick={() => {
                    setSidebarHidden(true)
                }}>
                    <Icon size='large' className='' name={'chevron circle left'}  />
                </button>

                <Menu
                    clear={clear}
                    setMessages={setMessages} setLoading={setLoading}
                    newChatModalOpen={newChatModalOpen} setNewChatModalOpen={setNewChatModalOpen}
                    openChat={openChat} setOpenChat={setOpenChat}
                />

            </div>

            {/* Scrollable Menu Section */}
            <div className="h-[calc(100vh-64px)] overflow-y-auto">
                <nav className="px-4 py-2">
                    {conversations?.history?.map((item, index) => (
                        <button
                            key={index}
                            className="w-full flex items-center gap-3 px-2 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-150 ease-in-out"
                            onClick={() => getChat(item.id)}
                        >

                            <span className="text-sm font-medium">{item.title}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};



export default Chat;
