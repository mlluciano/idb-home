import React, {useEffect, useState} from 'react';
import {Form, TextArea, Button, Icon, Accordion, AccordionTitle, AccordionContent, Container} from 'semantic-ui-react';
import Map from './Map';
import './chat.css'
import ReactMarkdown from "react-markdown"
import parseQuery from './parsers';
import { set } from 'lodash';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Markdown from 'markdown-to-jsx';
// import {streamMessages} from './parsers'
const markdownText = `
Generated search parameters:\\njson\\n{\\n    \\"rq\\": {\\n        \\"scientificname\\": \\"Rattus rattus\\"\\n    }\\n}\\n\\n\\n[Retrieve records using the iDigBio records API](https://search.idigbio.org/v2/search/records?rq=%7B%22scientificname%22:%22Rattus%20rattus%22%7D)\\n\\n[View results in the iDigBio portal](https://portal.idigbio.org/portal/search?rq=%7B%22scientificname%22:%22Rattus%20rattus%22%7D)\\n\\nTotal number of matching records: 19080
`;
import remarkGfm from 'remark-gfm'

const searchGalax = {
    filters: [
        {
            "name": "scientificname",
            "type": "text",
            "text": "",
            "exists": false,
            "missing": false,
            "fuzzy": false
        },
        {
            "name": "datecollected",
            "type": "daterange",
            "range": {
                "gte": "",
                "lte": ""
            },
            "exists": false,
            "missing": false
        },
        {
            "name": "country",
            "type": "text",
            "text": "",
            "exists": false,
            "missing": false,
            "fuzzy": false
        }
    ],
    fulltext:'',
    image:false,
    geopoint:false,
    sorting: [
        {name: 'genus', order: 'asc'},
        {name: 'specificepithet', order: 'asc'},
        {name: 'datecollected', order: 'asc'}
    ],
    from: 0,
    size: 100,
    mapping: {
        type: "box",
        bounds:{
            top_left:{
                lat: false,
                lon: false
            },
            bottom_right: {
                lat: false,
                lon: false
            }
        }
    }
}

const search = {
    filters: [
        {
            "name": "scientificname",
            "type": "text",
            "text": "",
            "exists": false,
            "missing": false,
            "fuzzy": false
        },
        {
            "name": "datecollected",
            "type": "daterange",
            "range": {
                "gte": "",
                "lte": ""
            },
            "exists": false,
            "missing": false
        },
        {
            "name": "country",
            "type": "text",
            "text": "",
            "exists": false,
            "missing": false,
            "fuzzy": false
        }
    ],
    fulltext:'',
    image:false,
    geopoint:false,
    sorting: [
        {name: 'genus', order: 'asc'},
        {name: 'specificepithet', order: 'asc'},
        {name: 'datecollected', order: 'asc'}
    ],
    from: 0,
    size: 100,
    mapping: {
        type: "box",
        bounds:{
            top_left:{
                lat: false,
                lon: false
            },
            bottom_right: {
                lat: false,
                lon: false
            }
        }
    }
}
const chat = {
    user_id: 1,
    session_id: 22,
    messages: [
        {role: "user", message: "----------START---------"},
        {role: "ai", message: "Yes, there are according to iDigBio data"},
        {role: "user", message: "Are there Ursos Arctos in the United States?"},
        {role: "ai", message: "Yes, there are according to iDigBio data"},
        {role: "user", message: "Are there Ursos Arctos in the United States?"},
        {role: "ai", message: "Yes, there are according to iDigBio data"},
        {role: "user", message: "Are there Ursos Arctos in the United States?"},
        {role: "ai", message: "Yes, there are according to iDigBio data"},
        {role: "user", message: "Are there Ursos Arctos in the United States?"},
        {role: "ai", message: "Yes, there are according to iDigBio data"},
        {role: "user", message: "Are there Ursos Arctos in the United States?"},
        {role: "ai", message: "Yes, there are according to iDigBio data"},
        {role: "user", message: "Are there Ursos Arctos in the United States?"},
        {role: "ai", message: "Yes, there are according to iDigBio data"},
        {role: "user", message: "Are there Ursos Arctos in the United States?"},
        {role: "ai", message: markdownText},
        {role: "user", message: "Are there Ursus Arctos in the United States?"},
        {role: "map", message: "Yes, according to iDigBio data Ursos Arctos lives in the United States. I will generate a map for you:", rq: {}},
        // {role: "ai", message: "---------END--------"},
    ]
}
const unescapeString = (str) => {
    return str
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
};
const resp = [
    {
        "type": "ai_text_message",
        "value": "| Header 1 | Header 2 |\n" +
            "|----------|----------|\n" +
            "| Row 1, Column 1 | Row 1, Column 2 |\n" +
            "| Row 2, Column 1 | Row 2, Column 2 |"
    },
    {
        "type": "ai_processing_message",
        "value": {
            "summary": "sum",
            "content": markdownText
        }
    }
]

const footerHeight = 140
const contentHeight = `calc(100vh - ${footerHeight}px)`;
const Chat = () => {
    const [messages, setMessages] = useState([])
    const [currentMessage, setCurrentMessage] = useState({ type: '', value: '' });
    const [currentInput, setCurrentInput] = useState('')

    const streamMessages_OLD = async (message) => {
        try {
          const response = await fetch('http://sobami2.acis.ufl.edu:8080/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json-stream',
            },
            body: JSON.stringify(message),
            credentials: "include"
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let isInArray = false;
          let currentType = null;
          let isParsingValue = false;
          let valueBuffer = '';

          const processText = (text) => {

            buffer += text;
            let startIndex = 0;

            while (startIndex < buffer.length) {
              if (!isInArray && buffer[startIndex] === '[') {
                isInArray = true;
                startIndex++;
                continue;
              }

              if (!isInArray) {
                startIndex++;
                continue;
              }

              if (currentType === null) {
                const typeMatch = /"type"\s*:\s*"([^"]+)"/.exec(buffer.slice(startIndex));
                if (typeMatch) {

                  currentType = typeMatch[1];
                  startIndex += typeMatch.index + typeMatch[0].length;
                  if (currentType === 'ai_text_message') {
                    isParsingValue = true;
                    valueBuffer = ''; // Reset valueBuffer for new message
                  } else if (currentType==="ai_map_message" || "ai_processing_message") {
                    isParsingValue=false
                    valueBuffer = ''
                  }
                } else {

                  break; // Wait for more data
                }
              }

              if (isParsingValue) {
                const valueStart = buffer.indexOf('"value"', startIndex);

                if (valueStart !== -1) {
                  const valueContentStart = buffer.indexOf('"', valueStart + 7) + 1;

                  let valueEnd = valueContentStart;
                  let inEscape = false;
                  while (valueEnd < buffer.length) {
                    if (buffer[valueEnd] === '"' && !inEscape) {
                      break;
                    }
                    if (buffer[valueEnd] === '\\') {
                      inEscape = !inEscape;
                    } else {
                      inEscape = false;
                    }
                    valueEnd++;
                  }
                //   console.log(valueEnd < buffer.length)

                  if (valueEnd < buffer.length) {
                    // We have a complete value
                    valueBuffer = buffer.slice(valueContentStart, valueEnd);

                    if (currentType && valueBuffer.trim()) {


                        const newMessage = { type: currentType, value: valueBuffer }
                      setCurrentMessage({});
                      setMessages(prevMessages => [...prevMessages, newMessage]);
                    }
                    currentType = null;
                    isParsingValue = false;
                    valueBuffer = '';
                    startIndex = valueEnd + 1;
                  } else {
                    // Incomplete value, update current message and wait for more

                    valueBuffer = buffer.slice(valueContentStart);
                    // console.log('INCOMPLETE: ' + valueBuffer)
                    if (currentType && valueBuffer.trim()) {
                        const newMessage = { type: currentType, value: valueBuffer }
                      setCurrentMessage(newMessage);
                    }
                    break;
                  }
                } else {
                  break; // Wait for more data
                }
              } else {

                if (currentType==='ai_processing_message' || currentType==='ai_map_message') {
                    const valueStart = buffer.indexOf('"value"', startIndex);
                    if (valueStart!==-1) {
                        const valueContentStart = buffer.indexOf('{', valueStart)

                        let objectEnd =  valueContentStart
                        let objectDepth = 1;


                        while (objectEnd < buffer.length && objectDepth > 0) {
                            if (buffer[objectEnd] === '{') {
                                objectDepth++;
                            } else if (buffer[objectEnd] === '}') {
                                objectDepth--;
                            }
                            objectEnd++;
                        }

                        if (objectEnd < buffer.length) {
                            valueBuffer = buffer.slice(valueContentStart, objectEnd-1);
                            let newMessage = {
                                type: currentType,
                                value: JSON.parse(valueBuffer)
                            }
                            setMessages(prevMessages => [...prevMessages, newMessage]);
                            startIndex = objectEnd + 1;
                            valueBuffer=''
                            currentType = null;
                        } else {
                            valueBuffer = buffer.slice(valueContentStart)
                            break

                        }
                    } else {
                        break;
                    }


                }

                // else if (currentType==='ai_map_message') {
                //     // For non-ai_text_message types, parse the entire object
                // const objectEnd = buffer.indexOf('}', startIndex);
                // console.log(buffer.slice(startIndex))
                // console.log(objectEnd)

                // if (objectEnd !== -1) {
                //   const objectString = buffer.slice(startIndex+17, objectEnd+1);
                //   console.log(objectString)
                //   try {
                //     const messageObj = JSON.parse(objectString);
                //     // console.log(messageObj)
                //     let new_message = {
                //         type: currentType,
                //         value: {
                //             rq: messageObj
                //         }
                //     }
                //     // if (messageObj.type && messageObj.value.trim()) {
                //       setMessages(prevMessages => [...prevMessages, new_message]);
                //     // }
                //     currentType = null;
                //     startIndex = objectEnd + 1;
                //   } catch (e) {
                //     // Incomplete object, wait for more data
                //     break;
                //   }
                // } else {
                //   break; // Wait for more data
                // }
                // }


              }
            }

            buffer = buffer.slice(startIndex);
          };

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            processText(decoder.decode(value, { stream: true }));
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

    const streamMessages = async (message) => {
        const response = await fetch('http://sobami2.acis.ufl.edu:8080/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json-stream',
            },
            body: JSON.stringify(message),
            credentials: "include"
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let isInArray = false;
        let currentType = null;
        let isParsingValue = false;
        let valueBuffer = '';
        let stack = []
        let typeMatch

        const processText = (text) => {

            buffer += text
            let startIndex = 0;

            while (startIndex<buffer.length) {
                if (!isInArray && buffer[startIndex] === '[') {
                    isInArray = true;
                    startIndex++;
                    continue;
                }

                if (!isInArray) {
                    startIndex++;
                    continue;
                }

                if (currentType===null) {
                    console.log(startIndex)
                    typeMatch = /"type"\s*:\s*"([^"]+)"/.exec(buffer.slice(startIndex));

                    if (typeMatch) {
                        console.log(typeMatch)
                        currentType = typeMatch[1];
                        startIndex += typeMatch.index + typeMatch[0].length;
                        valueBuffer=''
                        isParsingValue = true
                    } else {
                        break
                    }
                }

                if (isParsingValue) {
                    const valueStart = buffer.indexOf('"value"', startIndex);

                    if (valueStart!==-1) {
                        let valueContentStart
                        let valueEnd = -1
                        let inEscape = false;

                        while (valueEnd<buffer.length) {
                            if (typeMatch==='ai_text_message') {
                                valueContentStart = buffer.indexOf('"', valueStart +7) + 1;
                                valueEnd = valueContentStart
                                while (valueEnd<buffer.length) {
                                    if (buffer[valueEnd] === '"' && !inEscape) {
                                        break;
                                    }
                                    if (buffer[valueEnd] === '\\') {
                                        inEscape = !inEscape;
                                    } else {
                                        inEscape = false;
                                    }
                                    valueEnd++;
                                }

                            } else if (typeMatch==='ai_processing_message' || 'ai_map_message') {
                                valueContentStart = buffer.indexOf('{', valueStart + 7) + 1;
                                valueEnd = valueContentStart
                                stack.push('{')

                                while (valueEnd<buffer.length) {

                                    if (buffer[valueEnd]==='}' && !inEscape) {
                                        if (stack.slice(-1)[0]=='{') {
                                            if (stack.length===1) {
                                                console.log('breaking')
                                                break
                                            } else {
                                                stack.pop()
                                            }
                                        }

                                    }
                                    if (buffer[valueEnd]==='{') {
                                        stack.push('{')
                                    }
                                    if (buffer[valueEnd]==='\\') {
                                        inEscape = !inEscape
                                    }
                                    else {
                                        inEscape = false
                                    }
                                    valueEnd++
                                }

                            }

                        }

                        if (valueEnd<buffer.length) {
                            console.log('broke out of while loop')
                            // Complete Value
                            valueBuffer = buffer.slice(valueContentStart, valueEnd);
                            if (currentType && valueBuffer) {
                                const newMessage = { type: currentType, value: valueBuffer }
                                setCurrentMessage({});
                                setMessages((prevMessages) => [...prevMessages, newMessage]);
                            }
                            currentType = null;
                            isParsingValue = false;
                            valueBuffer = '';
                            startIndex = valueEnd + 1;
                            stack = []
                        } else {
                            if (currentType==='ai_text_message') {

                                valueBuffer = buffer.slice(valueContentStart);
                                console.log(valueBuffer)
                                if (currentType && valueBuffer.trim()) {
                                    const newMessage = { type: currentType, value: valueBuffer }
                                    setCurrentMessage(newMessage);
                                }
                                break;
                            }
                        }
                    }
                }
            }
            buffer = buffer.slice(startIndex);
        }
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            processText(decoder.decode(value, { stream: true }));
        }
    }


      const handleSubmit = () => {
        const user_message = {
            type: "user_chat_message",
            value: currentInput
        }
        setCurrentInput('')
        setMessages(prevMessages => [...prevMessages, user_message]);
        streamMessages_OLD(user_message)
      }

      useEffect( () => {
          document.title = "TDWG Demo";
          async function clear() {
              const clear_chat_on_server = {
                  type: "user_chat_message",
                  value: "clear"
              }

              const response = await fetch('http://sobami2.acis.ufl.edu:8080/chat', {
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

            <Messages chat={chat} messages={messages} currentMessage={currentMessage} />

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

const Messages = ({chat, messages, currentMessage}) => {
    const [maps, setMaps] = useState([])
    const [activeIndex, setActiveIndex] = useState()


    return (
        <div id="messages" className='flex flex-col justify-start items-center text-white w-full p-4 overflow-y-auto' style={{ height: contentHeight }}>

                <div className='flex flex-col w-3/6'>
                {messages.map((message, key) => (
                    message.type === "user_chat_message" ? (
                        <div key={key} className='self-end inline-block text-white bg-[#6AAA51] w-2/5 p-4 rounded-lg'>
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
                        <div key={key} id='sui'>
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
                                <AccordionContent active={activeIndex === key}>
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
