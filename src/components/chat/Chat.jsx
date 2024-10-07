import React, {useEffect, useRef, useState} from 'react';
import {
    Form,
    TextArea,
    Icon,
    Accordion,
    AccordionTitle,
    AccordionContent,
    Header,
} from 'semantic-ui-react';
import '../../css/chat.css'
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {streamMessages_OBOE} from '../../helpers/parsers'
import remarkGfm from 'remark-gfm'
import { unescapeString } from '../../helpers/parsers';
import Artifact from "./Artifact.jsx";

const footerHeight = 140
const contentHeight = `calc(100vh - ${footerHeight}px)`;

const Chat = () => {
    const [messages, setMessages] = useState([])
    const [currentMessage, setCurrentMessage] = useState({ type: '', value: '' });
    const [currentInput, setCurrentInput] = useState('')
    const [openChat, setOpenChat] = useState(false)
    const [maps, setMaps] = useState([])
    const [isVisible, setIsVisible] = useState(false);
    const [artifactOpen, setArtifactOpen] = useState(false);
    const [activeArtifactIndex, setActiveArtifactIndex] = useState()

      const handleSubmit = () => {
        if (!openChat) {
            setOpenChat(true)
        }
        const user_message = {
            type: "user_chat_message",
            value: currentInput
        }
        setCurrentInput('')
        setMessages(prevMessages => [...prevMessages, user_message]);
        streamMessages_OBOE(user_message, setMessages, setCurrentMessage)
      }

      useEffect(() => {
          document.title = "TDWG Demo";
          async function clear() {
              const clear_chat_on_server = {
                  type: "user_chat_message",
                  value: "clear"
              }

              const response = await fetch('/chat', {
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
          clear()
    }, [])

    useEffect(() => {
        let m = []
        for (let i=0; i<messages.length; i++) {
            if (messages[i].type==='ai_map_message') {
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
                <img className='fixed top-0 left-0' src="src/assets/chat_logo.png" alt="iDigBio" border="0" id="logo" style={{width: '75px', height: '75px'}}></img>
                <div className='flex text-red-500 absolute left-1/2'>Alpha</div>
            </div>

            <div className='flex flex-1 justify-center items-start gap-20 p-10 pt-20 pl-20'>
                <div className="flex flex-1 justify-center">
                    {messages.length > 0
                        ? <Messages messages={messages} currentMessage={currentMessage}
                                    currentInput={currentInput} setCurrentInput={setCurrentInput} handleSubmit={handleSubmit}
                                    activeArtifactIndex={activeArtifactIndex} setActiveArtifactIndex={setActiveArtifactIndex}
                                    artifactOpen={artifactOpen} setArtifactOpen={setArtifactOpen}
                                    setIsVisible={setIsVisible} />

                        : <Home currentInput={currentInput} setCurrentInput={setCurrentInput} handleSubmit={handleSubmit} />
                    }
                </div>

                {artifactOpen &&
                    <div className={`relative flex flex-1 justify-end `}>
                        <Artifact messages={messages}
                                  artifactOpen={artifactOpen} setArtifactOpen={setArtifactOpen}
                                  isVisible={isVisible} setIsVisible={setIsVisible}
                                  setActiveArtifactIndex={setActiveArtifactIndex} />
                    </div>
                }
            </div>

        </div>

    )
}

const Messages = ({messages, currentMessage, currentInput, setCurrentInput, handleSubmit, setActiveArtifactIndex, artifactOpen, setArtifactOpen, setIsVisible}) => {
    const [activeIndex, setActiveIndex] = useState()

    const divRef = useRef(null);

    useEffect(() => {
        if (divRef.current) {
            divRef.current.scrollTop = divRef.current.scrollHeight;
        }
    }, [currentMessage, messages]);

    const handleArtifactClick = (key) => {
        if (!artifactOpen) {
            setActiveArtifactIndex(key)
            setArtifactOpen(!artifactOpen)
            setTimeout(() => setIsVisible(true), 50);
        } else {
            setActiveArtifactIndex(key)
        }
    }


    return (
        <div ref={divRef} id="messages" className='relative flex flex-col flex-1 justify-start items-center text-white max-w-5xl'>

            <div className='flex flex-col flex-1 w-full  gap-5 bg-zinc-700 border-zinc-600 border p-5 rounded border-box'>
                {messages.map((message, key) => (
                    message.type === "user_chat_message" ? (
                        <div key={key} className='self-end inline-block text-white bg-[#6AAA51] w-2/5 p-3 rounded-lg'>
                            {message.value}
                        </div>
                    ) : message.type === "ai_text_message" ? (
                        <div key={key} id="sui">
                            <ReactMarkdown
                                className='dark-table'
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({node, inline, className, children, ...props}) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <SyntaxHighlighter
                                                style={tomorrow}
                                                language={match[1]}
                                                PreTag="div"
                                                {...props}
                                            >
                                                {children}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    a: NewTabLink
                                }}
                            >
                                {unescapeString(message.value)}
                            </ReactMarkdown>

                        </div>
                    )  : message.type === "ai_processing_message" ? (
                        <div key={key} id='sui' className='self-start inline-block text-white w-full rounded-lg'>
                            <Accordion>
                                <AccordionTitle
                                    active={activeIndex === key}
                                    index={key}
                                    onClick={() => {
                                        activeIndex === key ? setActiveIndex(-1) : setActiveIndex(key)
                                    }}
                                >
                                    <div className='flex'>
                                        <Icon name='dropdown'/>
                                        <div className='text-slate-400'>{message.value.summary}</div>
                                    </div>
                                </AccordionTitle>
                                <AccordionContent active={activeIndex === key} className='bg-black p-4'>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({node, inline, className, children, ...props}) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        style={tomorrow}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            },
                                            a: NewTabLink
                                        }}
                                    >
                                        {unescapeString(message.value.content)}
                                    </ReactMarkdown>
                                </AccordionContent>
                            </Accordion>
                        </div>
                    ) : message.type === "ai_map_message" ? (
                        <div key={key} className='min-w-1/2' onClick={() => handleArtifactClick(key)}>
                            <div
                            className='flex flex-col items-start justify-start bg-zinc-800 min-h-9 rounded-lg hover:cursor-pointer border-zinc-600 border'>
                                <span className='bold px-2 pt-1 justify-start'>Map of {message.value.rq.scientificname ? message.value.rq.scientificname : JSON.stringify(message.value.rq)}</span>
                                <span className='px-2 pb-1 font-extralight text-sm'>Click to view</span>
                            </div>
                        </div>
                    ) : (
                        <div key={key}></div>
                    )
                ))}
                {currentMessage &&
                    <div id="sui" className='md-container self-start inline-block text-white w-full p-4 rounded-lg'>
                        <ReactMarkdown
                            components={{
                                code({node, inline, className, children, ...props}) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <SyntaxHighlighter
                                            style={tomorrow}
                                            language={match[1]}
                                            PreTag="div"
                                            {...props}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                                a: NewTabLink
                            }}
                        >
                            {currentMessage.value}
                        </ReactMarkdown>
                    </div>
                }

                <div id='sui' className='flex'>
                    <Form className='flex w-full justify-center'>
                        <TextArea
                            onKeyDown={(e) => {
                                if (e.keyCode === 13 && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSubmit()
                                }
                            }}
                            value={currentInput} onChange={(e) => {

                            setCurrentInput(e.target.value)
                        }} placeholder='Message iDigBio' className="flex justify-center text-white bg-zinc-700 border rounded-lg border-zinc-500" rows={1}/>
                    </Form>
                </div>

            </div>


        </div>
    )
}

const NewTabLink = ({ href, children }) => {
    const isExternal = href.startsWith('http') || href.startsWith('https');
    return isExternal ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
        </a>
    ) : (
        <a href={href}>{children}</a>
    );
};

//
// const Message = ({key, message}) => {
//
//     return (
//         {message.type === 'ai_map_message' ? <MapMessage />
//         ? message.type ==='ai_text_message' : <TextMessage />
//         : <div>hi</div>
//         }
//     )
//
// }


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
