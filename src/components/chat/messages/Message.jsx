import React from "react";
import TextMessage from "./TextMessage.jsx";
import ProcessingMessage from "./ProcessingMessage.jsx";
import MapMessage from "./MapMessage.jsx";

const Message = ({
                     message,
                     index,
                     activeIndex,
                     setActiveIndex,
                     handleArtifactClick,
                 }) => {
    switch (message.type) {
        case 'user_chat_message':
            return <TextMessage message={message} isUserMessage={true} />;
        case 'ai_text_message':
            return <TextMessage message={message} isUserMessage={false} />;
        case 'ai_processing_message':
            return (
                <ProcessingMessage
                    message={message}
                    index={index}
                    activeIndex={activeIndex}
                    setActiveIndex={setActiveIndex}
                />
            );
        case 'ai_map_message':
            return (
                <MapMessage
                    message={message}
                    index={index}
                    handleArtifactClick={handleArtifactClick}
                />
            );
        default:
            return <div key={index}></div>;
    }
};

export default Message;
