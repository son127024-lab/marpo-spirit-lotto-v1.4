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

      createPayment?: (
        paymentData: {
          amount: number;
          memo: string;
          metadata: Record<string, unknown>;
        },
        callbacks: {
          onReadyForServerApproval: (paymentId: string) => void;
          onReadyForServerCompletion: (paymentId: string, txid: string) => void;
          onCancel: (paymentId: string) => void;
          onError: (error: unknown, payment?: unknown) => void;
        }
      ) => Promise<unknown> | void;

      Ads?: {
        preloadRewardedVideo?: () => Promise<unknown> | void;
        showRewardedVideo?: () => Promise<{
          adFinished: boolean;
        }>;
      };
    };
  }
}