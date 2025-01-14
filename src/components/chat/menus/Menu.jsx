import {Icon, IconGroup, Popup} from "semantic-ui-react";
import React, {useState} from "react";
import {streamMessages_OBOE} from "../../../helpers/parsers.js";
import NewChatModal from "./NewChatModal.jsx";
import {useAuth} from "react-oidc-context";

const options = [
    {
        trigger: <IconGroup size='large'>
                    <Icon inverted link color='orange' name='chat'/>
                    <Icon inverted corner link color='white' name='plus'/>
                </IconGroup>,
        content: "Start new chat"
    }
]

const Menu = ({
                  newChatModalOpen,
                  setNewChatModalOpen,
                  clear,
                  setMessages,
                  setLoading,
                  openChat,
                  setOpenChat,
                  currentConversation,
                  setCurrentConversation,
 }) => {
    const [input, setInput] = useState('')
    const auth = useAuth()

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
            let new_uuid = crypto.randomUUID()

            const user_message = {
                type: "user_chat_message",
                value: input
            }
            clear() // start_over() in Chat.jsx
            setMessages([user_message])
            setNewChatModalOpen(false)
            setLoading(true)
            if (!openChat) {
                setOpenChat(true)
            }
            setInput('')
            streamMessages_OBOE(user_message, setMessages, setInput, setLoading, auth, new_uuid)
            setCurrentConversation(new_uuid)
        }
    }

    return (
        <div id="sui" className='flex justify-end'>
            <NewChatModal
                newChatModalOpen={newChatModalOpen}
                setNewChatModalOpen={setNewChatModalOpen}
                input={input} setInput={setInput}
                startNewChat={startNewChat}
                setMessages={setMessages}
            />
        </div>
    )
}

export default Menu;
