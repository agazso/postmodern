// tslint:disable-next-line:no-var-requires
const Url = require('url');
import { Utils } from '../Utils';

export const REDDIT_COM = 'reddit.com';

const HTTP_URL_MATCHER = /(http.?:\/\/.*?)( |$)/;
const BZZ_FEED_MATCHER = /(bzz-feed:\/\?user=0x[a-f0-9]{40})( |$)/;
const BZZ_RESOURCE_MATCHER = /(bzz:\/\/[a-f0-9]{64})( |$)/;
const FELFELE_DEEP_LINK_MATCHER = /(http.?:\/\/app.felfele.org\/.*?)( |$)/;

export const getHumanHostname = (url: string): string => {
    if (url.startsWith('//')) {
        url = 'https:' + url;
    }
    const hostname = Url.parse(url).hostname;
    const parts = hostname ? hostname.split('.') : '';
    const humanHostname = Utils.takeLast(parts, 2, '').join('.');
    return humanHostname;
};

export const createUrlFromUrn = (urn: string, baseUrl: string): string => {
    if (!baseUrl.endsWith('/')) {
        baseUrl += '/';
    }
    if (urn.startsWith('//')) {
        const parts = baseUrl.split(':', 2);
        const protocol = parts.length > 1 ? parts[0] : 'https';
        return protocol + ':' + urn;
    }
    if (urn.startsWith('http')) {
        return urn;
    }
    if (urn.startsWith('/')) {
        return baseUrl + urn.slice(1);
    }
    return baseUrl + urn;
};

export const getBaseUrl = (url: string): string => {
    if (url.startsWith('//')) {
        url = 'https:' + url;
    }

    return url.replace(/(http.?:\/\/.*?\/).*/, '$1');
};

export const getCanonicalUrl = (url: string): string => {
    if (url === '') {
        return '';
    }
    const parts = url.split('//', 2);
    if (parts.length === 1) {
        if (!url.includes('/')) {
            url += '/';
        }
    }
    else if (parts.length > 1) {
        if (!parts[1].includes('/')) {
            url += '/';
        }
    }
    if (url.startsWith('//')) {
        url = 'https:' + url;
    }
    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }
    return url;
};

export const getHttpsUrl = (url: string): string => {
    const httpProtocol = 'http:';
    if (url.startsWith(httpProtocol)) {
        return 'https:' + url.slice(httpProtocol.length);
    }
    return url;
};

export const stripNonAscii = (s: string): string => {
    return s.replace(/[^\x00-\x7F]/g, '');
};

export const getLinkFromText = (text: string): string | undefined => {
    const bzzFeedLink = getBzzFeedLinkFromText(text);
    if (bzzFeedLink != null) {
        return bzzFeedLink;
    }
    const bzzLink = getBzzLinkFromText(text);
    if (bzzLink != null) {
        return bzzLink;
    }
    const httpLink = getHttpLinkFromText(text);
    if (httpLink != null) {
        return httpLink;
    }
    return undefined;
};

export const getHttpLinkFromText = (text: string): string | undefined => {
    const httpLink = text.match(HTTP_URL_MATCHER);
    if (httpLink != null) {
        return httpLink[1];
    }
    return undefined;
};

export const getBzzFeedLinkFromText = (text: string): string | undefined => {
    const bzzFeedLink = text.match(BZZ_FEED_MATCHER);
    if (bzzFeedLink != null) {
        return bzzFeedLink[1];
    }
    return undefined;
};

export const getBzzLinkFromText = (text: string): string | undefined => {
    const bzzLink = text.match(BZZ_RESOURCE_MATCHER);
    if (bzzLink != null) {
        return bzzLink[1];
    }
    return undefined;
};

export const isFelfeleResource = (text: string): boolean => {
    return text.match(BZZ_FEED_MATCHER) != null || text.match(FELFELE_DEEP_LINK_MATCHER) != null;
};

export const compareUrls = (url1: string, url2: string): boolean => {
    const canonicalUrl1 = getCanonicalUrl(url1);
    const canonicalUrl2 = getCanonicalUrl(url2);
    if (canonicalUrl1 === canonicalUrl2) {
        return true;
    }

    const hostname1 = Url.parse(canonicalUrl1).hostname;
    const hostname2 = Url.parse(canonicalUrl2).hostname;
    const wwwPrefix = 'www.';
    const stripWWWPrefix = (url: string) => url.startsWith(wwwPrefix)
        ? url.slice(wwwPrefix.length)
        : url
    ;
    const hostname1WithoutWWW = stripWWWPrefix(hostname1);
    const hostname2WithoutWWW = stripWWWPrefix(hostname2);

    return hostname1WithoutWWW === hostname2WithoutWWW;
};
