import React, {useEffect, useRef, useState} from "react";
import {Form, TextArea} from "semantic-ui-react";
import Message from "./Message.jsx";

const Messages = ({
                      messages,
                      currentMessage,
                      currentInput,
                      setCurrentInput,
                      handleSubmit,
                      setActiveArtifactIndex,
                      artifactOpen,
                      setArtifactOpen,
                      setIsVisible,
                  }) => {

    const [activeIndex, setActiveIndex] = useState();

    const divRef = useRef(null);

    useEffect(() => {
        if (divRef.current) {
            divRef.current.scrollTop = divRef.current.scrollHeight;
        }
    }, [currentMessage, messages]);

    const handleArtifactClick = (key) => {
        console.log(key)
        setActiveArtifactIndex(key);

        if (!artifactOpen) {
            setArtifactOpen(!artifactOpen);
            setTimeout(() => setIsVisible(true), 50);
        }

    };

    return (
        <div
            ref={divRef}
            id="messages"
            className="relative flex flex-col flex-1 justify-start items-center text-white max-w-5xl"
        >
            <div className="flex flex-col flex-1 w-full gap-5 bg-zinc-700 border-zinc-600 border p-5 rounded border-box">
                {messages.map((message, key) => (
                    <Message
                        key={key}
                        message={message}
                        index={key}
                        activeIndex={activeIndex}
                        setActiveIndex={setActiveIndex}
                        handleArtifactClick={handleArtifactClick}
                    />
                ))}
                {currentMessage && (
                    <Message
                        key={activeIndex}
                        message={currentMessage}
                        index={activeIndex}
                        activeIndex={activeIndex}
                        setActiveIndex={setActiveIndex}
                        handleArtifactClick={handleArtifactClick}
                    />
                )}
                <div id="sui" className="flex">
                    <Form className="flex w-full justify-center">
                        <TextArea
                            onKeyDown={(e) => {
                                if (e.keyCode === 13 && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            value={currentInput}
                            onChange={(e) => {
                                setCurrentInput(e.target.value);
                            }}
                            placeholder="Message iDigBio"
                            className="flex justify-center text-white bg-zinc-700 border rounded-lg border-zinc-500"
                            rows={1}
                        />
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default Messages;
