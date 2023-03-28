import React from 'react';
import { useCMEditViewDataManager } from '@strapi/helper-plugin';
import Eye from '@strapi/icons/Eye';
import { LinkButton } from '@strapi/design-system/LinkButton';

const PreviewLink = () => {
  const {modifiedData, slug} = useCMEditViewDataManager();

  if (!FRONTEND_URL || !FRONTEND_PREVIEW_SECRET) {
    return null;
  }

  let preview = '';

  if (slug === 'api::digi-index-sector.digi-index-sector') {
    // Digitalisierungs-Index
    if (!modifiedData.slug) {
      return null;
    }
    preview = `/de/magazin/digitalisierungsindex/${modifiedData.slug}`;

  } else if (slug === 'api::award.award') {
    // Award
    if (!modifiedData.year) {
      return null;
    }
    preview = `/de/award/${modifiedData.year}`;

  } else if (slug === 'api::article.article') {
    // Artikel
    if (!modifiedData.slug_de || !modifiedData.articles_group.slug_de) {
      return null;
    }
    preview = `/de/magazin/artikel/${modifiedData.articles_group.slug_de}/${modifiedData.slug_de}`;

  } else if (slug === 'api::video.video') {
    // Video
    if (!modifiedData.slug_de || !modifiedData.author.slug) {
      return null;
    }
    preview = `/de/magazin/video/${modifiedData.author.slug}/${modifiedData.slug_de}`;

  } else if (slug === 'api::podcast.podcast') {
    // Podcast
    if (!modifiedData.slug_de || !modifiedData.author.slug) {
      return null;
    }
    preview = `/de/magazin/podcast/${modifiedData.author.slug}/${modifiedData.slug_de}`;

  } else if (slug === 'api::partner.partner') {
    // Partner
    if (!modifiedData.slug_de) {
      return null;
    }
    preview = `/de/partner/${modifiedData.slug_de}`;

  } else if (slug === 'api::speaker.speaker') {
    // Speaker
    if (!modifiedData.slug_de) {
      return null;
    }
    preview = `/de/speaker/${modifiedData.slug_de}`;

  } else if (slug === 'api::event.event') {
    // Event
    if (!modifiedData.slug_de) {
      return null;
    }
    preview = `/de/events/${modifiedData.slug_de}`;
  }

  if (preview === '') {
    return null;
  }

  const timestamp = (Math.floor(Date.now() / 1000));

  preview = `${FRONTEND_URL}` + preview + `?preview_secret=${FRONTEND_PREVIEW_SECRET}&t=${timestamp}`;

  return (
    <LinkButton
      size="S"
      startIcon={<Eye/>}
      style={{width: '100%'}}
      href={preview}
      variant="secondary"
      target="_blank"
      rel="noopener noreferrer"
      title="page preview"
    >Preview
    </LinkButton>
  );
};

export default PreviewLink;
