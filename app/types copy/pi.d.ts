export {};

declare global {
  interface Window {
    Pi?: {
      init: (config: {
        version: string;
        sandbox?: boolean;
      }) => Promise<void> | void;

      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: unknown) => void
      ) => Promise<{
        accessToken: string;
        user: {
          uid?: string;
          username: string;
        };
      }>;

      Ads?: {
        preloadRewardedVideo?: () => Promise<unknown> | void;
        showRewardedVideo?: () => Promise<{
          adFinished: boolean;
        }>;
      };
    };
  }
}