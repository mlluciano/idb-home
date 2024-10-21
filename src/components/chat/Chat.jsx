import React, {useEffect, useRef, useState} from 'react';
import {
    Form,
    TextArea,
    Header,
} from 'semantic-ui-react';
import '../../css/chat.css'
import {streamMessages_OBOE} from '../../helpers/parsers'
import Artifact from "./Artifact.jsx";
import Messages from "./messages/Messages.jsx";
import Menu from "./menus/Menu.jsx"
const footerHeight = 140
const contentHeight = `calc(100vh - ${footerHeight}px)`;

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

    const [newChatModalOpen, setNewChatModalOpen] = useState(false)

    const handleSubmit = () => {
        if (currentInput!== '' ) {
            setLoading(true)
            if (!openChat) {
                setOpenChat(true)
            }
            const user_message = {
                type: "user_chat_message",
                value: currentInput
            }
            setCurrentInput('')
            setMessages(prevMessages => [...prevMessages, user_message]);
            streamMessages_OBOE(user_message, setMessages, setCurrentMessage, setLoading)
        }
    }

    async function clear() {
        const clear_chat_on_server = {
            type: "user_chat_message",
            value: "clear"
        }

        const response = await fetch('http://localhost:8989/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json-stream',
            },
            body: JSON.stringify(clear_chat_on_server),
            credentials: "include"
        });

        if (!response.ok) {
            console.log(response.status)
        }
    }

    useEffect(() => {
        document.title = "Chat";
        clear()
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


    return (
        <div className='flex flex-col flex-1 w-full bg-zinc-800 min-h-screen overflow-hidden'>

            <div className='flex flex-0'>
                <img className='fixed top-0 left-0' src="src/assets/chat_logo.png" alt="iDigBio" border="0" id="logo"
                     style={{width: '75px', height: '75px'}}></img>
                <div className='flex text-red-500 absolute left-1/2'>Alpha</div>
            </div>

            {openChat &&
                        <Menu
                            clear={clear}
                            setMessages={setMessages} setLoading={setLoading}
                            newChatModalOpen={newChatModalOpen} setNewChatModalOpen={setNewChatModalOpen}
                            openChat={openChat} setOpenChat={setOpenChat}
                        />
}


            <div className='flex flex-1 justify-center items-start gap-20 p-10 pt-20 pl-20'>
                <div className="flex flex-1 justify-center">
                    {messages.length > 0
                        ? <Messages messages={messages} currentMessage={currentMessage}
                                    currentInput={currentInput} setCurrentInput={setCurrentInput}
                                    handleSubmit={handleSubmit}
                                    activeArtifactIndex={activeArtifactIndex}
                                    setActiveArtifactIndex={setActiveArtifactIndex}
                                    artifactOpen={artifactOpen} setArtifactOpen={setArtifactOpen}
                                    setIsVisible={setIsVisible} loading={loading} setLoading={setLoading}/>

                        : <Home currentInput={currentInput} setCurrentInput={setCurrentInput}
                                handleSubmit={handleSubmit}/>
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

    return (
        <div id='sui' className='flex flex-col justify-center items-center w-full'>
            <Header as='h1' className='text-zinc-200'>Good afternoon, Researcher</Header>
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
                        className="flex text-white bg-zinc-700 border rounded-lg border-zinc-600 mt-5" rows={1} style={{height: '100px'}}/>
                </Form>
            </div>
            <div className='mt-10 text-red-500'>This is a research prototype not yet ready for public use.</div>
        </div>
    )
}



export default Chat;
