import React, {useEffect, useRef, useState} from 'react';
import {
    Form,
    TextArea,
    Header,
    Icon, Popup, Button
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
import chat_logo from '../../assets/chat_logo.png'

Log.setLogger(console);

const Chat = () => {
    const [messages, setMessages] = useState([])
    const [currentMessage, setCurrentMessage] = useState({type: '', value: ''});
    const [currentInput, setCurrentInput] = useState('')
    const [openChat, setOpenChat] = useState(true)
    const [maps, setMaps] = useState([])
    const [isVisible, setIsVisible] = useState(false);
    const [artifactOpen, setArtifactOpen] = useState(false);
    const [activeArtifactIndex, setActiveArtifactIndex] = useState()
    const [loading, setLoading] = useState()
    const auth = useAuth()
    const [conversations, setConversations] = useState([])
    const [newChatModalOpen, setNewChatModalOpen] = useState(false)
    const messagesEndRef = useRef(null);
    const [sidebarHidden, setSidebarHidden] = useState(true)
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
        if (messages.length === 0) {
            const start_over = {
                type: "user_chat_message",
                value: ""
            }

            setMessages([])
            setCurrentConversation(crypto.randomUUID());
            setCurrentInput('');

            // Set a flag in message to indicate this is a fresh start
            const fresh_start = {
                ...start_over,
                fresh_start: true
            }

            submit(fresh_start)
        }
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
                <img className='fixed top-0 left-0' src={chat_logo} alt="iDigBio" border="0" id="logo"
                     style={{width: '75px', height: '75px'}}></img>
            </div>

            <div className={`flex flex-1 justify-center items-start gap-20 p-10 pt-20 pl-20 `}>
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

            <div className='flex flex-1 max-w-[70px]'>
                <Sidebar className='relative' conversations={conversations} setMessages={setMessages}
                         sidebarHidden={sidebarHidden} setSidebarHidden={setSidebarHidden}
                         setLoading={setLoading} openChat={openChat} setOpenChat={setOpenChat} currentConversation={currentConversation}
                         setCurrentConversation={setCurrentConversation} clear={start_over} newChatModalOpen={newChatModalOpen} setNewChatModalOpen={setNewChatModalOpen}
                />
            </div>

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
                     currentConversation,
                     setCurrentConversation,
                     clear,
                     newChatModalOpen,
                     setNewChatModalOpen
 }) => {
    const auth = useAuth()
    const [isHovered, setIsHovered] = useState(false);
    const [isPinned, setIsPinned] = useState(false);

    const handleMouseEnter = () => {
        if (!isPinned) {
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isPinned) {
            setIsHovered(false);
        }
    };

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
        <div
            className="fixed top-0 left-0 h-screen flex "
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Hover trigger area */}
            {!isPinned && <div className="w-16 h-full bg-transparent z-10"/>}

            <div
                className={`fixed top-0 left-0 h-screen w-64 bg-black/80 text-white shadow-lg transition-transform duration-300 ease-in-out ${
                    isHovered || isPinned ? 'translate-x-0' : '-translate-x-64'
                }`}>

                <div className="flex justify-between px-2 py-6 border-b border-gray-700">
                    <div className='flex flex-0 mb-8'>
                        <img className='fixed top-0 left-0' src={chat_logo} alt="iDigBio" border="0" id="logo"
                             style={{width: '75px', height: '75px'}}></img>
                    </div>

                    <div id={"sui"} className="flex flex-col items-center">
                        {/* Pin Button */}
                        <button
                            onClick={() => setIsPinned(!isPinned)}
                            className=" hover:bg-gray-700 rounded-lg transition-colors w-8 h-8"
                            title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
                        >
                            {isPinned ?
                                <Icon name="chevron left"/>
                            :
                                <Icon name="chevron right"/>
                            }

                        </button>

                        <Menu
                            clear={clear}
                            setMessages={setMessages}
                            setLoading={setLoading}
                            newChatModalOpen={newChatModalOpen}
                            setNewChatModalOpen={setNewChatModalOpen}
                            openChat={openChat}
                            setOpenChat={setOpenChat}
                            currentConversation={currentConversation}
                            setCurrentConversation={setCurrentConversation}
                        />
                    </div>

                </div>

                <div className="border-b border-gray-700">
                    <button
                        id="sui"
                        className="w-full flex items-center gap-1 px-2 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-150 ease-in-out"
                        onClick={() => setNewChatModalOpen(true)}
                    >
                        <Icon color="white" className="flex items-center" name="plus circle"></Icon>
                        <span className="text-sm font-medium">Start new chat</span>

                    </button>
                </div>

                <div className="flex flex-col h-[calc(100%-120px)]">
                    {/* Scrollable Menu Section */}
                    <div className="flex-1 overflow-y-auto">
                        <nav className="px-4 py-2">
                            {conversations?.history?.map((item, index) => (
                                <button
                                    id="sui"
                                    key={index}
                                    className="w-full flex items-center px-2 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-150 ease-in-out"
                                    onClick={() => getChat(item.id)}
                                >
                                    <Icon color="white" className="flex items-center" name="chat"></Icon>
                                    <span className="text-sm font-medium">{item.title}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div id="this-one"
                         className="flex flex-col justify-center items-center flex-shrink-0 w-full py-9 border-t border-gray-700">
                        {auth.user ?
                            <div id="sui" className="flex flex-col text-left">
                                <span className="text-gray-400">{auth.user.profile.email}</span>
                                <Button onClick={() => {
                                    void auth.removeUser()
                                    void auth.signoutRedirect()
                                }} className='mt-2'>Sign out</Button>
                            </div>
                            :
                            <div id="sui" className="flex flex-col text-left">
                                <span>You are not signed in.</span>
                                <Button onClick={() => void auth.signinRedirect()} className='mt-2'>Sign in</Button>
                            </div>
                        }
                    </div>

                </div>
            </div>
        </div>
    );
};


export default Chat;
