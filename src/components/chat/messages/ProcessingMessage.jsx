import {Accordion, Icon} from "semantic-ui-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {tomorrow} from "react-syntax-highlighter/dist/cjs/styles/prism/index.js";
import {unescapeString} from "../../../helpers/parsers.js";
import React from "react";
import {NewTabLink} from "../Chat.jsx";

const ProcessingMessage = ({ message, index, activeIndex, setActiveIndex }) => {
    return (
        <div
            id="sui"
            className="self-start inline-block text-white w-full rounded-lg"
        >
            <Accordion>
                <Accordion.Title
                    active={activeIndex === index}
                    index={index}
                    onClick={() => {
                        activeIndex === index ? setActiveIndex(-1) : setActiveIndex(index);
                    }}
                >
                    <div className="flex">
                        <Icon name="dropdown" />
                        <div className="text-slate-400">{message.value.summary}</div>
                    </div>
                </Accordion.Title>
                <Accordion.Content
                    active={activeIndex === index}
                    className="bg-black p-4"
                >
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
                            a: NewTabLink,
                        }}
                    >
                        {unescapeString(message.value.content)}
                    </ReactMarkdown>
                </Accordion.Content>
            </Accordion>
        </div>
    );
};

export default ProcessingMessage;
