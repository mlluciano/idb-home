import fields from "./constants/fields";
import oboe from 'oboe';
import config from "../../config/config.js"
export const streamMessages_OBOE = async (message, setMessages, setCurrentMessage, setLoading, auth, currentConversation) => {
  try {
    const requestBody = {
      ...message,
      conversation_id: currentConversation
    }
    
    let oboe_config = {
        url: auth?.user ? `${config.api_url}/chat-protected` : `${config.api_url}/chat`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json-stream',
        },
        body: JSON.stringify(requestBody),
        withCredentials: true,
        data: {
            conversation_id: currentConversation
        }
    }

    if (auth?.user?.access_token) {
        oboe_config.headers.Authorization = `Bearer ${auth.user.access_token}`
    }
    const isFreshStart = message.fresh_start;
    oboe(oboe_config)
    .node('!.*', function(message) {
      if (message && message.type) {
        switch (message.type) {
          case 'ai_text_message':
            if (message.value && message.value.trim()) {
              setCurrentMessage(undefined);
                setMessages(prevMessages => {
                    if (isFreshStart && prevMessages.length === 1) { // there are 2 initial messages on startup - this prevents duplicates due to re-rendering logic
                        if (message==="Before we can chat, please confirm you are a real person by telling me \"I am not a robot\".") {
                            return [...prevMessages, message];
                        } else {
                            return [...prevMessages];
                        }
                    }
                    return [...prevMessages, message];
                });
            }
            break;
          case 'ai_processing_message':
          case 'ai_map_message':
            if (message.value) {
              setMessages(prevMessages => [...prevMessages, message]);
            }
            break;
          default:
            console.log('Unknown message type:', message.type);
        }
      }
      return oboe.drop; // This tells oboe to discard the node after we've processed it
    }).done(() => {
        setLoading(false)
    })
    .fail(function(error) {
      console.error('Error fetching data:', error);
    });
  } catch (error) {
    console.error('Error setting up oboe:', error);
  }
};

function newFilterProps(term){
    const type = fields.byTerm[term].type;
    switch (type) {
        case 'text':
            return { name: term, type: type, text: '', exists: false, missing: false, fuzzy: false };
        case 'daterange':
            return { name: term, type: type, range: { gte: '', lte: '' }, exists: false, missing: false };
        case 'numericrange':
            return { name: term, type: type, range: { gte: false, lte: false }, exists: false, missing: false };
        default:
            return null;
    }
};

export const unescapeString = (str) => {
    return str
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\\ud83d\\ude0a/g, '😊');
};

export const streamMessages_OLD = async (message, setMessages, setCurrentMessage) => {
    try {
      const response = await fetch(`${config.api_url}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json-stream',
        },
        body: JSON.stringify(message),
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let isInArray = false;
      let currentType = null;
      let isParsingValue = false;
      let valueBuffer = '';

      const processText = (text) => {

        buffer += text;
        let startIndex = 0;

        while (startIndex < buffer.length) {
          if (!isInArray && buffer[startIndex] === '[') {
            isInArray = true;
            startIndex++;
            continue;
          }

          if (!isInArray) {
            startIndex++;
            continue;
          }

          if (currentType === null) {
            const typeMatch = /"type"\s*:\s*"([^"]+)"/.exec(buffer.slice(startIndex));
            if (typeMatch) {

              currentType = typeMatch[1];
              startIndex += typeMatch.index + typeMatch[0].length;
              if (currentType === 'ai_text_message') {
                isParsingValue = true;
                valueBuffer = ''; // Reset valueBuffer for new message
              } else if (currentType==="ai_map_message" || currentType==="ai_processing_message") {
                isParsingValue=false
                valueBuffer = ''
              }
            } else {

              break; // Wait for more data
            }
          }

          if (isParsingValue) {
            const valueStart = buffer.indexOf('"value"', startIndex);

            if (valueStart !== -1) {
              const valueContentStart = buffer.indexOf('"', valueStart + 7) + 1;

              let valueEnd = valueContentStart;
              let inEscape = false;
              while (valueEnd < buffer.length) {
                if (buffer[valueEnd] === '"' && !inEscape) {
                  break;
                }
                if (buffer[valueEnd] === '\\') {
                  inEscape = !inEscape;
                } else {
                  inEscape = false;
                }
                valueEnd++;
              }

              if (valueEnd < buffer.length) {
                // We have a complete value
                valueBuffer = buffer.slice(valueContentStart, valueEnd);

                if (currentType && valueBuffer.trim()) {

                    const newMessage = { type: currentType, value: valueBuffer }
                  setCurrentMessage({});
                  setMessages(prevMessages => [...prevMessages, newMessage]);
                }
                currentType = null;
                isParsingValue = false;
                valueBuffer = '';
                startIndex = valueEnd + 1;
              } else {
                // Incomplete value, update current message and wait for more

                valueBuffer = buffer.slice(valueContentStart);
                // console.log('INCOMPLETE: ' + valueBuffer)
                if (currentType && valueBuffer.trim()) {
                    const newMessage = { type: currentType, value: valueBuffer }
                  setCurrentMessage(newMessage);
                }
                break;
              }
            } else {
              break; // Wait for more data
            }
          } else {

            if (currentType==='ai_processing_message' || currentType==='ai_map_message') {
                const valueStart = buffer.indexOf('"value"', startIndex);
                if (valueStart!==-1) {
                    const valueContentStart = buffer.indexOf('{', valueStart)

                    let objectEnd =  valueContentStart
                    let objectDepth = 1;


                    while (objectEnd < buffer.length && objectDepth > 0) {
                        if (buffer[objectEnd] === '{') {
                            objectDepth++;
                        } else if (buffer[objectEnd] === '}') {
                            objectDepth--;
                        }
                        objectEnd++;
                    }

                    if (objectEnd < buffer.length) {
                        valueBuffer = buffer.slice(valueContentStart, objectEnd-1);
                        let newMessage = {
                            type: currentType,
                            value: JSON.parse(valueBuffer)
                        }
                        setMessages(prevMessages => [...prevMessages, newMessage]);
                        startIndex = objectEnd + 1;
                        valueBuffer=''
                        currentType = null;
                    } else {
                        valueBuffer = buffer.slice(valueContentStart)
                        break
                    }
                } else {
                    break;
                }
            }
          }
        }
        buffer = buffer.slice(startIndex);
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        processText(decoder.decode(value, { stream: true }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

export const streamMessages = async (message) => {
    const response = await fetch(`${config.api_url}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json-stream',
        },
        body: JSON.stringify(message),
        credentials: "include"
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let isInArray = false;
    let currentType = null;
    let isParsingValue = false;
    let valueBuffer = '';
    let stack = []
    let typeMatch

    const processText = (text) => {
        buffer += text
        let startIndex = 0;

        while (startIndex<buffer.length) {
            if (!isInArray && buffer[startIndex] === '[') {
                isInArray = true;
                startIndex++;
                continue;
            }

            if (!isInArray) {
                startIndex++;
                continue;
            }

            if (currentType===null) {
                typeMatch = /"type"\s*:\s*"([^"]+)"/.exec(buffer.slice(startIndex));
                if (typeMatch) {
                    console.log(typeMatch)
                    currentType = typeMatch[1];
                    startIndex += typeMatch.index + typeMatch[0].length;
                    valueBuffer=''
                    isParsingValue = true
                } else {
                    break
                }
            }

            if (isParsingValue) {
                const valueStart = buffer.indexOf('"value"', startIndex);

                if (valueStart!==-1) {
                    let valueContentStart
                    let valueEnd = -1
                    let inEscape = false;

                    while (valueEnd<buffer.length) {
                        if (typeMatch==='ai_text_message') {
                            valueContentStart = buffer.indexOf('"', valueStart + 7) + 1;
                            valueEnd = valueContentStart
                            while (valueEnd<buffer.length) {
                                if (buffer[valueEnd] === '"' && !inEscape) {
                                    break;
                                }
                                if (buffer[valueEnd] === '\\') {
                                    inEscape = !inEscape;
                                } else {
                                    inEscape = false;
                                }
                                valueEnd++;
                            }

                        } else if (typeMatch==='ai_processing_message' || 'ai_map_message') {
                            valueContentStart = buffer.indexOf('{', valueStart + 7) + 1;
                            valueEnd = valueContentStart
                            while (valueEnd<buffer.length) {
                                if (buffer[valueEnd]==='}' && !inEscape) {
                                    if (stack.slice(-1)[0]=='{') {
                                        if (stack.length===1) {
                                            break
                                        } else {
                                            stack.pop()
                                        }
                                    }

                                }
                                if (buffer[valueEnd]==='{') {
                                    stack.push('{')
                                }
                                if (buffer[valueEnd]==='\\') {
                                    inEscape = !inEscape
                                }
                                else {
                                    inEscape = false
                                }
                                valueEnd++
                            }
                        }


                    }

                    if (valueEnd<buffer.length) {
                        // Complete Value
                        valueBuffer = buffer.slice(valueContentStart, valueEnd);
                        if (currentType && valueBuffer) {
                            const newMessage = { type: currentType, value: valueBuffer }
                            setCurrentMessage({});
                            setMessages((prevMessages) => [...prevMessages, newMessage]);
                        }
                        currentType = null;
                        isParsingValue = false;
                        valueBuffer = '';
                        startIndex = valueEnd + 1;
                        stack = []
                    } else {
                        if (currentType==='ai_text_message') {
                            valueBuffer = buffer.slice(valueContentStart);
                            if (currentType && valueBuffer.trim()) {
                                const newMessage = { type: currentType, value: valueBuffer }
                                setCurrentMessage(newMessage);
                            }
                            break;
                        }
                        break
                    }
                }
            }
        }
        buffer = buffer.slice(startIndex);
    }
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        processText(decoder.decode(value, { stream: true }));
    }
}

export default function parseQuery(search, query) {
    try{
        var rq = JSON.parse(query);
        var filters=[],filter;
        _.forOwn(rq,function(v,k){
            if(k==='data'){
                if(_.isObject(v) && _.isString(v.type) && v.type === 'fulltext'){
                    search.fulltext = v.value;
                }
            }else if(k==='hasImage' && _.isBoolean(v)){
                search.image = v;
            }else if(k==='hasMedia' && _.isBoolean(v)){
                search.image = v;
            }else if(k==='geopoint' && _.isObject(v)){
                if(v.type === 'geo_bounding_box'){
                    delete v.type
                    _.assign(search.mapping.bounds, v);
                }else if(v.type === 'exists' || v.type === 'missing'){
                    search.geopoint = v.type === 'exists' ? true : false;
                }
            }else if(_.isObject(fields.byTerm[k])){
                filter = newFilterProps(k);
                if(_.isObject(v) && _.isString(v.type)){
                    if(v.type === 'exists' || v.type === 'missing'){
                        filter[v.type] = true;
                    }else if(v.type === 'range'){
                        delete v.type;
                        _.assign(filter.range,v);
                    }
                }else if(_.isString(v)){
                    filter.text = v;
                }else if(_.isArray(v)){
                    filter.text = v.join('\n');
                }
                filters.unshift(filter);
            }
        });
        if(filters.length > 0){
            search.filters = filters;
        }
    }catch(e){
        //fail parsing silently
    }

}
