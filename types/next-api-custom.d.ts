declare module '.next/api' {
    /// <reference types="node" />
    import { ParsedUrlQuery } from 'querystring';
    import { IncomingMessage, ServerResponse } from 'http';
    
    export type PreviewData = string | false | object | undefined

    /**
     * Send body of response
     */
    type Send<T> = (body: T) => void;

    export type Redirect =
        | {
            statusCode: 301 | 302 | 303 | 307 | 308
            destination: string
            basePath?: false
            }
        | {
            permanent: boolean
            destination: string
            basePath?: false
        };

    export type NextApiRequestQuery = Partial<{
        [key: string]: string | string[];
    }>;

    export type NextApiRequestCookies = Partial<{
        [key: string]: string;
    }>;

    export type Env = {
        [key: string]: string | undefined;
    };

    type NextApiResponse<Data = any> = ServerResponse & {
        /**
         * Send data `any` data in response
         */
        send: Send<Data>;
        /**
         * Send data `json` data in response
         */
        json: Send<Data>;
        status: (statusCode: number) => NextApiResponse<Data>;
        redirect(url: string): NextApiResponse<Data>;
        redirect(status: number, url: string): NextApiResponse<Data>;
        /**
         * Set draft mode
         */
        setDraftMode: (options: {
            enable: boolean;
        }) => NextApiResponse<Data>;
        /**
         * Set preview data for Next.js' prerender mode
         */
        setPreviewData: (data: object | string, options?: {
            /**
             * Specifies the number (in seconds) for the preview session to last for.
             * The given number will be converted to an integer by rounding down.
             * By default, no maximum age is set and the preview session finishes
             * when the client shuts down (browser is closed).
             */
            maxAge?: number;
            /**
             * Specifies the path for the preview session to work under. By default,
             * the path is considered the "default path", i.e., any pages under "/".
             */
            path?: string;
        }) => NextApiResponse<Data>;
        /**
         * Clear preview data for Next.js' prerender mode
         */
        clearPreviewData: (options?: {
            path?: string;
        }) => NextApiResponse<Data>;
        /**
         * Revalidate a specific page and regenerate it using On-Demand Incremental
         * Static Regeneration.
         * The path should be an actual path, not a rewritten path. E.g. for
         * "/blog/[slug]" this should be "/blog/post-1".
         * @link https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration#on-demand-revalidation
         */
        revalidate: (urlPath: string, opts?: {
            unstable_onlyGenerated?: boolean;
        }) => Promise<void>;
    };

    interface NextApiRequest extends IncomingMessage {
        /**
         * Object of `query` values from url
         */
        query: NextApiRequestQuery;
        /**
         * Object of `cookies` from header
         */
        cookies: Partial<{
            [key: string]: string;
        }>;
        body: any;
        env: Env;
        draftMode?: boolean;
        preview?: boolean;
        /**
         * Preview data set on the request, if any
         * */
        previewData?: PreviewData;
    }

    export type GetServerSidePropsContext<
        Params extends ParsedUrlQuery = ParsedUrlQuery,
        Preview extends PreviewData = PreviewData
    > = {
        req: IncomingMessage & {
            cookies: NextApiRequestCookies
        }
        res: ServerResponse
        params?: Params
        query: ParsedUrlQuery
        preview?: boolean
        previewData?: Preview
        draftMode?: boolean
        resolvedUrl: string
        locale?: string
        locales?: string[]
        defaultLocale?: string
    }

    /**
     * The return type of `getStaticProps`.
     * @link https://nextjs.org/docs/api-reference/data-fetching/get-static-props#getstaticprops-return-values
     */
    export type GetStaticPropsResult<Props> =
        | { props: Props; revalidate?: number | boolean }
        | { redirect: Redirect; revalidate?: number | boolean }
        | { notFound: true; revalidate?: number | boolean }

    /**
     * The return type of `getServerSideProps`.
     * @link https://nextjs.org/docs/api-reference/data-fetching/get-server-side-props#getserversideprops-return-values
     */
    export type GetServerSidePropsResult<Props> =
        | { props: Props | Promise<Props> }
        | { redirect: Redirect }
        | { notFound: true }
}