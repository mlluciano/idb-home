import React, { useState, useEffect, useRef } from 'react';
import IDBMap from './mapper';
import queryBuilder from './querybuilder';
import './leaflet.css'
import parseQuery from './parsers';

let map; // Declare map variable
const searchDefaults = {
    filters: [
        {
            "name": "scientificname",
            "type": "text",
            "text": "",
            "exists": false,
            "missing": false,
            "fuzzy": false
        },
        {
            "name": "datecollected",
            "type": "daterange",
            "range": {
                "gte": "",
                "lte": ""
            },
            "exists": false,
            "missing": false
        },
        {
            "name": "country",
            "type": "text",
            "text": "",
            "exists": false,
            "missing": false,
            "fuzzy": false
        }
    ],
    fulltext:'',
    image:false,
    geopoint:false,
    sorting: [
        {name: 'genus', order: 'asc'},
        {name: 'specificepithet', order: 'asc'},
        {name: 'datecollected', order: 'asc'}
    ],
    from: 0,
    size: 100,
    mapping: {
        type: "box",
        bounds:{
            top_left:{
                lat: false,
                lon: false
            },
            bottom_right: {
                lat: false,
                lon: false
            }
        }   
    }
}

const Map = (props) => {
    // const [currentQuery, setCurrentQuery] = useState(JSON.stringify(queryBuilder.buildQueryShim(props.search)));
    const [currentQuery, setCurrentQuery] = useState(props.rq);

    const mapRef = useRef(null); // To store the map instance without triggering re-renders
    const searchRef = useRef(props.search);
    
    

    // Equivalent to componentDidMount and componentDidUpdate
    useEffect(() => {
        // let search = searchDefaults
        parseQuery(searchDefaults, props.rq)
        // console.log(search)
        console.log(searchDefaults)

        if (!mapRef.current) {
            let mapID = `map-${props.mapid}`
            // console.log(mapID)
            mapRef.current = new IDBMap(mapID, {
                queryChange: function(query) {
                    var mapping;
                    if (_.has(query, 'geopoint')) {
                        switch (query.geopoint.type) {
                            case 'geo_bounding_box':
                                mapping = {
                                    type: 'box',
                                    bounds: {
                                        top_left: query.geopoint.top_left,
                                        bottom_right: query.geopoint.bottom_right
                                    }
                                };
                                break;
                            case 'geo_distance':
                                mapping = {
                                    type: 'radius',
                                    bounds: {
                                        distance: query.geopoint.distance,
                                        lat: query.geopoint.lat,
                                        lon: query.geopoint.lon
                                    }
                                };
                                break;
                        }
                        props.viewChange('optionsTab', 'mapping');
                        props.searchChange('mapping', mapping);
                    }
                }
            });
            if (mapRef.current) {
                let m = props.maps
                // console.log(props.maps)
                if (m.length!=0) {
                    m.push({
                        "ID": mapID,
                        "rq": props.rq
                    })
                } else {
                    m[0] = mapID
                }
                props.setMaps(m)
            }
        }

        if (!searchRef.current) {
            searchRef.current = searchDefaults
        }

        const query = queryBuilder.buildQueryShim(searchDefaults);
        mapRef.current.query(props.rq);
    }, []);
    console.log(props.maps)

    // Equivalent to UNSAFE_componentWillReceiveProps and shouldComponentUpdate
    useEffect(() => {
        const prevSearch = searchRef.current
        if (prevSearch === props.search) {
            return
        }

        const q = queryBuilder.buildQueryShim(props.search);
        const next = JSON.stringify(q);

        if (next !== currentQuery) {
            setCurrentQuery(next);
            mapRef.current.query(q);
            searchRef.current = props.search
        }
    }, [props.search, currentQuery]);

    return (
        <div id="map-wrapper" className='m-4'>
            <div id={`map-${props.mapid}`}></div>
        </div>
    );
}

export default Map;