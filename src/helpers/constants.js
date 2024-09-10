export const initialSearch = {
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