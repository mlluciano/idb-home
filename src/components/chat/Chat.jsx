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

const footerHeight = 140
const contentHeight = `calc(100vh - ${footerHeight}px)`;

const Chat = () => {
    const [messages, setMessages] = useState([])
    const [currentMessage, setCurrentMessage] = useState({ type: '', value: '' });
    const [currentInput, setCurrentInput] = useState('')

      const handleSubmit = () => {
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

              const response = await fetch('https://chat.idigbio.org/chat', {
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
        <div className='flex item-center justify-center w-screen h-screen bg-zinc-800'>
                <img className='absolute top-0 left-0 m-2' src="https://portal.idigbio.org/portal/img/idigbio_logo.png" alt="iDigBio" border="0" id="logo"></img>
                <div className='absolute text-red-500 flex item-center'>Alpha</div>

            <Messages messages={messages} currentMessage={currentMessage} />

            <div id="sui" className='max-h-28 fixed bottom-10 flex item-center justify-center inset-x-0 bottom-0 bg-zinc-800 text-red text-center'>
                    <Form className='flex w-2/5'>
                        <TextArea
                            onKeyDown={(e) => {
                                if (e.keyCode ===13 && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSubmit()
                            }}}
                            value={currentInput} onChange={(e) => {

                            setCurrentInput(e.target.value)
                        }} placeholder='Message iDigBio' className="flex text-white bg-zinc-700" rows={1} />
                    </Form>
                    <div>
                        <Button onClick={() => handleSubmit()} icon className='bg-zinc-500 ml-2 rounded-3xl'>
                            <Icon size='large' className='w-full h-full p-0 m-0' name="arrow circle up" />
                        </Button>
                    </div>
            </div>
        </div>
    )
}

const Messages = ({messages, currentMessage}) => {
    const [maps, setMaps] = useState([])
    const [activeIndex, setActiveIndex] = useState()

    const divRef = useRef(null);

    useEffect(() => {
        if (divRef.current) {
            divRef.current.scrollTop = divRef.current.scrollHeight;
        }
    }, [currentMessage, messages]);


    return (
        <div ref={divRef} id="messages" className='flex flex-col justify-start items-center text-white w-full p-4 overflow-y-auto' style={{ height: contentHeight }}>

                <div className='flex flex-col w-3/6 gap-5'>
                {messages.map((message, key) => (
                    message.type === "user_chat_message" ? (
                        <div key={key} className='self-end inline-block text-white bg-[#6AAA51] w-2/5 p-3 rounded-lg'>
                            {message.value}
                        </div>
                    ) : message.type ==="ai_text_message" ? ( // role: "ai"
                        <div key={key} id="sui" >
                                <ReactMarkdown
                                    className='dark-table'
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code({ node, inline, className, children, ...props }) {
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
                    ) : message.type ==="ai_map_message" ? (
                        <div key={key} className='self-start inline-block text-white w-full rounded-lg'>
                            <Map rq={message.value.rq} search={search} maps={maps} setMaps={setMaps} mapid={key} />
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
                                        <Icon name='dropdown' />
                                        <div className='text-slate-400'>{message.value.summary}</div>
                                    </div>
                                </AccordionTitle>
                                <AccordionContent active={activeIndex === key} className='bg-black p-4'>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
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
                                code({ node, inline, className, children, ...props }) {
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

                </div>

            </div>
    )
}

export default Chat;
