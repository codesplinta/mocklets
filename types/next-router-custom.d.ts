/// <reference types="node" />
/// <reference types="node" />

declare module '.next/router' {
  import { IncomingMessage, ServerResponse } from 'http';
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
    route?: string;
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

  export type BaseContext = {
    res?: ServerResponse;
    [k: string]: any;
  };

  export type AppInitialProps<PageProps = any> = {
    pageProps: PageProps;
  };

  export type AppTreeType = import('react').ComponentType<AppInitialProps & {
    [name: string]: any;
  }>;

  export interface NextPageContext {
    err?: (Error & {
        statusCode?: number;
    }) | null;
    req?: IncomingMessage;
    res?: ServerResponse;
    pathname: string;
    query: ParsedUrlQuery;
    asPath?: string;
    locale?: string;
    locales?: string[];
    defaultLocale?: string;
    AppTree: AppTreeType;
  }

  export type NextComponentType<Context extends BaseContext = NextPageContext, InitialProps = {}, Props = {}> = import('react').ComponentType<Props> & {
    /**
     * Used for initial page load data population. Data returned from `getInitialProps` is serialized when server rendered.
     * Make sure to return plain `Object` without using `Date`, `Map`, `Set`.
     * @param context Context of `page`
     */
    getInitialProps?(context: Context): InitialProps | Promise<InitialProps>;
  };

  export type WithRouterProps = {
    router: NextRouter;
  };

  export type ExcludeRouterProps<P> = Pick<P, Exclude<keyof P, keyof WithRouterProps>>;
}