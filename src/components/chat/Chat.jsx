import React, {useEffect, useRef, useState} from 'react';
import {Form, TextArea, Button, Icon, Accordion, AccordionTitle, AccordionContent, Container} from 'semantic-ui-react';
import Map from './Map';
import './chat.css'
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {streamMessages_OLD} from '../../helpers/parsers'
import {initialSearch as search} from '../../helpers/constants'
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
        streamMessages_OLD(user_message, setMessages, setCurrentMessage)
      }

      useEffect(() => {
          document.title = "TDWG Demo";
          async function clear() {
              const clear_chat_on_server = {
                  type: "user_chat_message",
                  value: "clear"
              }

              const response = await fetch('http://localhost:8080/chat', {
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


    return (
        <div className='flex flex-col flex-1 w-full bg-zinc-800 min-h-screen'>

            <div className='flex w-full max-w-full'>
                <img className='top-0 left-0' src="https://portal.idigbio.org/portal/img/idigbio_logo.png" alt="iDigBio" border="0" id="logo"></img>
                <div className='flex text-red-500 absolute left-1/2'>Alpha</div>
            </div>

            <div className='flex flex-1 justify-center items-start gap-20 mt-5'>

                <div className="flex w-2/5 justify-center ml-20">
                    {openChat
                        ? <Messages messages={messages} currentMessage={currentMessage} currentInput={currentInput}
                                              setCurrentInput={setCurrentInput} handleSubmit={handleSubmit}/>
                        : <Home currentInput={currentInput} setCurrentInput={setCurrentInput} handleSubmit={handleSubmit} />
                    }
                </div>
                {openChat &&
                    <div className='flex flex-1 mr-0'>
                        <Artifact/>
                    </div>
                }
            </div>


        </div>

    )
}

const Messages = ({messages, currentMessage, currentInput, setCurrentInput, handleSubmit}) => {
    const [maps, setMaps] = useState([])
    const [activeIndex, setActiveIndex] = useState()

    const divRef = useRef(null);

    useEffect(() => {
        if (divRef.current) {
            divRef.current.scrollTop = divRef.current.scrollHeight;
        }
    }, [currentMessage, messages]);


    return (
        <div ref={divRef} id="messages" className='relative flex flex-col flex-1 justify-start items-center text-white w-full'>

            <div className='flex flex-col flex-1 w-full gap-5 bg-zinc-700 border-zinc-600 border p-5 rounded border-box'>
                {messages.map((message, key) => (
                    message.type === "user_chat_message" ? (
                        <div key={key} className='self-end inline-block text-white bg-[#6AAA51] w-2/5 p-3 rounded-lg'>
                            {message.value}
                        </div>
                    ) : message.type === "ai_text_message" ? ( // role: "ai"
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
                                }}
                            >
                                {unescapeString(message.value)}
                            </ReactMarkdown>

                        </div>
                    ) : message.type === "ai_map_message" ? (
                        <div key={key} className='self-start inline-block text-white w-full rounded-lg'>
                            <Map rq={message.value.rq} search={search} maps={maps} setMaps={setMaps} mapid={key}/>
                        </div>
                    ) : message.type === "ai_processing_message" ? (
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
                                        }}
                                    >
                                        {unescapeString(message.value.content)}
                                    </ReactMarkdown>
                                </AccordionContent>
                            </Accordion>
                        </div>
                    ) : (
                        <div key={key}>{message.value}</div>
                    )
                ))}
                {currentMessage &&
                    <div id="sui" className='md-container self-start inline-block text-white w-full p-4 rounded-lg'>
                        {/* <Accordion>
                                <AccordionTitle
                                    active={activeIndex === 0}
                                    index={0}
                                    onClick={() => {
                                        activeIndex === 0 ? setActiveIndex(-1) : setActiveIndex(0)
                                    }}
                                >
                                    <div className='flex'>
                                        <Icon name='dropdown' />
                                        <div className='text-slate-400'>Generating rq...</div>
                                    </div>

                                </AccordionTitle>
                                <AccordionContent
                                    active={activeIndex === 0}
                                >
                                    <p className='m-0 p-0'>rq</p>
                                </AccordionContent>
                        </Accordion> */}
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
                            }}
                        >
                            {currentMessage.value}
                        </ReactMarkdown>
                        {/*<ReactMarkdown className='md-container'>{currentMessage.value}</ReactMarkdown>*/}
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

const Home = ({currentInput, setCurrentInput, handleSubmit}) => {

    return (
        <div className='flex justify-center w-full'>
            <div id='sui' className='flex w-1/2 justify-center max-w-screen-md'>
                <Form className='flex w-full'>
                    <TextArea
                        onKeyDown={(e) => {
                            if (e.keyCode === 13 && !e.shiftKey) {
                                e.preventDefault()
                                handleSubmit()
                            }
                        }}
                        value={currentInput} onChange={(e) => {

                        setCurrentInput(e.target.value)
                    }} placeholder='How can I help you today?'
                        className="flex text-white bg-zinc-700 border rounded-lg border-zinc-600" rows={1}/>
                </Form>
            </div>
        </div>
    )
}



export default Chat;
