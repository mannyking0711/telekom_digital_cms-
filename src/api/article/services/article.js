"use strict";

const helper = require("../../helper");
/**
 * article service
 */

const { createCoreService } = require("@strapi/strapi").factories;
const uid = "api::article.article";

module.exports = createCoreService(uid, ({strapi}) => ({

  async getEntity(id) {
    const fullPopulate = helper.getFullPopulateObject(uid, 4);
    const result = await strapi.db.query(uid).findOne({
      where: {id: id},
      populate: {
        content: fullPopulate.populate.content,
        'articles_group': {
          select : ['id', 'slug_de', 'slug_en']
        },
      },
    });

    result.content = result.content.map(it => {
      if (it.__component === "article.article-text")
        return it.content;
    }).join(" ");

    result.group_en = result.articles_group.slug_en;
    result.group_de = result.articles_group.slug_de;

    return result;
  }

}));
