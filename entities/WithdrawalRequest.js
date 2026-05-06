{
    "name": "WithdrawalRequest",
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string"
      },
      "pilot_id": {
        "type": "string"
      },
      "amount_gw": {
        "type": "number",
        "description": "GW richiesti (lordo)"
      },
      "fee_gw": {
        "type": "number",
        "description": "Commissione 10% in GW"
      },
      "amount_gw_net": {
        "type": "number",
        "description": "GW netti dopo fee"
      },
      "amount_eur_net": {
        "type": "number",
        "description": "Euro netti accreditati"
      },
      "method": {
        "type": "string",
        "enum": [
          "bank_transfer",
          "paypal",
          "test_sandbox"
        ],
        "default": "test_sandbox"
      },
      "iban": {
        "type": "string",
        "description": "IBAN (sandbox: dati test)"
      },
      "paypal_email": {
        "type": "string"
      },
      "status": {
        "type": "string",
        "enum": [
          "pending",
          "approved",
          "processing",
          "completed",
          "rejected",
          "cancelled"
        ],
        "default": "pending"
      },
      "rejection_reason": {
        "type": "string"
      },
      "kyc_verified": {
        "type": "boolean",
        "default": false
      },
      "tx_id": {
        "type": "string"
      },
      "wallet_transaction_id": {
        "type": "string"
      }
    },
    "required": [
      "user_id",
      "amount_gw",
      "method"
    ]
  }