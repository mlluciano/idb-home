import React from 'react';
import { Form, TextArea, Button, Icon } from 'semantic-ui-react';

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
        {role: "ai", message: "Yes, there are according to iDigBio data"},
        {role: "user", message: "Are there Ursos Arctos in the United States?"},
        {role: "ai", message: "---------END--------"},
    ]
}

const footerHeight = 140
const contentHeight = `calc(100vh - ${footerHeight}px)`;
const Chat = () => {

    return (
        <div className='flex item-center justify-center w-screen h-screen bg-zinc-800'>
            <img className='absolute top-0 left-0 m-2' src="https://portal.idigbio.org/portal/img/idigbio_logo.png" alt="iDigBio" border="0" id="logo"></img>

            <Messages chat={chat} />

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
                    ) : ( // role: "ai"
                        <div key={key} className='self-start inline-block text-white w-full p-5 m-2 rounded-lg'>
                            {message.message}
                        </div>
                    )
                ))}
                </div>

            </div>
    )
}

export default Chat;