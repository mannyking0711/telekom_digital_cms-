const axios = require('axios');

// Fetch the most "read" content of a specific type
// during a specifc period from matomo and store it
// in strapis database.
module.exports = async (type, period, urlAppendix) => {
  // validation
  if (!['article', 'podcast', 'video'].includes(type)) return;
  if (!['day', 'week', 'month'].includes(period)) return;

  // Set date range
  const today = new Date();
  let firstDate = new Date();
  if (period === 'day') {
    firstDate.setDate(today.getDate() - 1);
  } else if (period === 'week') {
    firstDate.setDate(today.getDate() - 7);
  } else if (period === 'month') {
    firstDate.setDate(today.getDate() - 30);
  }
  const dateRange = firstDate.toISOString().slice(0, 10) + ',' + today.toISOString().slice(0, 10);

  // fetch data from matomo
  let urlType = type === 'article' ? 'artikel' : type;
  let url = strapi.config.get('matomo.url');
  url += `?token_auth=${strapi.config.get('matomo.token')}`;
  url += '&format=json';
  url += '&idSite=1';
  url += '&module=API';
  url += '&method=Actions.getPageUrls';
  url += `&date=${dateRange}`;
  url += '&period=range';
  url += '&flat=1';
  url += '&filter_limit=4';
  url += `&filter_pattern=magazin/${urlType}/`;
  url += urlAppendix ? `${urlAppendix}/` : '';

  // handle response
  const {data} = await axios.get(url);
  const impressionsType = {item_type: type, period};

  // error from matomo stop code execution
  if (data.result && data.result === 'error') return;

  // update impressions
  if (Object.values(data).length > 0) {

    // delete old data
    await strapi.query('impressions').delete(impressionsType);

    // insert new data
    Object.values(data).forEach(async (item) => {
      let urlSegements = item.label.split('/');
      await strapi.query('impressions').create({
        item_id: urlSegements[urlSegements.length - 1], // slug
        count: item.nb_visits, // number of visits
        ...impressionsType
      });
    });
  }
};
