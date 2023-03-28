const partnerRelObj = {
  link: {
    partners: {
      target: "partner",
      newFetch: true,
      components: {
        partner_megatrends: {
          link: {
            megatrends: { target: "megatrends", v4Target: "megatrend" },
          },
        },
        partner_quarter: {
          link: {
            quarter: { target: "quarter" },
          },
        },
      },
    },
  },
};

// Although we can get the link fields from content types definitions I keep it here to be more controlable , if we gonna use this a lot it can be improved
const dataToMigrate = {
  article: {
    link: {
      author: { target: "author" },
      articles_group: {
        target: "articles-group",
      },
    },
  },
  award: {
    components: {
      winners: {
        link: {
          entry: {
            target: "award-nominees",
            v4Target: "award-nominee",
            link: {
              category: {
                target: "award-category",
                newFetch: true,
              },
              region: {
                target: "award-region",
                newFetch: true,
              },
            },
          },
        },
      },
      nominees: {
        link: {
          entry: {
            target: "award-nominees",
            v4Target: "award-nominee",
            link: {
              category: {
                target: "award-category",
                newFetch: true,
              },
              region: {
                target: "award-region",
                newFetch: true,
              },
            },
          },
        },
      },
    },
  },
  "digi-index-archive": {},
  "digi-index-sector": {},
  partner: {
    components: {
      partner_megatrends: {
        link: {
          megatrends: { target: "megatrends", v4Target: "megatrend" },
        },
      },
      partner_quarter: {
        link: {
          quarter: { target: "quarter" },
        },
      },
    },
  },
  speaker: {
    components: {
      speaker_megatrends: {
        link: {
          megatrends: { target: "megatrends", v4Target: "megatrend" },
        },
      },
    },
  },
  event: {
    link: {
      coverages: { target: "coverage" },
      agenda: {
        target: "event-agenda",
        newFetch: true,
        components: {
          days: {
            components: {
              subjects: {
                link: { presenters: { target: "speaker" } },
                components: {
                  sessions: {
                    link: { participants: { target: "speaker" } },
                    components: {
                      megatrends: {
                        link: {
                          megatrends: { target: "megatrends", v4Target: "megatrend", test: true },
                        },
                      },
                    }
                  }
                }
              }
            }
          },
          stages: {
            "agenda.stage": {
              link: {
                stage: { target: "stage" },
              },
            },
          },
        },
      },
      newsletters: { target: "newsletter" },
    },
    components: {
      speakers: {
        "event.event-speaker": {
          link: {
            speaker: {
              target: "speaker",
              newFetch: true,
              components: {
                speaker_megatrends: {
                  link: {
                    megatrends: { target: "megatrends", v4Target: "megatrend" },
                  },
                },
              },
            },
          },
        },
      },
      partners_regular: partnerRelObj,
      partners_premium: partnerRelObj,
      partners_coop: partnerRelObj,
      partners_support: partnerRelObj,
      partners_mobility: partnerRelObj,
      partners_digitalization: partnerRelObj,
      partners_media: partnerRelObj,
      partners_startup: partnerRelObj,
      partners_partner: partnerRelObj,
      map_locations: {
        link: {
          map_locations: {
            target: "map-locations",
            newFetch: true,
            v4Target: "map-location",
            components: {
              quarter: {
                link: {
                  quarter: { target: "quarter" },
                },
              },
            },
          },
        },
      },
      partner_focus: partnerRelObj,
    },
  },
  faq: {
    link: {
      faq_group: { target: "faq-group" },
    },
  },
  impressions: {
    v4Target: "impression",
  },
  video: {
    link: {
      author: { target: "author" },
      videos_group: { target: "videos-groups", v4Target: "videos-group" },
    },
  },
  "media-library": {
    components: {
      video_main: {
        link: {
          video: { target: "video" },
        },
      },
      video_list: {
        "media-library.media-library-video": {
          link: {
            video: { target: "video" },
          },
        },
      },
    },
  },
  podcast: {
    link: {
      author: { target: "author" },
      podcast_group: { target: "podcast-group" },
    },
  },
  "topic-of-the-week": {
    link: {
      articles_de: { target: "article" },
      articles_en: { target: "article" },
      podcasts: { target: "podcast" },
      videos: { target: "video" },
    },
  },
  // Single Types
  "award-partners": {
    v4Target: "award-partner",
  },
  "companies-in-fokus": {
    link: {
      articles_de: { target: "article" },
      articles_en: { target: "article" },
      highlight_de: { target: "article" },
      highlight_en: { target: "article" },
    },
  },
  contact: {},
  "digi-index-archive-page": {},
  "digi-index-page": {},
  "event-media-library-page": {
    components: {
      media_libraries: {
        link: {
          media_libraries: { target: "media-library" },
        },
      },
    },
  },
  "event-megatrends-page": {
    components: {
      megatrends_anchor_list: {
        link: {
          megatrends: { target: "megatrends", v4Target: "megatrend" },
        },
      },
    },
  },
  "event-participate-page": {},
  "event-partner-page": {},
  "event-pk-page": {},
  "event-speaker-page": {},
  "events-page": {
    components: {
      intro_highlight_event: {
        link: {
          event: { target: "event" },
        },
      },
      intro_events: {
        link: {
          events: { target: "event" },
        },
      },
      footer_events: {
        link: {
          events: { target: "event" },
        },
      },
      preview_events: {
        link: {
          event: { target: "event" },
        }
      }
    },
  },
  imprint: {},
  index: {
    link: {
      article_hero: { target: "article" },
    },
    components: {
      event_header: {
        link: {
          event: { target: "event" },
        },
      },
      event_content: {
        link: {
          event: { target: "event" },
        },
      },
      event_intro: {
        link: {
          event: { target: "event" },
        },
      },
    },
  },
  "magazine-pages": { v4Target: "magazine-page" },
  "newsletter-page": {},
  "partner-page": {
    components: {
      partners_united: {
        link: {
          partners: { target: "partner" },
        },
      },
    },
  },
  "privacy-policy": {},
  search: {},
  terms: { v4Target: "term" },
  "terms-tickets": { v4Target: "terms-ticket" },
  "videos-in-fokus": {
    link: {
      videos_de: { target: "video" },
      videos_en: { target: "video" },
      highlight_de: { target: "video" },
      highlight_en: { target: "video" },
    },
  },
  bookmark: {
    link: {
      user_profile: {
        target: "user-profile",
      },
    },
  },
  tag: {
    link: {
      user_profile: {
        target: "user-profile",
      },
    },
  },
  "user-profile": {
    link: {
      tags: {
        target: "tag",
      },
      bookmarks: {
        target: "bookmark",
      },
    },
  },
};

const fieldKeyMap = {
  partner: {
    location_image1_de: "location_image1_text_de",
    location_image1_en: "location_image1_text_en",
    location_image2_de: "location_image2_text_de",
    location_image2_en: "location_image2_text_en",
    location_image3_de: "location_image3_text_de",
    location_image3_en: "location_image3_text_en",
    location_image4_de: "location_image4_text_de",
    location_image4_en: "location_image4_text_en",
  },
  "media-library.media-library-list": {
    media_libraries: "items",
  },
  "map-location.map-location-list": {
    map_locations: "items",
  },
  "agenda.megatrends": {
    megatrends: "items",
  },
};

// Now Working in DZ only
const componentKeyMap = {
  "media-library.media-library-video": "media-library.video",
};

module.exports = {
  dataToMigrate,
  fieldKeyMap,
  componentKeyMap,
};
