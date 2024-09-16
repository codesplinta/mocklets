export declare type ISODateString = string;

export interface DefaultSession {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    expires: ISODateString;
}

declare module '.next/auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session extends DefaultSession {
        accessToken: string | null;
        expiresAt: number | null;
        isNewCustomer?: boolean;
    }

    export interface SignInOptions extends Record<string, unknown> {
        /**
         * Specify to which URL the user will be redirected after signing in. Defaults to the page URL the sign-in is initiated from.
         *
         * [Documentation](https://next-auth.js.org/getting-started/client#specifying-a-callbackurl)
         */
        callbackUrl?: string
        /** [Documentation](https://next-auth.js.org/getting-started/client#using-the-redirect-false-option) */
        redirect?: boolean
      }
      
      export interface SignOutResponse {
        url: string
      }

      export interface SignInResponse {
        error: string | undefined
        status: number
        ok: boolean
        url: string | null
      }
}