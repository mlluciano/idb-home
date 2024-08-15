import React, {useEffect, useState} from 'react';
import { Form, TextArea, Button, Icon, Accordion, AccordionTitle, AccordionContent} from 'semantic-ui-react';
import Map from './Map';
import './chat.css'
import ReactMarkdown from "react-markdown"
import parseQuery from './parsers';
import { set } from 'lodash';

const markdownText = `
# Welcome to Our FAQ

## Frequently Asked Questions

Here are some common questions and answers:

- **What is Markdown?**
  Markdown is a lightweight markup language with plain-text formatting syntax. It is often used to format readme files, for writing messages in online discussion forums, and to create rich text using a plain text editor.

- *Why use Markdown?*
  Markdown allows you to write using an easy-to-read, easy-to-write plain text format, which then converts to structurally valid HTML.

### More Information

For more details on Markdown syntax, check out [Markdown Guide](https://www.markdownguide.org).
`;

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

const resp = [
    {
        "type": "ai_chat_message",
        "value": "Here is a map of occurrences for the genus Carex"
    },
    {
        "type": "ai_map_message",
        "value": {
            "rq": {
                "genus": "Carex"
            }
        }
    }
]

const footerHeight = 140
const contentHeight = `calc(100vh - ${footerHeight}px)`;
const Chat = () => {
    const [messages, setMessages] = useState([])
    const [currentMessage, setCurrentMessage] = useState({ type: '', value: '' });
    const [currentInput, setCurrentInput] = useState('')

    // const streamMessages = async (message) => {
    //     try {
    //     const response = await fetch('http://sobami2.acis.ufl.edu:8080/chat', {
    //         method: 'POST', // or 'GET', depending on your API
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Accept': 'application/json-stream',
    //         },
    //         body: JSON.stringify(message),
    //         });
    
    //         if (!response.ok) {
    //         throw new Error(`HTTP error! status: ${response.status}`);
    //         }

    //         const reader = response.body.getReader();
    //         const decoder = new TextDecoder();
    //         let buffer = '';
    //         let isInArray = false;
    //         let currentType = null;
    //         let isParsingValue = false;
    //         let valueBuffer = '';

    //         const processText = (text) => {
    //             buffer += text;
    //             let startIndex = 0;

    //             while (startIndex < buffer.length) {
    //                 if (!isInArray && buffer[startIndex] === '[') {
    //                 isInArray = true;
    //                 startIndex++;
    //                 continue;
    //                 }

    //                 if (!isInArray) {
    //                 startIndex++;
    //                 continue;
    //                 }

    //                 if (currentType === null) {
    //                 const typeMatch = /"type"\s*:\s*"([^"]+)"/.exec(buffer.slice(startIndex));
    //                 if (typeMatch) {
    //                     currentType = typeMatch[1];
    //                     console.log(currentType)
    //                     startIndex += typeMatch.index + typeMatch[0].length;
    //                     if (currentType === 'ai_text_message') {
    //                     isParsingValue = true;
    //                     }
    //                 } else {
    //                     break; // Wait for more data
    //                 }
    //                 }

    //                 if (isParsingValue) {
    //                 const valueStart = buffer.indexOf('"value"', startIndex);
    //                 if (valueStart !== -1) {
    //                     console.log(valueStart)
    //                     const valueContentStart = buffer.indexOf('"', valueStart + 7) + 1;
    //                     let valueEnd = valueContentStart;
    //                     let inEscape = false;
    //                     while (valueEnd < buffer.length) {
    //                     if (buffer[valueEnd] === '"' && !inEscape) {
    //                         break;
    //                     }
    //                     if (buffer[valueEnd] === '\\') {
    //                         inEscape = !inEscape;
    //                     } else {
    //                         inEscape = false;
    //                     }
    //                     valueEnd++;
    //                     }

    //                     if (valueEnd < buffer.length) {
    //                     // We have a complete value
    //                     valueBuffer += buffer.slice(valueContentStart, valueEnd);
    //                     console.log(valueBuffer)
    //                     setCurrentMessage({ type: currentType, value: valueBuffer });
    //                     setMessages(prevMessages => [...prevMessages, { type: currentType, value: valueBuffer }]);
    //                     currentType = null;
    //                     isParsingValue = false;
    //                     valueBuffer = '';
    //                     startIndex = valueEnd + 1;
    //                     } else {
    //                     // Incomplete value, update current message and wait for more
    //                     const s = buffer.indexOf(valueBuffer, valueContentStart);
    //                     console.log(s)
    //                     valueBuffer += buffer.slice(s);
    //                     // console.log(valueBuffer)
    //                     setCurrentMessage({ type: currentType, value: valueBuffer });
    //                     break;
    //                     }
    //                 } else {
    //                     break; // Wait for more data
    //                 }
    //                 } else {
    //                 // For non-ai_chat_message types, parse the entire object
    //                 const objectEnd = buffer.indexOf('}', startIndex);
    //                 if (objectEnd !== -1) {
    //                     const objectString = buffer.slice(startIndex, objectEnd + 1);
    //                     try {
    //                     const messageObj = JSON.parse(objectString);
    //                     setMessages(prevMessages => [...prevMessages, messageObj]);
    //                     currentType = null;
    //                     startIndex = objectEnd + 1;
    //                     } catch (e) {
    //                     // Incomplete object, wait for more data
    //                     break;
    //                     }
    //                 } else {
    //                     break; // Wait for more data
    //                 }
    //                 }
    //             }

    //             buffer = buffer.slice(startIndex);
    //         };

    //         while (true) {
    //             const { done, value } = await reader.read();
    //             if (done) break;
    //             processText(decoder.decode(value, { stream: true }));
    //         }
    //     } catch (error) {
    //         console.error('Error fetching data:', error);
    //     }
    //   };
    //   console.log(messages)
    //   console.log(currentMessage)

    const streamMessages = async (message) => {
        try {
          const response = await fetch('http://sobami2.acis.ufl.edu:8080/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json-stream',
            },
            body: JSON.stringify(message),
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
                    // console.log(typeMatch)
                  currentType = typeMatch[1];
                //   console.log("Found type:", currentType);
                  startIndex += typeMatch.index + typeMatch[0].length;
                //   console.log(buffer[startIndex])
                  if (currentType === 'ai_text_message') {
                    isParsingValue = true;
                    valueBuffer = ''; // Reset valueBuffer for new message
                  } else if (currentType=="ai_map_message") {
                    isParsingValue=false
                    valueBuffer = ''
                  }
                } else {
                  break; // Wait for more data
                }
              }
      
              if (isParsingValue) {
                const valueStart = buffer.indexOf('"value"', startIndex);
                // console.log('valueStart: ' + valueStart)
                if (valueStart !== -1) {
                  const valueContentStart = buffer.indexOf('"', valueStart + 7) + 1;
                //   console.log(buffer[valueContentStart])
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
                    console.log("Complete value:", valueBuffer);
                    if (currentType && valueBuffer.trim()) {
                        // console.log('current type: ' + currentType)
                        // console.log('valueBuffer: ' + valueBuffer.trim())
                        const newMessage = { type: currentType, value: valueBuffer }
                      setCurrentMessage({});
                      setMessages((prevMessages) => [...prevMessages, newMessage]);
                    }
                    currentType = null;
                    isParsingValue = false;
                    valueBuffer = '';
                    startIndex = valueEnd + 1;
                    // console.log('valueEnd + 1: ' + startIndex)
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
                // For non-ai_text_message types, parse the entire object
                const objectEnd = buffer.indexOf('}', startIndex);
                if (objectEnd !== -1) {
                  const objectString = buffer.slice(startIndex+17, objectEnd+1);
                //   console.log(objectString)
                  try {
                    const messageObj = JSON.parse(objectString);
                    // console.log(messageObj)
                    let new_message = {
                        type: currentType,
                        value: {
                            rq: messageObj
                        }
                    }
                    // if (messageObj.type && messageObj.value.trim()) {
                      setMessages(prevMessages => [...prevMessages, new_message]);
                    // }
                    currentType = null;
                    startIndex = objectEnd + 1;
                  } catch (e) {
                    // Incomplete object, wait for more data
                    break;
                  }
                } else {
                  break; // Wait for more data
                }
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
      

      const handleSubmit = () => {
        const user_message = {
            type: "user_chat_message",
            value: currentInput
        }
        setCurrentInput('')
        setMessages(prevMessages => [...prevMessages, user_message]);
        streamMessages(user_message)
      }


      
  
    

    return (
        <div className='flex item-center justify-center w-screen h-screen bg-zinc-800'>
            <img className='absolute top-0 left-0 m-2' src="https://portal.idigbio.org/portal/img/idigbio_logo.png" alt="iDigBio" border="0" id="logo"></img>

            <Messages chat={chat} messages={messages} currentMessage={currentMessage} />

            <div id="sui" className='max-h-28 fixed bottom-10 flex item-center justify-center inset-x-0 bottom-0 bg-zinc-800 text-red text-center'>
                    <Form className='flex w-2/5'>
                        <TextArea value={currentInput} onChange={(e) => setCurrentInput(e.target.value)} placeholder='Message iDigBio' className="flex text-white bg-zinc-700" rows={1} />
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
                        <div key={key} className='self-end inline-block text-white bg-green-500 w-2/5 p-4 rounded-lg'>
                            {message.value}
                        </div>
                    ) : message.type ==="ai_text_message" ? ( // role: "ai"
                        <div key={key} className='md-container self-start inline-block text-white w-full p-4 rounded-lg'>
                            <ReactMarkdown className='md-container'>{message.value}</ReactMarkdown>
                        </div>
                    ) : message.type ==="ai_map_message" ? (
                        <div key={key} className='self-start inline-block text-white w-full rounded-lg'>
                            <Map rq={message.value.rq} search={search} maps={maps} setMaps={setMaps} mapid={key} />
                            <div>{JSON.stringify(message.value.rq)}</div>
                        </div>
                    ) : message.type === "ai_processing_message" ? (
                        <div>
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
                                <AccordionContent
                                active={activeIndex === key}
                                >
                                    <ReactMarkdown>{message.value.content}</ReactMarkdown>
                                </AccordionContent>
                            </Accordion>
                        </div>
                    ) : (
                        <div key={key}>{message.value}</div>
                    )
                ))}
                {currentMessage && 
                    <div id="sui" className='md-container self-start inline-block text-white w-full p-4 rounded-lg'>
                        <Accordion>
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
                        </Accordion>
                            {/* <ReactMarkdown className='md-container'>{currentMessage.value}</ReactMarkdown> */}
                    </div>
                }
                
                </div>

            </div>
    )
}

export default Chat;