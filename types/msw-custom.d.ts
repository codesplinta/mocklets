

declare const bodyType: unique symbol

declare module '.msw' {

    import { BatchInterceptor, Interceptor, HttpRequestEventMap } from '@mswjs/interceptors';
    import { EventMap, Emitter } from 'strict-event-emitter';

    /**
    Matches any [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).

    @category Type
    */
    export type Primitive =
    | null
    | undefined
    | string
    | number
    | boolean
    | symbol
    | bigint;

    /**
    Matches any primitive, `void`, `Date`, or `RegExp` value.
    */
    export type BuiltIns = Primitive | void | Date | RegExp;

    /**
    @see PartialDeep
    */
    export type PartialDeepOptions = {
        /**
        Whether to affect the individual elements of arrays and tuples.

        @default false
        */
        readonly recurseIntoArrays?: boolean;
    };

    /**
    Create a type from another type with all keys and nested keys set to optional.

    Use-cases:
    - Merging a default settings/config object with another object, the second object would be a deep partial of the default object.
    - Mocking and testing complex entities, where populating an entire object with its keys would be redundant in terms of the mock or test.

    @example
    ```
    import type {PartialDeep} from 'type-fest';

    const settings: Settings = {
        textEditor: {
            fontSize: 14;
            fontColor: '#000000';
            fontWeight: 400;
        }
        autocomplete: false;
        autosave: true;
    };

    const applySavedSettings = (savedSettings: PartialDeep<Settings>) => {
        return {...settings, ...savedSettings};
    }

    settings = applySavedSettings({textEditor: {fontWeight: 500}});
    ```

    By default, this does not affect elements in array and tuple types. You can change this by passing `{recurseIntoArrays: true}` as the second type argument:

    ```
    import type {PartialDeep} from 'type-fest';

    interface Settings {
        languages: string[];
    }

    const partialSettings: PartialDeep<Settings, {recurseIntoArrays: true}> = {
        languages: [undefined]
    };
    ```

    @category Object
    @category Array
    @category Set
    @category Map
    */
    export type PartialDeep<T, Options extends PartialDeepOptions = {}> = T extends BuiltIns | (((...arguments_: any[]) => unknown)) | (new (...arguments_: any[]) => unknown)
        ? T
        : T extends Map<infer KeyType, infer ValueType>
            ? PartialMapDeep<KeyType, ValueType, Options>
            : T extends Set<infer ItemType>
                ? PartialSetDeep<ItemType, Options>
                : T extends ReadonlyMap<infer KeyType, infer ValueType>
                    ? PartialReadonlyMapDeep<KeyType, ValueType, Options>
                    : T extends ReadonlySet<infer ItemType>
                        ? PartialReadonlySetDeep<ItemType, Options>
                        : T extends object
                            ? T extends ReadonlyArray<infer ItemType> // Test for arrays/tuples, per https://github.com/microsoft/TypeScript/issues/35156
                                ? Options['recurseIntoArrays'] extends true
                                    ? ItemType[] extends T // Test for arrays (non-tuples) specifically
                                        ? readonly ItemType[] extends T // Differentiate readonly and mutable arrays
                                            ? ReadonlyArray<PartialDeep<ItemType | undefined, Options>>
                                            : Array<PartialDeep<ItemType | undefined, Options>>
                                        : PartialObjectDeep<T, Options> // Tuples behave properly
                                    : T // If they don't opt into array testing, just use the original type
                                : PartialObjectDeep<T, Options>
                            : unknown;

    /**
    Same as `PartialDeep`, but accepts only `Map`s and as inputs. Internal helper for `PartialDeep`.
    */
    type PartialMapDeep<KeyType, ValueType, Options extends PartialDeepOptions> = {} & Map<PartialDeep<KeyType, Options>, PartialDeep<ValueType, Options>>;

    /**
    Same as `PartialDeep`, but accepts only `Set`s as inputs. Internal helper for `PartialDeep`.
    */
    type PartialSetDeep<T, Options extends PartialDeepOptions> = {} & Set<PartialDeep<T, Options>>;

    /**
    Same as `PartialDeep`, but accepts only `ReadonlyMap`s as inputs. Internal helper for `PartialDeep`.
    */
    type PartialReadonlyMapDeep<KeyType, ValueType, Options extends PartialDeepOptions> = {} & ReadonlyMap<PartialDeep<KeyType, Options>, PartialDeep<ValueType, Options>>;

    /**
    Same as `PartialDeep`, but accepts only `ReadonlySet`s as inputs. Internal helper for `PartialDeep`.
    */
    type PartialReadonlySetDeep<T, Options extends PartialDeepOptions> = {} & ReadonlySet<PartialDeep<T, Options>>;

    /**
    Same as `PartialDeep`, but accepts only `object`s as inputs. Internal helper for `PartialDeep`.
    */
    type PartialObjectDeep<ObjectType extends object, Options extends PartialDeepOptions> = {
        [KeyType in keyof ObjectType]?: PartialDeep<ObjectType[KeyType], Options>
    };

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

    interface UnhandledRequestPrint {
        warning(): void;
        error(): void;
    }
    type UnhandledRequestCallback = (request: Request, print: UnhandledRequestPrint) => void;
    type UnhandledRequestStrategy = 'bypass' | 'warn' | 'error' | UnhandledRequestCallback;

    interface SharedOptions {
        /**
         * Specifies how to react to a request that has no corresponding
         * request handler. Warns on unhandled requests by default.
         *
         * @example worker.start({ onUnhandledRequest: 'bypass' })
         * @example worker.start({ onUnhandledRequest: 'warn' })
         * @example server.listen({ onUnhandledRequest: 'error' })
         */
        onUnhandledRequest?: UnhandledRequestStrategy;
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

    type LifeCycleEventsMap = {
        'request:start': [
            args: {
                request: Request;
                requestId: string;
            }
        ];
        'request:match': [
            args: {
                request: Request;
                requestId: string;
            }
        ];
        'request:unhandled': [
            args: {
                request: Request;
                requestId: string;
            }
        ];
        'request:end': [
            args: {
                request: Request;
                requestId: string;
            }
        ];
        'response:mocked': [
            args: {
                response: Response;
                request: Request;
                requestId: string;
            }
        ];
        'response:bypass': [
            args: {
                response: Response;
                request: Request;
                requestId: string;
            }
        ];
        unhandledException: [
            args: {
                error: Error;
                request: Request;
                requestId: string;
            }
        ];
    };
    type LifeCycleEventEmitter<EventsMap extends Record<string | symbol, any>> = Pick<Emitter<EventsMap>, 'on' | 'removeListener' | 'removeAllListeners'>;
    
    interface SetupServerCommon {
        /**
         * Starts requests interception based on the previously provided request handlers.
         *
         * @see {@link https://mswjs.io/docs/api/setup-server/listen `server.listen()` API reference}
         */
        listen(options?: PartialDeep<SharedOptions>): void;
        /**
         * Stops requests interception by restoring all augmented modules.
         *
         * @see {@link https://mswjs.io/docs/api/setup-server/close `server.close()` API reference}
         */
        close(): void;
        /**
         * Prepends given request handlers to the list of existing handlers.
         *
         * @see {@link https://mswjs.io/docs/api/setup-server/use `server.use()` API reference}
         */
        use(...handlers: Array<RequestHandler>): void;
        /**
         * Marks all request handlers that respond using `res.once()` as unused.
         *
         * @see {@link https://mswjs.io/docs/api/setup-server/restore-handlers `server.restore-handlers()` API reference}
         */
        restoreHandlers(): void;
        /**
         * Resets request handlers to the initial list given to the `setupServer` call, or to the explicit next request handlers list, if given.
         *
         * @see {@link https://mswjs.io/docs/api/setup-server/reset-handlers `server.reset-handlers()` API reference}
         */
        resetHandlers(...nextHandlers: Array<RequestHandler>): void;
        /**
         * Returns a readonly list of currently active request handlers.
         *
         * @see {@link https://mswjs.io/docs/api/setup-server/list-handlers `server.listHandlers()` API reference}
         */
        listHandlers(): ReadonlyArray<RequestHandler<RequestHandlerDefaultInfo, any>>;
        /**
         * Life-cycle events.
         * Life-cycle events allow you to subscribe to the internal library events occurring during the request/response handling.
         *
         * @see {@link https://mswjs.io/docs/api/life-cycle-events Life-cycle Events API reference}
         */
        events: LifeCycleEventEmitter<LifeCycleEventsMap>;
    }

    interface SetupServer extends SetupServerCommon {
        /**
         * Wraps the given function in a boundary. Any changes to the
         * network behavior (e.g. adding runtime request handlers via
         * `server.use()`) will be scoped to this boundary only.
         * @param callback A function to run (e.g. a test)
         *
         * @see {@link https://mswjs.io/docs/api/setup-server/boundary `server.boundary()` API reference}
         */
        boundary<Args extends Array<any>, R>(callback: (...args: Args) => R): (...args: Args) => R;
    }

    type DisposableSubscription = () => void;
    class Disposable {
        protected subscriptions: Array<DisposableSubscription>;
        dispose(): void;
    }

    abstract class HandlersController {
        abstract prepend(runtimeHandlers: Array<RequestHandler>): void;
        abstract reset(nextHandles: Array<RequestHandler>): void;
        abstract currentHandlers(): Array<RequestHandler>;
    }

    abstract class SetupApi<EventsMap extends EventMap> extends Disposable {
        protected handlersController: HandlersController;
        protected readonly emitter: Emitter<EventsMap>;
        protected readonly publicEmitter: Emitter<EventsMap>;
        readonly events: LifeCycleEventEmitter<EventsMap>;
        constructor(...initialHandlers: Array<RequestHandler>);
        private validateHandlers;
        use(...runtimeHandlers: Array<RequestHandler>): void;
        restoreHandlers(): void;
        resetHandlers(...nextHandlers: Array<RequestHandler>): void;
        listHandlers(): ReadonlyArray<RequestHandler<RequestHandlerDefaultInfo, any, any>>;
        private createLifeCycleEvents;
    }

    class SetupServerCommonApi extends SetupApi<LifeCycleEventsMap> implements SetupServerCommon {
        protected readonly interceptor: BatchInterceptor<Array<Interceptor<HttpRequestEventMap>>, HttpRequestEventMap>;
        private resolvedOptions;
        constructor(interceptors: Array<{
            new (): Interceptor<HttpRequestEventMap>;
        }>, handlers: Array<RequestHandler>);
        /**
         * Subscribe to all requests that are using the interceptor object
         */
        private init;
        listen(options?: Partial<SharedOptions>): void;
        close(): void;
    }

    export class SetupServerApi extends SetupServerCommonApi implements SetupServer {
        constructor(handlers: Array<RequestHandler>);
        boundary<Args extends Array<any>, R>(callback: (...args: Args) => R): (...args: Args) => R;
        close(): void;
    }

    export type router = http | graphql;

    export function passthrough (): StrictResponse<any>;
}