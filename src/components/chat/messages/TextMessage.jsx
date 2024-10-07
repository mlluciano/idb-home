import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {tomorrow} from "react-syntax-highlighter/dist/cjs/styles/prism/index.js";
import {unescapeString} from "../../../helpers/parsers.js";
import React from "react";
import {NewTabLink} from "../Chat.jsx";

const TextMessage = ({ message, isUserMessage }) => {
    if (isUserMessage) {
        return (
            <div className="self-end inline-block text-white bg-[#6AAA51] w-2/5 p-3 rounded-lg">
                {message.value}
            </div>
        );
    } else {
        return (
            <div id="sui">
                <ReactMarkdown
                    className="dark-table"
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
                        a: NewTabLink,
                    }}
                >
                    {unescapeString(message.value)}
                </ReactMarkdown>
            </div>
        );
    }
};

export default TextMessage;
