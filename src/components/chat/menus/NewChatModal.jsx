import {Header, Modal, ModalContent, TextArea} from "semantic-ui-react";
import React from "react";


const NewChatModal = ({newChatModalOpen, setNewChatModalOpen, startNewChat, input, setInput, setMessages}) => {
    return (
        <Modal
            id="sui"
            open={newChatModalOpen}
            onClose={() => setNewChatModalOpen(false)}
            header='Reminder!'
            content='Call Benjamin regarding the reports.'
            actions={['Snooze', { key: 'done', content: 'Done', positive: true }]}
            mountNode={document.getElementById("sui")}
            closeIcon
        >
            <Header as="div" className="bg-zinc-700 text-white">New Chat</Header>
            <ModalContent as="div" className='flex flex-col w-full bg-zinc-700'>
                <TextArea
                    className='flex justify-center border rounded-lg bg-zinc-700 text-white w-full p-2'
                    onKeyDown={(e) => {
                        if (e.keyCode === 13 && !e.shiftKey) {
                            e.preventDefault();
                            setMessages([])
                            startNewChat();
                        }
                    }}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={"What can I help you with?"}
                />
            </ModalContent>
        </Modal>
    )
}

export default NewChatModal;
