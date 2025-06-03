declare module 'midtrans-client' {
  namespace midtransClient {
    interface TransactionDetails {
      order_id: string;
      gross_amount: number;
    }

    interface CustomerDetails {
      first_name: string;
      last_name?: string;
      email: string;
      phone?: string;
    }

    interface SnapTransactionParams {
      transaction_details: TransactionDetails;
      customer_details?: CustomerDetails;
      item_details?: any[];
      [key: string]: any;
    }

    class Snap {
      constructor(config: {
        isProduction: boolean;
        serverKey: string;
        clientKey?: string;
      });

      createTransaction(
        parameters: SnapTransactionParams
      ): Promise<{ token: string; redirect_url: string }>;
    }
  }

  export = midtransClient;
}
