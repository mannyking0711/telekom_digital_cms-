# SEARCH ENGINE

## API

### Autocomplete Search

`curl http://localhost:1337/api/autocomplete/search?q&c`
- q: (string) Query Text
- c: (all, article, digi, partner, speaker, podcast, video) Category

### FullText Search

`curl http://localhost:1337/api/autocomplete/autocomplete`
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tr>
<td>q</td>
<td>string</td>
<td>Query Text</td>
</tr>
<tr>
<td>c</td>
<td>string</td>
<td>
Category
<ul>
<li>all</li>
<li>article</li>
<li>digi</li>
<li>partner</li>
<li>speaker</li>
<li>podcast</li>
<li>video</li>
</ul>
</td>
</tr>
<tr>
<td>page</td>
<td>number</td>
<td>Page Number</td>
</tr>
</table>


## Usage
### Hook Index
`src/api/:category/content-types/:category/lifecycles.js`
=>
```
const {indexList} = require("/src/api/autocomplete/constants");

module.exports = {
  ...
  
  async afterCreate(event) {
      await strapi.service("api::autocomplete.autocomplete").indexOne(indexList.article, event.result.id);
  },
  
  async afterUpdate(event) {
      await strapi.service("api::autocomplete.autocomplete").indexOne(indexList.article, event.result.id);
  },
  
  async afterCreate(event) {
      await elasticClient.delete({
        index: ":category",
        id: event.params.where.id
      });
  },
  
  ...
};
```
