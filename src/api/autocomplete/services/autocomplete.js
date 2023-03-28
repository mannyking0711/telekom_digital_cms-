'use strict';

/**
 * autocomplete service
 */

const {createCoreService} = require("@strapi/strapi").factories;
const {elasticClient} = require("../../helper");
const uid = "api::autocomplete.autocomplete"

const {flatten, indexList} = require("../constants");


module.exports = createCoreService(uid, () => ({


  /**
   * GenericType Search
   * @param q {string} | search text
   * @param lang {string} Language code
   * @param category {string} Category name | Index name
   */
  async commonSearch(q, lang, category) {
    let result = [];
    const tokens = q.split(' ');

    /** Dictionary Search */
    const words = await this.dictionarySearch(tokens[tokens.length - 1], lang);
    result = result.concat(words);

    /** Search */
    const documents = await this.wholeTitleSearch(q, lang, category, 1);
    result = result.concat(documents);


    return result;
  },



  /**
   * Search from custom dictionary
   * @param q {string}
   * @param lang {string} Language code
   */
  async dictionarySearch(q, lang) {
    const result = await elasticClient.search({
      index: "dictionary",

      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "word": q
              }
            }
          ],
          "should": {
            "function_score": {
              // "query": {
              //   "query_string": {
              //     "fields": [
              //       "lang"
              //     ],
              //     "query": lang
              //   }
              // },
              "script_score": {
                "script": "return 100/doc['word.raw'].value.length();"
              },
              "boost_mode": "sum"
            }
          }
        }
      },
      "size": 5
    });
    return result.hits.hits.map(it => {
      return {
        keyword: it._source.word,
        category: "word"
      }
    });
  },


  /**
   * Search by fieldName
   * @param q {string} Query Text
   * @param lang {'en' | 'de'}
   * @param indexName {string} Elasticsearch Index Name
   * @param page {number} Page Number
   */
  async wholeTitleSearch(q, lang, indexName, page) {
    let idx = "";
    if (indexName === "all")
      idx = "*,-dictionary";
    else if (indexName === "magazine")
      idx = "article,video,podcast";
    else
      idx = indexName

    const result = await elasticClient.search({
      index: idx,

      "query": {
        "bool": {
          "filter": {
            "term": {
              "status": "published"
            },
          },
          "must": [
            {
              "bool": {
                "should": [
                  {
                    "exists": {
                      "field": "title_en"
                    }
                  },
                  {
                    "exists": {
                      "field": "title_de"
                    }
                  }
                ]
              }
            },
            {
              "multi_match": {
                "query": q,
                "operator": "and",
                "fields": ["title_*^10", "content_*^1"]
              },
            },
            {
              "term": {
                "lang": lang
              }
            }
          ],
          "should": {
            "function_score": {
              "query": {
                "query_string": {
                  "fields": [
                    "title_en.raw",
                    "title_de.raw"
                  ],
                  "query": q.split(' ')[0] + "*"
                }
              },
              "script_score": {
                "script": `
                    def len = 0;
                    def value = (doc['title_de.raw'].size() == 0 ? doc['title_en.raw'].value : doc['title_de.raw'].value);
                    while (value.length() > len && value.charAt(len) != ' '.charAt(0)) len ++;
                    return 1000/len;
                  `.trim()
              },
              "boost_mode": "sum"
            }
          }
        }
      },
      "from": (page - 1) * 5,
      "size": 5,
      "highlight": {
        "fields": {
          "title_en": {
            "fragment_size": 200
          },
          "title_de": {
            "fragment_size": 200
          }
        }
      }
    });
    return result.hits.hits.map(it => {
      return {
        id: it._id,
        keyword: it.highlight ? it.highlight["title_" + it._source.lang][0] : it._source["title_" + it._source.lang],
        category: it._index,
        meta_description: it._source.meta_description,
        slug_en: it._source.slug_en,
        slug_de: it._source.slug_de,
        group_en: it._source.group_en,
        group_de: it._source.group_de
      }
    });
  },


  /**
   * Language analysis ("en" | "de" | null) from freetext
   * @param content {string}
   * @return If language detection failed, keep going current state.
   */
  async detectLang(content) {
    const result = (await elasticClient.ingest.simulate({
      "pipeline": {
        "processors": [
          {
            "inference": {
              "model_id": "lang_ident_model_1",
              "field_mappings": {
                "contents": "text"
              },
              "target_field": "lang"
            }
          }
        ]
      },
      "docs": [
        {
          "_source": {
            "contents": content
          }
        }
      ]
    })).docs[0].doc._source.lang.predicted_value;

    if (result !== 'en' || result !== 'de')
      return null;

    return result;
  },


  /**
   * Delete old one & Create new Elasticsearch Index
   * @param indexName {string} ES Index Name
   */
  async createIndex(indexName) {
    try {
      // Main Index
      await elasticClient.indices.delete({index: indexName});
    } catch (e) {
    }

    try {
      await elasticClient.indices.create({
        index: "dictionary",

        "settings": {
          "analysis": {
            "filter": {
              "autocomplete_filter": {
                "type": "edge_ngram",
                "min_gram": 2,
                "max_gram": 20
              }
            },
            "analyzer": {
              "autocomplete": {
                "type": "custom",
                "tokenizer": "standard",
                "filter": [
                  "lowercase",
                  "autocomplete_filter"
                ]
              }
            },
            "normalizer": {
              "keyword_lowercase": {
                "type": "custom",
                "filter": [
                  "lowercase"
                ]
              }
            }
          }
        },
        "mappings": {
          "properties": {
            "word": {
              "type": "text",
              "analyzer": "autocomplete",
              "search_analyzer": "standard",
              "fields": {
                "raw": {
                  "type": "keyword",
                  "normalizer": "keyword_lowercase"
                }
              }
            },
            "lang": {
              "type": "keyword"
            },
            "slug_en": {
              "type": "keyword"
            },
            "slug_de": {
              "type": "keyword"
            }
          }
        }
      });
    } catch (e) {
    }

    try {
      await elasticClient.indices.create({
        index: indexName,

        "settings": {
          "analysis": {
            "tokenizer": {
              "edge_ngram_tokenizer": {
                "type": "edge_ngram",
                "min_gram": 2,
                "max_gram": 20,
                "token_chars": [
                  "letter"
                ]
              }
            },
            "filter": {
              "english_stop": {
                "type": "stop",
                "stopwords": "_english_"
              },
              "english_synonym": {
                "type": "synonym",
                "synonyms_path": "dic/synonyms_en.txt"
              },
              "english_keywords": {
                "type": "keyword_marker",
                "keywords": [
                  "example"
                ]
              },
              "english_stemmer": {
                "type": "stemmer",
                "language": "english"
              },
              "english_possessive_stemmer": {
                "type": "stemmer",
                "language": "possessive_english"
              },
              "german_stop": {
                "type": "stop",
                "stopwords": "_german_"
              },
              "german_synonym": {
                "type": "synonym",
                "synonyms_path": "dic/synonyms_de.txt"
              },
              "german_keywords": {
                "type": "keyword_marker",
                "keywords": [
                  "Beispiel"
                ]
              },
              "german_stemmer": {
                "type": "stemmer",
                "language": "light_german"
              }
            },
            "analyzer": {
              "title_en_analyzer": {
                "type": "custom",
                "tokenizer": "edge_ngram_tokenizer",
                "filter": [
                  "lowercase"
                ]
              },
              "title_de_analyzer": {
                "type": "custom",
                "tokenizer": "edge_ngram_tokenizer",
                "filter": [
                  "lowercase"
                ]
              },
              "content_en_analyzer": {
                "type": "custom",
                "tokenizer": "classic",
                "filter": [
                  "lowercase",
                  "english_stop",
                  "english_synonym",
                  "english_keywords",
                  "english_stemmer",
                  "english_possessive_stemmer"
                ],
                "char_filter": [
                  "html_strip"
                ]
              },
              "content_de_analyzer": {
                "type": "custom",
                "tokenizer": "classic",
                "filter": [
                  "lowercase",
                  "german_stop",
                  "german_synonym",
                  "german_keywords",
                  "german_normalization",
                  "german_stemmer"
                ],
                "char_filter": [
                  "html_strip"
                ]
              }
            },
            "normalizer": {
              "keyword_lowercase": {
                "type": "custom",
                "filter": [
                  "lowercase",
                  "trim"
                ]
              }
            }
          }
        },
        "mappings": {
          "properties": {
            "status": {
              "type": "keyword"
            },
            "lang": {
              "type": "keyword"
            },
            "title_en": {
              "type": "text",
              "analyzer": "title_en_analyzer",
              "search_analyzer": "standard",
              "fields": {
                "raw": {
                  "type": "keyword",
                  "normalizer": "keyword_lowercase"
                }
              }
            },
            "title_de": {
              "type": "text",
              "analyzer": "title_de_analyzer",
              "search_analyzer": "standard",
              "fields": {
                "raw": {
                  "type": "keyword",
                  "normalizer": "keyword_lowercase"
                }
              }
            },
            "content_en": {
              "type": "text",
              "analyzer": "content_en_analyzer",
              "search_analyzer": "content_en_analyzer"
            },
            "content_de": {
              "type": "text",
              "analyzer": "content_de_analyzer",
              "search_analyzer": "content_en_analyzer"
            },
            "meta_description": {
              "type": "keyword"
            }
          },
          "date_detection": true
        }
      });

      return true;

    } catch (e) {
      return false;
    }
  },


  /**
   * Merge all data from MySQL
   * @param indexName {string} ES Index Name
   * @param lastUpdated  {Date | undefined} Last Updated Date
   * @param currentDate {Date | undefined} Current Date
   */
  async migrateFromMySQL(indexName, lastUpdated, currentDate) {
    const indexFunc = indexList.find(it => it.name === indexName);
    if (indexFunc !== undefined) {

      const whereClause = {updated_at: {}};
      if (lastUpdated) {
        whereClause.updated_at.$gt = lastUpdated.toISOString();
        if (lastUpdated)
          whereClause.updated_at.$lte = currentDate.toISOString();
      }

      const count = await strapi.db.query(indexFunc.uid).count({
        where: whereClause
      });

      for (let i = 0; i < count; i += 100) {
        // START --- for total count
        strapi.log.info(`${indexFunc.name} Indexing   .....   ${i}/${count}`)

        const ids = await strapi.db.query(indexFunc.uid).findMany({
          select: ["id"],
          where: whereClause,
          offset: i,
          limit: 100
        });


        for (let i = 0; i < ids.length; i++) {
          // START --- for ids length

          /** Index document one by one */
          await this.indexOne(indexFunc, ids[i].id);

          // END --- for dataset length
        }


        // END --- for total count
      }

      strapi.log.info(`${indexName} all indexed!`);

    } else {

      strapi.log.error(`${indexName} Index does not exist!`);

    }
  },


  /**
   * Index one document : article, digi, podcast, speaker, partner, video
   * @param index {{name: string, rowToDoc: Function, uid: string}} ES Index Name
   * @param id {number}
   */
  async indexOne(index, id) {
    const document = await strapi.service(index.uid).getEntity(id);
    const esDoc = index.rowToDoc(document);
    await elasticClient.index({
      index: index.name,
      id: document.id,
      document: esDoc
    });


    // TODO: use prepared dictionary for high performance
    /** In order to get words, tokenize name */

    const tokenList = (await elasticClient.indices.analyze({
      "tokenizer": "letter",
      "filter": ["lowercase"],
      "char_filter": ["html_strip"],
      "text": flatten(esDoc)
    })).tokens;
    const dicOps = tokenList
      .filter(it => it.token.length > 2)
      .flatMap(it => [
        {index: {_index: "dictionary", _id: it.token}},
        {"word": it.token, "lang": esDoc.lang}
      ]);

    /** Index new words */
    try {
      if (dicOps.length) {
        await elasticClient.bulk({
          index: "dictionary",
          body: dicOps
        });
      }
    } catch (e) {
      console.log(e.message);
    }
  },


  /**
   * Get Indices Health
   */
  async getIndexHealth() {
    const indicesHealth = await elasticClient.cat.indices({format: 'json'})
    return indicesHealth.filter(it => {
      return indexList.find(index => index.name === it.index);
    });
  },

  /**
   * Get Last Index Time
   */
  async getLastIndexTime() {
    const record = await strapi.db.query(uid).findOne({
      orderBy: {id: 'DESC'},
      limit: 1
    });
    if (record)
      return new Date(record.update_st_dt);
    else
      return undefined;
  },

}));
