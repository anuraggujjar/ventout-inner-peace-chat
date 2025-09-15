declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            ux_mode: string;
            callback: (response: any) => void;
          }) => {
            requestCode: () => void;
          };
        };
        id: {
          disableAutoSelect: () => void;
        };
      };
    };
  }

  const google: {
    accounts: {
      oauth2: {
        initCodeClient: (config: {
          client_id: string;
          scope: string;
          ux_mode: string;
          callback: (response: any) => void;
        }) => {
          requestCode: () => void;
        };
      };
      id: {
        disableAutoSelect: () => void;
      };
    };
  };
}

export {};