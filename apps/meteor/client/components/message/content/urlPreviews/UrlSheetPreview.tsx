import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';

import type { UrlPreviewMetadata } from './UrlPreviewMetadata';

declare global {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Window {
		customEventElement?: HTMLDivElement;
	}
}

const style = { width: '600px', display: 'block', height: '360px' };
const UrlSheetPreview = ({ url }: Pick<UrlPreviewMetadata, 'url'>): ReactElement => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (ref.current && window.customEventElement) {
			window.customEventElement.dispatchEvent(new CustomEvent('createUniver', { detail: { ref: ref.current, url } }));
		}
	}, []);

	return <div style={style} ref={ref}></div>;
};

export default UrlSheetPreview;
