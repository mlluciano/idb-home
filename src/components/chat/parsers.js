import fields from "./fields";

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

export const streamMessages = async (message) => {
    const response = await fetch('http://sobami2.acis.ufl.edu:8080/chat', {
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