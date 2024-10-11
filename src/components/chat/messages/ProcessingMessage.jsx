import {Accordion, Button, Icon} from "semantic-ui-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {tomorrow} from "react-syntax-highlighter/dist/cjs/styles/prism/index.js";
import {unescapeString} from "../../../helpers/parsers.js";
import React, {useState} from "react";
import {NewTabLink} from "../Chat.jsx";

function extractJsonFromMarkdown(markdown) {
    // Regular expression to match content inside ```json blocks
    const jsonBlockRegex = /```json\n([\s\S]*?)\n```/;
    // Extract the content inside the ```json block
    const match = markdown.match(jsonBlockRegex);
    if (match && match[1]) {
        // Return the raw content inside the ```json block, trimming any leading/trailing whitespace
        return match[1].trim();
    }
    return null;
}

const ProcessingMessage = ({ message, index, activeIndex, setActiveIndex }) => {
    const [copied, setCopied] = useState(false)

    const copyQuery = () => {
        try {
            const json = extractJsonFromMarkdown(message.value.content)
            navigator.clipboard.writeText(json)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.log(e)
        }
    }

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
                    <div className='flex justify-end'>
                        <Button onClick={() => copyQuery()} icon={copied ? "clipboard check" : "clipboard"} size="tiny">
                            <Icon name={copied ? "clipboard check" : "clipboard"}/>
                            {copied ? "Copied!" : "Copy"}
                        </Button>
                    </div>
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
