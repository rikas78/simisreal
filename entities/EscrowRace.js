{
    "name": "EscrowRace",
    "type": "object",
    "properties": {
      "race_id": {
        "type": "string"
      },
      "race_title": {
        "type": "string"
      },
      "organizer_id": {
        "type": "string",
        "description": "Pilot ID organizzatore"
      },
      "amount_gw": {
        "type": "number",
        "description": "GW depositati in escrow"
      },
      "status": {
        "type": "string",
        "enum": [
          "pending",
          "deposited",
          "frozen",
          "released",
          "refunded"
        ],
        "default": "pending"
      },
      "frozen_reason": {
        "type": "string",
        "description": "Motivo freeze (es. ID contestazione)"
      },
      "frozen_at": {
        "type": "string",
        "format": "date-time"
      },
      "released_at": {
        "type": "string",
        "format": "date-time"
      },
      "released_by": {
        "type": "string",
        "description": "Admin che ha sbloccato"
      },
      "wallet_transaction_id": {
        "type": "string"
      }
    },
    "required": [
      "race_id",
      "organizer_id",
      "amount_gw"
    ]
  }