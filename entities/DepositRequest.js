{
    "name": "DepositRequest",
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string"
      },
      "pilot_id": {
        "type": "string"
      },
      "amount_eur": {
        "type": "number",
        "description": "Importo in euro"
      },
      "gw_equivalent": {
        "type": "number",
        "description": "GW equivalenti (EUR \u00d7 40000)"
      },
      "method": {
        "type": "string",
        "enum": [
          "card",
          "paypal",
          "bank_transfer",
          "test_sandbox"
        ],
        "default": "test_sandbox"
      },
      "status": {
        "type": "string",
        "enum": [
          "pending",
          "completed",
          "failed",
          "cancelled"
        ],
        "default": "pending"
      },
      "tx_id": {
        "type": "string",
        "description": "ID transazione provider (sandbox)"
      },
      "wallet_transaction_id": {
        "type": "string"
      },
      "notes": {
        "type": "string"
      }
    },
    "required": [
      "user_id",
      "amount_eur",
      "method"
    ]
  }