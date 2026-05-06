{
    "name": "WalletTransaction",
    "type": "object",
    "properties": {
      "wallet_id": {
        "type": "string",
        "description": "ID wallet"
      },
      "user_id": {
        "type": "string"
      },
      "type": {
        "type": "string",
        "enum": [
          "deposit",
          "withdrawal",
          "prize",
          "bonus_credit",
          "freeze",
          "unfreeze",
          "refund_credit",
          "fee",
          "welcome_bonus"
        ],
        "description": "Tipo operazione"
      },
      "amount": {
        "type": "number",
        "description": "Importo GW (positivo = credito, negativo = debito)"
      },
      "causale": {
        "type": "string",
        "description": "Descrizione leggibile del movimento"
      },
      "balance_disponibili_after": {
        "type": "number",
        "default": 0
      },
      "balance_bonus_after": {
        "type": "number",
        "default": 0
      },
      "balance_bloccati_after": {
        "type": "number",
        "default": 0
      },
      "reference_id": {
        "type": "string",
        "description": "ID gara/ordine/richiesta collegata"
      },
      "reference_type": {
        "type": "string",
        "enum": [
          "race",
          "deposit",
          "withdrawal",
          "escrow",
          "complaint",
          "system"
        ]
      },
      "status": {
        "type": "string",
        "enum": [
          "completed",
          "pending",
          "failed",
          "reversed"
        ],
        "default": "completed"
      }
    },
    "required": [
      "wallet_id",
      "user_id",
      "type",
      "amount",
      "causale"
    ]
  }