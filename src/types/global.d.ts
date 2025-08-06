// Global type definitions for Google APIs

declare global {
  interface Window {
    gapi: {
      load: (api: string, options: { callback: () => void; onerror: () => void }) => void;
      auth2: {
        init: (config: { client_id: string; scope: string }) => Promise<GoogleAuth>;
        getAuthInstance: () => GoogleAuth | null;
      };
    };
  }

  interface GoogleAuth {
    signIn: (options?: { scope: string }) => Promise<GoogleUser>;
    signOut: () => Promise<void>;
    isSignedIn: {
      get: () => boolean;
    };
  }

  interface GoogleUser {
    getAuthResponse: () => {
      id_token: string;
      access_token: string;
    };
    getBasicProfile: () => {
      getId: () => string;
      getName: () => string;
      getEmail: () => string;
    };
  }
}

export {};