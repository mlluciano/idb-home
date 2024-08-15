// ### QueryBuilder
// module for building API queries from Search State object

import fields from './fields';
import _ from 'lodash';
import helpers from './helpers'; // Assuming there's a helpers module used

class QueryBuilder {
  // ### makeQuery DEPRECATED IN FAVOR OF API
  // constructs an Elastic Search query from a search object
  // created with buildSearchObject
  // returns an Elastic Search JSON object.
  // #### parameters
  // 1. so: search objects 
  makeQuery(search) {
    const query = {
      size: search.size,
      from: search.from,
      query: {},
      sort: [{ scientificname: { order: 'asc' } }],
      aggs: {
        recordsets: {
          terms: { field: 'recordset', size: 1000 },
        },
      },
    };

    const matchAll = {
      bool: {
        must: [
          {
            match_all: {},
          },
        ],
      },
    };

    const and = []; // main filter
    const ranges = {}; // collects various range inputs to be added to the and filter

    const fulltext = helpers.strip(search.fulltext);
    const sort = [];
    search.sorting.forEach((item) => {
      if (!_.isEmpty(item.name)) {
        sort.push({ [item.name]: item.order });
      }
    });
    if (!_.isEmpty(sort)) {
      query.sort = sort;
    }
    if (search.image) {
      and.push({ term: { hasImage: true } });
    }
    if (search.geopoint) {
      and.push({ exists: { field: 'geopoint' } });
    }
    search.filters.forEach((filter) => {
      const field = filter.name; // fields.byName[filter.name].term;
      if (filter.exists || filter.missing) {
        const must = {};
        const value = filter.exists ? 'exists' : 'missing';
        must[value] = {
          field: field,
        };
        and.push(must);
      } else if (filter.type === 'text') {
        const lines = helpers.strip(filter.text).split('\n');
        if (lines.length > 1) {
          const terms = [];
          for (const line of lines) {
            const word = lines[line]; // helpers.strip(lines[line]);
            if (!_.isEmpty(helpers.strip(word))) {
              terms.push(word.toLowerCase());
            }
          }
          const term = {
            execution: 'or',
          };
          term[field] = terms;
          if (terms.length > 0) {
            and.push({
              terms: term,
            });
          }
        } else if (!_.isEmpty(helpers.strip(filter.text))) {
          const term = {};
          term[field] = filter.text.toLowerCase();
          and.push({
            term: term,
          });
        }
      } else if (filter.type === 'daterange') {
        const reg = /\d{4}-\d{1,2}-\d{1,2}/;
        const range = {};
        range[field] = {};

        if (reg.test(filter.range.gte)) {
          range[field]['gte'] = filter.range.gte;
        }
        if (reg.test(filter.range.lte)) {
          range[field]['lte'] = filter.range.lte;
        }
        if (!_.isEmpty(range[field])) {
          and.push({
            range: range,
          });
        }
      } else if (filter.type === 'numericrange') {
        const range = {};
        range[field] = {};
        if (filter.range.gte) {
          range[field]['gte'] = parseFloat(filter.range.gte);
        }
        if (filter.range.lte) {
          range[field]['lte'] = parseFloat(filter.range.lte);
        }
        if (!_.isEmpty(range[field])) {
          and.push({
            range: range,
          });
        }
      }
    });

    let geobounds = {}; // collects geobounds field values
    switch (search.mapping.type) {
      case 'box':
        _.each(search.mapping.bounds, (val, key) => {
          _.each(val, (v, k) => {
            if (v && _.isEmpty(geobounds)) {
              geobounds = {
                top_left: {
                  lat: 89.99999,
                  lon: -180.0,
                },
                bottom_right: {
                  lat: -90.0,
                  lon: 179.99999,
                },
              };
            }
            if (v) {
              geobounds[key][k] = parseFloat(v);
            }
          });
        });
        // compile geobounds query
        if (!_.isEmpty(geobounds)) {
          if (geobounds.top_left.lat > 89.99999) {
            geobounds.top_left.lat = 89.99999;
          }
          if (geobounds.bottom_right.lon > 179.99999) {
            geobounds.bottom_right.lon = 179.99999;
          }
          const bounds = {
            geo_bounding_box: {
              geopoint: geobounds,
            },
          };
          and.push(bounds);
        }
        break;

      case 'radius':
        break;
    }

    if (and.length > 0) {
      _.extend(query.query, { filtered: { filter: {} } });
      query.query.filtered.filter.and = and;
      if (!_.isEmpty(fulltext)) {
        _.extend(query.query.filtered, {
          query: {
            match: { _all: { query: fulltext.toLowerCase(), operator: 'and' } },
          },
        });
      }
    } else if (and.length === 0 && !_.isEmpty(fulltext)) {
      query.query['match'] = {
        _all: {
          query: fulltext.toLowerCase(),
          operator: 'and',
        },
      };
    } else if (and.length === 0 && _.isEmpty(fulltext)) {
      query.query = matchAll;
    }

    return query;
  }

  buildQueryShim(search) {
    const idbq = {};
    const reg = /\d{4}-\d{1,2}-\d{1,2}/;
    if (!_.isEmpty(search.fulltext)) {
      idbq['data'] = {
        type: 'fulltext',
        value: search.fulltext,
      };
    }

    search.filters.forEach((item) => {
      const term = item.name; // fields.byName[item.name].term;
      if (item.exists) {
        idbq[term] = { type: 'exists' };
      } else if (item.missing) {
        idbq[term] = { type: 'missing' };
      } else if (item.exact && !_.isEmpty(item.text)) {
        const text = item.text.split('\n'); // user delimits multiple terms with \n
        idbq[term] = {
          type: 'exact',
          text: text.length > 1 ? text : text[0], // single vs multiple term(s)
        };
      } else if (item.fuzzy && !_.isEmpty(item.text)) {
        const text = item.text.split('\n');
        idbq[term] = {
          type: 'fuzzy',
          text: text.length > 1 ? text : text[0], // single vs multiple term(s)
        };
      } else if (item.text && !_.isEmpty(item.text)) {
        const text = item.text.split('\n');
        idbq[term] = text.length > 1 ? text : text[0];
      } else if (item.range && (item.range.gte || item.range.lte)) {
        idbq[term] = { type: 'range' };
        if (item.type === 'daterange') {
          if (reg.test(item.range.gte)) {
            idbq[term]['gte'] = item.range.gte;
          }
          if (reg.test(item.range.lte)) {
            idbq[term]['lte'] = item.range.lte;
          }
        } else if (item.type === 'numericrange') {
          if (item.range.gte) {
            idbq[term]['gte'] = item.range.gte;
          }
          if (item.range.lte) {
            idbq[term]['lte'] = item.range.lte;
          }
        }
      }
    });

    let geobounds = {}; // collects geobounds field values

    switch (search.mapping.type) {
      case 'box':
        _.each(search.mapping.bounds, (val, key) => {
          _.each(val, (v, k) => {
            if (v && _.isEmpty(geobounds)) {
              geobounds = {
                type: 'geo_bounding_box',
                top_left: {
                  lat: 89.99999,
                  lon: -179.99999,
                },
                bottom_right: {
                  lat: -89.99999,
                  lon: 179.99999,
                },
              };
            }
            if (v) {
              geobounds[key][k] = parseFloat(v);
            }
          });
        });
        break;

      case 'radius':
        const b = search.mapping.bounds;

        if (b.distance && b.lat && b.lon) {
          geobounds.type = 'geo_distance';
          geobounds.distance = b.distance + 'km';
          geobounds.lat = parseFloat(b.lat);
          geobounds.lon = parseFloat(b.lon);
        }
        break;
    }

    if (!_.isEmpty(geobounds)) {
      idbq['geopoint'] = geobounds;
    } else if (search.geopoint) {
      idbq['geopoint'] = { type: 'exists' };
    }
    if (search.image) {
      idbq['hasImage'] = true;
    }
    return idbq;
  }

  makeDownloadQuery(search) {
    return this.buildQueryShim(search);
  }

  makeSearchQuery(search) {
    const params = {};
    params['rq'] = this.buildQueryShim(search);
    const sort = [];
    search.sorting.forEach((item) => {
      if (!_.isEmpty(item.name)) {
        sort.push({ [item.name]: item.order });
      }
    });
    if (!_.isEmpty(sort)) {
      params['sort'] = sort;
    }
    params['limit'] = search.size;
    params['offset'] = search.from;

    return params;
  }
}

export default new QueryBuilder();
