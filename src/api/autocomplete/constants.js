const {UID} = require("../uids");
const indexList = [
  {
    name: "article",
    rowToDoc: (row) => {
      const doc = {};
      doc.status  = row.status;
      doc.lang    = row.locale;
      doc.slug_en = row.slug_en;
      doc.slug_de = row.slug_de;
      doc.group_en = row.group_en;
      doc.group_de = row.group_de;
      doc["title_" + row.locale]    = row.title;
      doc["content_" + row.locale]  = row.content;
      doc.meta_description = row.meta_description;
      return doc;
    },
    uid: UID.autocomplete
  },
  {
    name: "digi",
    rowToDoc: (row) => {
      const doc = {};
      doc.status  = "published";
      doc.lang    = row.locale;
      doc.slug_en = row.slug_en;
      doc.slug_de = row.slug_de;
      doc["title_" + row.locale]    = row.name;
      doc["content_" + row.locale]  = row.name;
      doc.meta_description = row.meta_description;
      return doc;
    },
    uid: UID.digi_index_sector
  },
  {
    name: "partner",
    rowToDoc: (row) => {
      const doc = {};
      doc.status  = row.status;
      doc.lang    = row.locale;
      doc.slug_en = row.slug_en;
      doc.slug_de = row.slug_de;
      doc["title_" + row.locale]    = row.name;
      doc["content_" + row.locale]  = row.content;
      doc.meta_description = row.meta_description;
      return doc;
    },
    uid: UID.partner
  },
  {
    name: "podcast",
    rowToDoc: (row) => {
      const doc = {};
      doc.status  = row.status;
      doc.lang    = row.locale;
      doc.slug_en = row.slug_en;
      doc.slug_de = row.slug_de;
      doc.group_en = row.group_en;
      doc.group_de = row.group_de;
      doc["title_" + row.locale]    = row.title;
      doc["content_" + row.locale]  = row.shownotes;
      doc.meta_description = row.meta_description;
      return doc;
    },
    uid: UID.podcast
  },
  {
    name: "speaker",
    rowToDoc: (row) => {
      const doc = {};
      doc.status  = row.status;
      doc.lang    = row.locale;
      doc.slug_en = row.slug_en;
      doc.slug_de = row.slug_de;
      doc["title_" + row.locale]    = row.fullname;
      doc["content_" + row.locale]  = row.description;
      doc.meta_description = row.meta_description;
      return doc;
    },
    uid: UID.speaker
  },
  {
    name: "video",
    rowToDoc: (row) => {
      const doc = {};
      doc.status  = row.status;
      doc.lang    = row.locale;
      doc.slug_en = row.slug_en;
      doc.slug_de = row.slug_de;
      doc.group_en = row.group_en;
      doc.group_de = row.group_de;
      doc["title_" + row.locale]    = row.title;
      doc["content_" + row.locale]  = row.description;
      doc.meta_description = row.meta_description;
      return doc;
    },
    uid: UID.video
  },
]

module.exports = {
  indexList,
  flatten: (doc) => {
    let result = "";
    if (doc.title_en) result += " " + doc.title_en;
    if (doc.title_de) result += " " + doc.title_de;
    if (doc.content_en) result += " " + doc.content_en;
    if (doc.content_de) result += " " + doc.content_de;
    return result;
  }
};
