import { prefixPluginTranslations } from "@strapi/helper-plugin";
import pluginPkg from "../../package.json";
import pluginId from "./pluginId";
import Initializer from "./components/Initializer";
import PluginIcon from "./components/PluginIcon";
import getTrad from "./utils/getTrad";
import BulletList from '@strapi/icons/BulletList';
import OneToOne from '@strapi/icons/OneToOne';
import PreviewLink from './components/PreviewLink';

const name = pluginPkg.strapi.name;

export default {
  register(app) {

    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    });
    app.customFields.register({
      name: "tabs",
      pluginId: "digitalx-custom-fields",
      type: "string",
      intlLabel: {
        id: getTrad("tabLabel"),
        defaultMessage: "Tabs",
      },
      intlDescription: {
        id: getTrad("tabDescription"),
        defaultMessage: "Group Content Types into tabs",
      },
      icon: PluginIcon,
      components: {
        Input: async () => import(/* webpackChunkName: "input-component" */ "./components/Tabs"),
      },
      options: {
        base: [
          {
            sectionTitle: {
              id: "tabs",
              defaultMessage: "Tabs",
            },
            items: Array(10)
              .fill()
              .map((item, key) => [
                {
                  intlLabel: {
                    id: `tab${key + 1}`,
                    defaultMessage: `Tab${key + 1}`,
                  },
                  name: `options.tab${key + 1}`,
                  type: "textarea-enum",
                },
                {
                  intlLabel: {
                    id: `tabTitle${key + 1}`,
                    defaultMessage: `TabTitle${key + 1}`,
                  },
                  name: `options.titleTab${key + 1}`,
                  type: "string",
                },
              ]).flat(1),
          },
        ],
        advanced: [
        ],
        validator: (args) => ({
        }),
      },
    });
    app.customFields.register({
      name: "accordions",
      pluginId: "digitalx-custom-fields",
      type: "string",
      intlLabel: {
        id: getTrad("accLabel"),
        defaultMessage: "Accordions",
      },
      intlDescription: {
        id: getTrad("accDescription"),
        defaultMessage: "Group Content Types into accordions",
      },
      icon: BulletList,
      components: {
        Input: async () => import(/* webpackChunkName: "input-component" */ "./components/Accordions"),
      },
      options: {
        base: [
          {
            sectionTitle: {
              id: "accordions",
              defaultMessage: "Accordions",
            },
            items: Array(10)
              .fill()
              .map((item, key) => [
                {
                  intlLabel: {
                    id: `accordion${key + 1}`,
                    defaultMessage: `Accordion${key + 1}`,
                  },
                  name: `options.accordion${key + 1}`,
                  type: "textarea-enum",
                },
                {
                  intlLabel: {
                    id: `accordionTitle${key + 1}`,
                    defaultMessage: `AccordionTitle${key + 1}`,
                  },
                  name: `options.titleAccordion${key + 1}`,
                  type: "string",
                },
              ]).flat(1),
          },
        ],
        advanced: [
        ],
        validator: (args) => ({
        }),
      },
    });
    app.customFields.register({
      name: "divider",
      pluginId: "digitalx-custom-fields",
      type: "string",
      intlLabel: {
        id: getTrad("dividerLabel"),
        defaultMessage: "Divider",
      },
      intlDescription: {
        id: getTrad("dividerDescription"),
        defaultMessage: "Simple Divider",
      },
      icon: OneToOne,
      components: {
        Input: async () => import(/* webpackChunkName: "input-component" */ "./components/Divider"),
      },
      options: {
        base: [
          {
            sectionTitle: {
              id: "options",
              defaultMessage: "Options",
            },
            items: [
                {
                  intlLabel: {
                    id: `title`,
                    defaultMessage: `Title`,
                  },
                  name: `options.title`,
                  type: "string",
                }
              ]
          },
        ],
        advanced: [
        ],
        validator: (args) => ({
        }),
      },
    });
  },

  bootstrap(app) {
    app.injectContentManagerComponent('editView', 'right-links', {
      name: 'preview-link',
      Component: PreviewLink
    });
  },
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(/* webpackChunkName: "translation-[request]" */ `./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
