 
declare const bodyType: unique symbol

declare module '.msw' {

    export interface HttpResponseInit extends ResponseInit {
        type?: ResponseType
    }

    export type DocumentNode = any
    // export interface DocumentNode {
    //     readonly kind: Kind.DOCUMENT;
    //     readonly loc?: Location;
    //     readonly definitions: ReadonlyArray<DefinitionNode>;
    // }
    enum OperationTypeNode {
        QUERY = 'query',
        MUTATION = 'mutation',
        SUBSCRIPTION = 'subscription',
    }
    export { OperationTypeNode };
    export type GraphQLError = any

    export type ExpectedOperationTypeNode = OperationTypeNode | 'all'
    export type GraphQLHandlerNameSelector = DocumentNode | RegExp | string

    export type GraphQLQuery = Record<string, any>
    export type GraphQLVariables = Record<string, any>

    export type MaybePromise<T> = T | Promise<T>
    export type Path = string | RegExp
    export type PathParams<KeyType extends keyof any = string> = {
      [ParamName in KeyType]: string | ReadonlyArray<string>
    }

    export interface Match {
        matches: boolean
        params?: PathParams
    }

    export type DefaultRequestMultipartBody = Record<
        string,
        string | File | Array<string | File>
    >
  
    export type DefaultBodyType =
        | Record<string, any>
        | DefaultRequestMultipartBody
        | string
        | number
        | boolean
        | null
        | undefined

    export interface StrictRequest<BodyType extends DefaultBodyType>
        extends Request {
        json(): Promise<BodyType>
    }

    export interface StrictResponse<BodyType extends DefaultBodyType> extends Response {
        readonly [bodyType]: BodyType
    }

    export type HttpRequestResolverExtras<Params extends PathParams> = {
        params: Params
        cookies: Record<string, string>
    }

    export type ResponseResolverInfo<
    ResolverExtraInfo extends Record<string, unknown>,
    RequestBodyType extends DefaultBodyType = DefaultBodyType,
    > = {
        request: StrictRequest<RequestBodyType>
        requestId: string
    } & ResolverExtraInfo

    export interface RequestHandlerDefaultInfo {
        header: string
    }
      
    export interface RequestHandlerInternalInfo {
        callFrame?: string
    }

    export type HttpHandlerMethod = string | RegExp

    export interface HttpHandlerInfo extends RequestHandlerDefaultInfo {
        method: HttpHandlerMethod
        path: Path
    }

    export type ResponseResolverReturnType<
        ResponseBodyType extends DefaultBodyType = undefined,
    > =
        | ([ResponseBodyType] extends [undefined]
            ? Response
            : StrictResponse<ResponseBodyType>)
        | undefined
        | void

    export type MaybeAsyncResponseResolverReturnType<
        ResponseBodyType extends DefaultBodyType,
    > = MaybePromise<ResponseResolverReturnType<ResponseBodyType>>

    /**
     * This is the same as TypeScript's `Iterable`, but with all three type parameters.
     * @todo Remove once TypeScript 5.6 is the minimum.
     */
    export interface Iterable<T, TReturn, TNext> {
        [Symbol.iterator](): Iterator<T, TReturn, TNext>
    }
      
    /**
     * This is the same as TypeScript's `AsyncIterable`, but with all three type parameters.
     * @todo Remove once TypeScript 5.6 is the minimum.
     */
    export interface AsyncIterable<T, TReturn, TNext> {
        [Symbol.asyncIterator](): AsyncIterator<T, TReturn, TNext>
    }

    export type AsyncResponseResolverReturnType<
        ResponseBodyType extends DefaultBodyType,
    > = MaybePromise<
        | ResponseResolverReturnType<ResponseBodyType>
        | Iterable<
            MaybeAsyncResponseResolverReturnType<ResponseBodyType>,
            MaybeAsyncResponseResolverReturnType<ResponseBodyType>,
            MaybeAsyncResponseResolverReturnType<ResponseBodyType>
        >
        | AsyncIterable<
            MaybeAsyncResponseResolverReturnType<ResponseBodyType>,
            MaybeAsyncResponseResolverReturnType<ResponseBodyType>,
            MaybeAsyncResponseResolverReturnType<ResponseBodyType>
        >
    >

    export type ResponseResolver<
        ResolverExtraInfo extends Record<string, unknown> = Record<string, unknown>,
        RequestBodyType extends DefaultBodyType = DefaultBodyType,
        ResponseBodyType extends DefaultBodyType = undefined,
    > = (
        info: ResponseResolverInfo<ResolverExtraInfo, RequestBodyType>,
    ) => AsyncResponseResolverReturnType<ResponseBodyType>

    export type HttpResponseResolver<
        Params extends PathParams<keyof Params> = PathParams,
        RequestBodyType extends DefaultBodyType = DefaultBodyType,
        ResponseBodyType extends DefaultBodyType = DefaultBodyType,
        > = ResponseResolver<
        HttpRequestResolverExtras<Params>,
        RequestBodyType,
        ResponseBodyType
    >

    export interface RequestHandlerArgs<
        HandlerInfo,
        HandlerOptions extends RequestHandlerOptions,
    > {
        info: HandlerInfo
        resolver: ResponseResolver<any>
        options?: HandlerOptions
    }

    export interface RequestHandlerOptions {
        once?: boolean
    }

    export interface ResponseResolutionContext {
        baseUrl?: string
    }

    export interface RequestHandlerExecutionResult<
        ParsedResult extends Record<string, unknown> | undefined,
    > {
        handler: RequestHandler
        parsedResult?: ParsedResult
        request: Request
        requestId: string
        response?: Response
    }

    export abstract class RequestHandler<
        HandlerInfo extends RequestHandlerDefaultInfo = RequestHandlerDefaultInfo,
        ParsedResult extends Record<string, any> | undefined = any,
        ResolverExtras extends Record<string, unknown> = any,
        HandlerOptions extends RequestHandlerOptions = RequestHandlerOptions,
    > {
        static cache: WeakMap<
            StrictRequest<DefaultBodyType>,
            StrictRequest<DefaultBodyType>
        >;

        public info: HandlerInfo & RequestHandlerInternalInfo;
        /**
         * Indicates whether this request handler has been used
         * (its resolver has successfully executed).
         */
        public isUsed: boolean;

        protected resolver: ResponseResolver<ResolverExtras, any, any>;
        private resolverIterator?:
            | Iterator<
                MaybeAsyncResponseResolverReturnType<any>,
                MaybeAsyncResponseResolverReturnType<any>,
                MaybeAsyncResponseResolverReturnType<any>
            >
            | AsyncIterator<
                MaybeAsyncResponseResolverReturnType<any>,
                MaybeAsyncResponseResolverReturnType<any>,
                MaybeAsyncResponseResolverReturnType<any>
            >
        private resolverIteratorResult?: Response | StrictResponse<any>
        private options?: HandlerOptions

        constructor(args: RequestHandlerArgs<HandlerInfo, HandlerOptions>);

        /**
         * Determine if the intercepted request should be mocked.
         */
        abstract predicate(args: {
            request: Request
            parsedResult: ParsedResult
            resolutionContext?: ResponseResolutionContext
        }): boolean

        /**
         * Print out the successfully handled request.
         */
        abstract log(args: {
            request: Request
            response: Response
            parsedResult: ParsedResult
        }): void

        /**
         * Parse the intercepted request to extract additional information from it.
         * Parsed result is then exposed to other methods of this request handler.
         */
        parse(_args: {
            request: Request
            resolutionContext?: ResponseResolutionContext
        }): Promise<ParsedResult>

        /**
         * Test if this handler matches the given request.
         *
         * This method is not used internally but is exposed
         * as a convenience method for consumers writing custom
         * handlers.
         */
        public test(args: {
            request: Request
            resolutionContext?: ResponseResolutionContext
        }): Promise<boolean>;

        protected extendResolverArgs(_args: {
            request: Request
            parsedResult: ParsedResult
        }): ResolverExtras;

        private cloneRequestOrGetFromCache(
            request: StrictRequest<DefaultBodyType>,
        ): StrictRequest<DefaultBodyType>;

        public run(args: {
            request: StrictRequest<any>
            requestId: string
            resolutionContext?: ResponseResolutionContext
        }): Promise<RequestHandlerExecutionResult<ParsedResult> | null>

        private wrapResolver(
            resolver: ResponseResolver<ResolverExtras>,
        ): ResponseResolver<ResolverExtras>

        private createExecutionResult(args: {
            request: Request
            requestId: string
            parsedResult: ParsedResult
            response?: Response
        }): RequestHandlerExecutionResult<ParsedResult>
    }


    export type RequestQuery = {
        [queryName: string]: string
    }

    export type HttpRequestParsedResult = {
        match: Match
        cookies: Record<string, string>
    }


    class HttpHandler extends RequestHandler<
        HttpHandlerInfo,
        HttpRequestParsedResult,
        HttpRequestResolverExtras<any>
    > {
        constructor(
            method: HttpHandlerMethod,
            path: Path,
            resolver: ResponseResolver<HttpRequestResolverExtras<any>, any, any>,
            options?: RequestHandlerOptions,
        );
    
        private checkRedundantQueryParameters(): void;

        parse(args: {
            request: Request
            resolutionContext?: ResponseResolutionContext
        }): Promise<HttpRequestParsedResult>;

        predicate(args: { request: Request; parsedResult: HttpRequestParsedResult }): boolean;

        private matchMethod(actualMethod: string): boolean;

        protected extendResolverArgs(args: {
            request: Request
            parsedResult: HttpRequestParsedResult
        }): HttpRequestResolverExtras<PathParams>

        log(args: { request: Request; response: Response }): Promise<void>;
    }




    export type HttpRequestHandler = <
        Params extends PathParams<keyof Params> = PathParams,
        RequestBodyType extends DefaultBodyType = DefaultBodyType,
        // Response body type MUST be undefined by default.
        // This is how we can distinguish between a handler that
        // returns plain "Response" and the one returning "HttpResponse"
        // to enforce a stricter response body type.
        ResponseBodyType extends DefaultBodyType = undefined,
        RequestPath extends Path = Path,
    >(
        path: RequestPath,
        resolver: HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>,
        options?: RequestHandlerOptions,
    ) => HttpHandler

    export interface GraphQLHandlerInfo extends RequestHandlerDefaultInfo {
        operationType: ExpectedOperationTypeNode
        operationName: GraphQLHandlerNameSelector
    }

    export interface TypedDocumentNode<
        Result = { [key: string]: any },
        Variables = { [key: string]: any },
    > extends DocumentNode {
        __apiType?: (variables: Variables) => Result
        __resultType?: Result
        __variablesType?: Variables
    }

    export type GraphQLResolverExtras<Variables extends GraphQLVariables> = {
        query: string
        operationName: string
        variables: Variables
        cookies: Record<string, string>
    }
      
    export type GraphQLResponseBody<BodyType extends DefaultBodyType> =
        | {
            data?: BodyType | null
            errors?: readonly Partial<GraphQLError>[] | null
            }
        | null
        | undefined

    export type GraphQLResponseResolver<
        Query extends GraphQLQuery = GraphQLQuery,
        Variables extends GraphQLVariables = GraphQLVariables,
    > = ResponseResolver<
        GraphQLResolverExtras<Variables>,
        null,
        GraphQLResponseBody<[Query] extends [never] ? GraphQLQuery : Query>
    >

    export interface ParsedGraphQLQuery {
        operationType: OperationTypeNode
        operationName?: string
    }
      
    export type ParsedGraphQLRequest<
        VariablesType extends GraphQLVariables = GraphQLVariables,
      > =
        | (ParsedGraphQLQuery & {
            query: string
            variables?: VariablesType
          })
        | undefined

    export type GraphQLRequestParsedResult = {
        match: Match
        cookies: Record<string, string>
    } & (
        | ParsedGraphQLRequest<GraphQLVariables>
        /**
         * An empty version of the ParsedGraphQLRequest
         * which simplifies the return type of the resolver
         * when the request is to a non-matching endpoint
         */
        | {
            operationType?: undefined
            operationName?: undefined
            query?: undefined
            variables?: undefined
            }
    )

    class GraphQLHandler extends RequestHandler<
        GraphQLHandlerInfo,
        GraphQLRequestParsedResult,
        GraphQLResolverExtras<any>
    > {
        private endpoint: Path

        constructor(
            operationType: ExpectedOperationTypeNode,
            operationName: GraphQLHandlerNameSelector,
            endpoint: Path,
            resolver: ResponseResolver<GraphQLResolverExtras<any>, any, any>,
            options?: RequestHandlerOptions,
        );
      
        parseGraphQLRequestOrGetFromCache(
            request: Request,
        ): Promise<ParsedGraphQLRequest<GraphQLVariables>> 
      
        parse(args: { request: Request }): Promise<GraphQLRequestParsedResult>
        
        predicate(args: {
            request: Request
            parsedResult: GraphQLRequestParsedResult
        }): boolean;

        log(args: {
            request: Request
            response: Response
            parsedResult: GraphQLRequestParsedResult
        }): Promise<void>;

        protected extendResolverArgs(args: {
            request: Request
            parsedResult: GraphQLRequestParsedResult
        }): GraphQLResolverExtras<GraphQLVariables>
      
        static parsedRequestCache: WeakMap<
            Request,
            ParsedGraphQLRequest<GraphQLVariables>
        >;
    }

    export type GraphQLRequestHandler = <
        Query extends GraphQLQuery = GraphQLQuery,
        Variables extends GraphQLVariables = GraphQLVariables,
    >(
        operationName:
        | GraphQLHandlerNameSelector
        | DocumentNode
        | TypedDocumentNode<Query, Variables>,
        resolver: GraphQLResponseResolver<
        [Query] extends [never] ? GraphQLQuery : Query,
        Variables
    >,
        options?: RequestHandlerOptions,
    ) => GraphQLHandler


    export type http = {
        all: HttpRequestHandler,
        head: HttpRequestHandler,
        get: HttpRequestHandler,
        post: HttpRequestHandler,
        put: HttpRequestHandler,
        delete: HttpRequestHandler,
        patch: HttpRequestHandler,
        options: HttpRequestHandler,
    }

    export type graphql = {
        query: GraphQLRequestHandler,
        mutation: GraphQLRequestHandler,
        operation: GraphQLRequestHandler,
        link: (url: Path) => {
            query: GraphQLRequestHandler,
            mutation: GraphQLRequestHandler,
            operation: GraphQLRequestHandler
        }
    }

    export type router = http | graphql;

    export function passthrough (): StrictResponse<any>;
}