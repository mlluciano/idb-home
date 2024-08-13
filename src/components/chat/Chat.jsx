import React from 'react';
import { Form, TextArea, Button, Icon } from 'semantic-ui-react';
import Map from './Map';
import './chat.css'
import ReactMarkdown from "react-markdown"


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
            "text": "galax urceolata",
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
            "text": "ursus arctos",
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
        {role: "user", message: "idk"},
        {role: "map", message: "Yes, according to iDigBio data Ursos Arctos lives in the United States. I will generate a map for you:"},
        // {role: "ai", message: "---------END--------"},
    ]
}

const footerHeight = 140
const contentHeight = `calc(100vh - ${footerHeight}px)`;
const Chat = () => {

    return (
        <div className='flex item-center justify-center w-screen h-screen bg-zinc-800'>
            <img className='absolute top-0 left-0 m-2' src="https://portal.idigbio.org/portal/img/idigbio_logo.png" alt="iDigBio" border="0" id="logo"></img>

            <Messages chat={chat} />
            {/* <div className = 'flex w-full bg-blue-500' style={{ height: '490px'}}>
                <Map search={search} />
            </div> */}

            <div id="sui" className='max-h-28 fixed bottom-10 flex item-center justify-center inset-x-0 bottom-0 bg-zinc-800 text-red text-center'>
                {/* <div className='flex item-center justify'> */}
                    <Form className='flex w-2/5'>
                        <TextArea placeholder='Message iDigBio' className="flex text-white bg-zinc-700" rows={1} />
                    </Form>
                    <div>
                    <Button icon className='bg-zinc-500 ml-2 rounded-3xl'>
                        <Icon size='large' className='w-full h-full p-0 m-0' name="arrow circle up" />
                    </Button>
                    </div>
                {/* </div> */}
            </div>
            
        </div>
    )
}

const Messages = ({chat}) => {

    return (
        <div id="messages" className='flex flex-col justify-start items-center text-white w-full p-4 overflow-y-auto' style={{ height: contentHeight }}>

                <div className='flex flex-col w-3/6'>
                {chat.messages.map((message, key) => (
                    message.role === "user" ? (
                        <div key={key} className='self-end inline-block text-white bg-green-500 w-2/5 p-5 m-2 rounded-lg'>
                            {message.message}
                        </div>
                    ) : message.role ==="ai" ? ( // role: "ai"
                        <div key={key} className='md-container self-start inline-block text-white w-full p-5 m-2 rounded-lg'>
                            <ReactMarkdown>{message.message}</ReactMarkdown>
                        </div>
                    ) : message.role ==="map" ? (
                        <div className='self-start inline-block text-white w-full p-5 m-2 rounded-lg'>
                            {message.message}
                            <Map search={search} />
                            {/* <Map search={searchGalax} /> */}
                        </div>
                    ) : (
                        <div></div>
                    )
                ))}
                </div>

            </div>
    )
}

export default Chat;