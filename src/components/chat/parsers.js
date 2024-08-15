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