declare module '.next/router' {
  /// <reference types="node" />
  import { ParsedUrlQuery } from 'querystring';
  import { UrlObject } from 'url';

  type RouterEvent = "routeChangeStart" | "beforeHistoryChange" | "routeChangeComplete" | "routeChangeError" | "hashChangeStart" | "hashChangeComplete";

  type BeforePopStateCallback = (state: NextHistoryState) => boolean;
  type Url = UrlObject | string;

  type PrefetchOptions = {
    priority?: boolean;
    locale?: string | false;
  };

  type Handler = (...evts: any[]) => void;

  type MittEmitter<T> = {
    on(type: T, handler: Handler): void;
    off(type: T, handler: Handler): void;
    emit(type: T, ...evts: any[]): void;
  };

  interface RouteProperties {
    shallow: boolean;
  }

  interface TransitionOptions {
    shallow?: boolean;
    locale?: string | false;
    scroll?: boolean;
  }
  interface NextHistoryState {
    url: string;
    as: string;
    options: TransitionOptions;
  }

  interface DomainLocale {
    defaultLocale: string;
    domain: string;
    http?: true;
    locales?: string[];
  }

  interface NextRouter {
    pathname: string;
    basePath: string;
    isReady: boolean;
    isLocaleDomain: boolean;
    isFallback: boolean;
    isPreview: boolean;
    asPath: string;
    route: string;
    query: ParsedUrlQuery;
    locale?: string;
    locales?: string[] | undefined;
    domainLocales?: DomainLocale[] | undefined;
    refresh(): void;
    replace(url: Url, as?: Url, options?: TransitionOptions): Promise<boolean>;
    replace(url: Url, options?: TransitionOptions): Promise<boolean>;
    push(url: Url, as?: Url, options?: TransitionOptions): Promise<boolean>;
    push(url: Url, options?: TransitionOptions): Promise<boolean>;
    back(): void;
    forward(): void;
    reload(): void;
    beforePopState(cb: BeforePopStateCallback): void;
    prefetch(url: string, asPath?: string, options?: PrefetchOptions): Promise<void>;
    events: MittEmitter<RouterEvent>
  }
}