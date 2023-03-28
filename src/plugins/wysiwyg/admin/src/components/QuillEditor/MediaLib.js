import React from 'react';
import {prefixFileUrlWithBackendUrl, useLibrary} from '@strapi/helper-plugin';
import PropTypes from 'prop-types';

const MediaLib = ({name, value, onChange, onToggle}) => {

    const { components } = useLibrary();
    const MediaLibDialog = components['media-library'];

    const handleSelectAssets = (files) => {
        const formattedFiles = files.map(file => ({
            alt: file.alternativeText || file.name,
            url: prefixFileUrlWithBackendUrl(file.url),
            mime: file.mime,
        }));
        const images = formattedFiles.map(image => `<image src='${image.url}' alt='${image.alt}'>`).join();
        onChange({
            target: {
                name: name,
                value: value + images
            }
        });
        onToggle();
    };

    return (
        <MediaLibDialog
            allowedTypes={['images', 'videos']}
            multiple={true}
            noNavigation={false}
            onClose={onToggle}
            onSelectAssets={handleSelectAssets}
         />
    );
};

MediaLib.defaultProps = {
  onChange: () => { },
  onToggle: () => { },
};

MediaLib.propTypes = {
  onChange: PropTypes.func,
  onToggle: PropTypes.func,
};

export default MediaLib;
