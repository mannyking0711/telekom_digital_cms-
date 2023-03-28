"use strict";

/**
 * content service
 */

const { createCoreService } = require("@strapi/strapi").factories;
const axios = require("axios");
const { omit, isEmpty, isArray } = require("lodash");
const { isKeyML } = require("./migrationHelpers/functions");
const {
  dataToMigrate,
  fieldKeyMap,
  componentKeyMap,
} = require("./migrationHelpers/objects");

module.exports = createCoreService("api::content.content", ({ strapi }) => ({
  async migrateDataFromV3(args) {
    if (args.secretToken !== "IopSi-3f2Rf") {
      return { status: "Not Authorized" };
    }

    const oldOptions = await strapi.db
      .query("api::migrate-option.migrate-option")
      .findMany();

    if (!oldOptions[0]) {
      await strapi.db.query("api::migrate-option.migrate-option").create({
        data: {
          article: {},
          articles_group: {},
          author: {},
          award: {},
          award_nominees: {},
          award_category: {},
          award_region: {},
          bookmark: {},
          user_profile: {},
          digi_index_archive: {},
          digi_index_sector: {},
          event: {},
          coverage: {},
          event_agenda: {},
          newsletter: {},
          speaker: {},
          megatrends: {},
          quarter: {},
          map_locations: {},
          partner: {},
          faq: {},
          faq_group: {},
          impressions: {},
          media_library: {},
          video: {},
          podcast: {},
          podcast_group: {},
          stage: {},
          tag: {},
          topic_of_the_week: {},
          videos_groups: {},
        },
      });
    }

    for (const k in dataToMigrate) {
      console.log("Migrating: " + k);
      await strapi
        .service("api::content.content")
        .migrateDataType(k, dataToMigrate[k]);
      console.log("Migrating " + k + " Done .");
    }

    console.log('Migrate Bookmarks Ids based on types')
    const bookMarks = await strapi.db.query('api::bookmark.bookmark').findMany({limit: 10000})
    const newOptions = await strapi.db
    .query("api::migrate-option.migrate-option")
    .findMany();
    const newOption = newOptions[0]
    for (const bookMark of bookMarks) {
      let itemID = newOption[bookMark.item_type][bookMark.item_id][bookMark.locale]
      await strapi.db.query('api::bookmark.bookmark').update({where: {id: bookMark.id}, data: {item_id: itemID}})
    }

    console.log('All Is Done')
    return { status: "Done" };
  },
  async migrateDataType(k, dataType) {
    const returns = [];
    // Get Data from strapi 3
    const results = await axios.get(`${process.env.V3URL}/content/raw/${k}`, {
      headers: { Authorization: `Bearer ${process.env.V3JWT}` },
    });
    if (!results?.data) {
      return { status: "Empty" };
    }
    const { data, fields, componentsFields } = results.data;
    let finalData = isArray(data) ? data : [data];
    // Loop and add , pass dataType
    for (const entry of finalData) {
      const res = await strapi
        .service("api::content.content")
        .addData(k, entry, dataType, { componentsFields, fields });
      returns.push(res);
    }
    return returns;
  },
  async addData(
    k,
    fData,
    dataType,
    allFields,
    functionType = "api",
    newFetch = false
  ) {
    const oldOptions = await strapi.db
      .query("api::migrate-option.migrate-option")
      .findMany();

    const optionsKey = k.replace(/-/g, "_");
    const optionsOldValues = oldOptions[0][optionsKey]
      ? oldOptions[0][optionsKey]
      : {};

    let data = fData;
    if (data && data.id && optionsOldValues[data.id]) {
      // console.log({ k, de: optionsOldValues[data.id]["de"], status: "Exist" });
      return {
        status: "Exist",
        createdItems: {
          de: { id: optionsOldValues[data.id]["de"] },
          en: { id: optionsOldValues[data.id]["en"] },
        },
      };
    } else if (newFetch) {
      try {
        const results = await axios.get(
          `${process.env.V3URL}/content/rawOne/${k}/${data.id}`,
          {
            headers: { Authorization: `Bearer ${process.env.V3JWT}` },
          }
        );
        if (!results?.data) {
          console.log("Error: Empty relation data");
        }
        data = results.data;
      } catch (error) {
        console.log({ error });
        return false;
      }
    }

    const toAdd = {
      de:
        functionType === "api"
          ? { locale: "de", publishedAt: data.published_at }
          : {},
      en:
        functionType === "api"
          ? { locale: "en", publishedAt: data.published_at }
          : {},
    };
    let fields;
    if (functionType === "api") {
      fields = allFields.fields[`application::${k}.${k}`].attributes;
    } else {
      fields = allFields.componentsFields[k];
    }

    // Read and Fill Data
    for (const fieldKey in fields) {
      if (
        (data[fieldKey] === null || data[fieldKey] === undefined) &&
        fields[fieldKey].required !== true
      ) {
        // console.log({fieldKey, field : fields[fieldKey], empty: true})
        continue;
      }

      let valueToAdd;
      let doubleLangValueToAdd;
      let finalFieldKey = fieldKey;
      if (fieldKeyMap[k]?.[fieldKey]) {
        finalFieldKey = fieldKeyMap[k][fieldKey];
      }
      if (
        [
          "enumeration",
          "string",
          "boolean",
          "date",
          "json",
          "text",
          "richtext",
          "integer",
          "email",
          "biginteger",
          "float",
          "decimal",
          "date",
          "time",
          "datetime",
          "json",
        ].includes(fields[fieldKey].type)
      ) {
        valueToAdd = data[fieldKey];

        if (
          ["string", "text", "richtext"].includes(fields[fieldKey].type) &&
          data[fieldKey] === null
        ) {
          valueToAdd = "";
        } else if (fields[fieldKey].type === "enumeration" && !data[fieldKey]) {
          valueToAdd = fields[fieldKey].enum[0];
        }
      } else if (
        dataType.link &&
        Object.keys(dataType.link).includes(fieldKey)
      ) {
        if (!isEmpty(data[fieldKey]) || typeof data[fieldKey] === "number") {
          const dataArr = isArray(data[fieldKey])
            ? data[fieldKey]
            : [data[fieldKey]];
          const res = [];
          const resML = { de: [], en: [] };

          for (const oneData of dataArr) {
            let dataToAdd = oneData;

            if (
              dataType.link[fieldKey].newFetch &&
              typeof oneData === "number"
            ) {
              dataToAdd = { id: oneData };
            }

            const relEntries = await strapi
              .service("api::content.content")
              .addData(
                dataType.link[fieldKey].target,
                dataToAdd,
                dataType.link[fieldKey],
                allFields,
                "api",
                dataType.link[fieldKey].newFetch
              );

            if (!relEntries) {
              continue;
            }

            if (isKeyML(fieldKey)) {
              res.push(relEntries.createdItems[fieldKey.slice(-2)].id);
            } else {
              resML["de"].push(relEntries.createdItems["de"].id);
              resML["en"].push(relEntries.createdItems["en"].id);
            }
          }

          if (isKeyML(fieldKey)) {
            valueToAdd = isArray(data[fieldKey]) ? res : res[0];
          } else {
            doubleLangValueToAdd = isArray(data[fieldKey])
              ? resML
              : {
                  de: resML["de"][0],
                  en: resML["en"][0],
                };
          }
        }
      } else if (fields[fieldKey].model === "file") {

        valueToAdd = data[fieldKey]?.id;
        // console.log({valueToAdd, k, fieldKey})
        
      } else if (fields[fieldKey].collection === "file") {
        valueToAdd = data[fieldKey].map((i) => i.id);
      } else if (["created_by", "updated_by"].includes(fieldKey)) {
        finalFieldKey = fieldKey + "_id";
        valueToAdd = data[fieldKey].id;
      } else if (fields[fieldKey].type === "dynamiczone") {
        const res = [];
        const resML = { de: [], en: [] };

        for (const component of data[fieldKey]) {
          const componentData = omit(component, ["id", "__component"]);
          const componentK = component["__component"];
          const componentDataType =
            dataType.components?.[fieldKey]?.[componentK] || {};
          // if ( fieldKey === 'speakers' ) {
          //   console.log({componentK, componentDataType})
          // }
          const processedComponent = await strapi
            .service("api::content.content")
            .addData(
              componentK,
              componentData,
              componentDataType,
              allFields,
              "component"
            );

          let finalcomponentK = componentK;
          if (componentKeyMap[componentK]) {
            finalcomponentK = componentKeyMap[componentK];
          }
          if (isKeyML(fieldKey)) {
            res.push({
              ...processedComponent[fieldKey.slice(-2)],
              __component: finalcomponentK,
            });
          } else {
            resML["de"].push({
              ...processedComponent["de"],
              __component: finalcomponentK,
            });
            resML["en"].push({
              ...processedComponent["en"],
              __component: finalcomponentK,
            });
          }
        }

        if (isKeyML(fieldKey)) {
          valueToAdd = res;
        } else {
          doubleLangValueToAdd = resML;
        }
      } else if (fields[fieldKey].type === "component") {
        const compDataArr = isArray(data[fieldKey])
          ? data[fieldKey]
          : [data[fieldKey]];
        const res = { de: [], en: [] };
        const componentK = fields[fieldKey].component;
        const componentDataType = dataType.components?.[fieldKey] || {};

        for (const compData of compDataArr) {
          const componentData = omit(compData, ["id"]);

          const processedComponent = await strapi
            .service("api::content.content")
            .addData(
              componentK,
              componentData,
              componentDataType,
              allFields,
              "component"
            );
          res["de"].push(processedComponent["de"]);
          res["en"].push(processedComponent["en"]);
        }

        if (isKeyML(fieldKey)) {
          valueToAdd = isArray(data[fieldKey])
            ? res[fieldKey.slice(-2)]
            : res[fieldKey.slice(-2)][0];
        } else {
          doubleLangValueToAdd = isArray(data[fieldKey])
            ? res
            : {
                de: res["de"][0],
                en: res["en"][0],
              };
        }
      }

      if (!doubleLangValueToAdd) {
        if (isKeyML(finalFieldKey)) {
          if (!finalFieldKey.startsWith("slug")) {
            toAdd[finalFieldKey.slice(-2)][finalFieldKey.slice(0, -3)] =
              valueToAdd;
          } else {
            toAdd["de"][finalFieldKey] = valueToAdd;
            toAdd["en"][finalFieldKey] = valueToAdd;
          }
        } else {
          toAdd["de"][finalFieldKey] = valueToAdd;
          toAdd["en"][finalFieldKey] = valueToAdd;
        }
      } else {
        toAdd["de"][finalFieldKey] = doubleLangValueToAdd["de"];
        toAdd["en"][finalFieldKey] = doubleLangValueToAdd["en"];
      }
    }

    if (functionType === "component") {
      return toAdd;
    }

    // Create the content in strapi 4
    const k4 = dataType.v4Target ? dataType.v4Target : k;
    const deItem = await strapi.entityService.create(`api::${k4}.${k4}`, {
      data: toAdd["de"],
    });

    const enItem = await strapi.entityService.create(`api::${k4}.${k4}`, {
      data: { ...toAdd["en"], localizations: [deItem.id] },
      populate: ["localizations"],
    });

    await strapi.db.query("api::migrate-option.migrate-option").update({
      where: { id: oldOptions[0].id },
      data: {
        [optionsKey]: {
          ...optionsOldValues,
          [data.id]: { de: deItem.id, en: enItem.id },
        },
      },
    });

    const toReturn = {
      status: "Added",
      createdItems: { de: deItem, en: enItem },
    };
    // console.log({ k, de: deItem.id, status: "Added" });
    return toReturn;
  },
  async matomo(type, period, urlAppendix) {
    // validation
    if (!["article", "podcast", "video"].includes(type)) return;
    if (!["day", "week", "month"].includes(period)) return;

    // Set date range
    const today = new Date();
    let firstDate = new Date();
    if (period === "day") {
      firstDate.setDate(today.getDate() - 1);
    } else if (period === "week") {
      firstDate.setDate(today.getDate() - 7);
    } else if (period === "month") {
      firstDate.setDate(today.getDate() - 30);
    }
    const dateRange =
      firstDate.toISOString().slice(0, 10) +
      "," +
      today.toISOString().slice(0, 10);

    // fetch data from matomo
    let urlType = type === "article" ? "artikel" : type;
    let url = strapi.config.get("matomo.url");
    url += `?token_auth=${strapi.config.get("matomo.token")}`;
    url += "&format=json";
    url += "&idSite=1";
    url += "&module=API";
    url += "&method=Actions.getPageUrls";
    url += `&date=${dateRange}`;
    url += "&period=range";
    url += "&flat=1";
    url += "&filter_limit=4";
    url += `&filter_pattern=magazin/${urlType}/`;
    url += urlAppendix ? `${urlAppendix}/` : "";

    // handle response
    const { data } = await axios.get(url);
    const impressionsType = { item_type: type, period };
    console.log(impressionsType);

    // error from matomo stop code execution
    if (data.result && data.result === "error") return;

    // update impressions
    if (Object.values(data).length > 0) {
      // delete old data
      await strapi.db
        .query("api::impression.impression")
        .deleteMany({ where: { impressionsType } });

      // // insert new data
      Object.values(data).forEach(async (item) => {
        let urlSegements = item.label.split("/");
        await strapi.db.query("api::impression.impression").create({
          data: {
            item_id: urlSegements[urlSegements.length - 1], // slug
            count: item.nb_visits, // number of visits
            ...impressionsType,
          },
        });
      });
    }
  },
  async fetchMostReadContent(period) {
    await strapi.service("api::content.content").matomo("article", period);
    await strapi.service("api::content.content").matomo("video", period);
    await strapi.service("api::content.content").matomo("podcast", period);
  },
}));
