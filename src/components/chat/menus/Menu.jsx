import {Button, Header, Icon, IconGroup, Modal, ModalActions, ModalContent, Popup, TextArea} from "semantic-ui-react";
import React, {useState} from "react";
import {streamMessages_OBOE} from "../../../helpers/parsers.js";
import NewChatModal from "./NewChatModal.jsx";

const options = [
    // {
    //     trigger: <Icon link size='large' color='grey' name='star'/>,
    //     content: "Save this chat"
    // },
    // {
    //     trigger:  <Icon link size='large' color='grey' name='sliders horizontal'/>,
    //     content: "Chat preferences"
    // },
    {
        trigger: <IconGroup size='large'>
                    <Icon inverted link color='orange' name='chat'/>
                    <Icon inverted corner link color='white' name='plus'/>
                </IconGroup>,
        content: "Start new chat"
    }
]

const Menu = ({newChatModalOpen, setNewChatModalOpen, clear, setMessages, setLoading, openChat, setOpenChat}) => {
    const [input, setInput] = useState('')

    const handleCLick = (option) => {
        switch (option) {
            case "Save this chat":
                break;
            case "Chat preferences":
                break;
            case "Start new chat":
                setNewChatModalOpen(true)
                break;
            default:
                console.log('Invalid option.')
        }
    }

    const startNewChat = () => {
        if (input!== '' ) {
            const user_message = {
                type: "user_chat_message",
                value: input
            }
            clear()
            setMessages([user_message])
            setNewChatModalOpen(false)
            setLoading(true)
            if (!openChat) {
                setOpenChat(true)
            }
            setInput('')
            streamMessages_OBOE(user_message, setMessages, setInput, setLoading)
        }
    }

    return (
        <div id="sui" className='flex justify-end p-5 gap-5'>
            {options.map((icon, index) => (
                <Popup
                    trigger={
                        <button onClick={() => handleCLick(icon.content)}>{icon.trigger}</button>
                    }
                    content={icon.content}
                    style={{backgroundColor: 'black', color: 'white', padding: '5px', marginTop: '5px', fontSize: '12px'}}
                    position="bottom right"
                />
            ))}

            <NewChatModal
                newChatModalOpen={newChatModalOpen}
                setNewChatModalOpen={setNewChatModalOpen}
                input={input} setInput={setInput}
                startNewChat={startNewChat}
            />

        </div>
    )
}

export default Menu;
