{
    "name": "Wallet",
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "ID utente proprietario"
      },
      "pilot_id": {
        "type": "string",
        "description": "ID pilota collegato"
      },
      "gw_disponibili": {
        "type": "number",
        "default": 0,
        "description": "GW prelevabili (premi, vendite, compensi)"
      },
      "gw_bonus": {
        "type": "number",
        "default": 0,
        "description": "GW Bonus/Crediti Gara non prelevabili"
      },
      "gw_bloccati": {
        "type": "number",
        "default": 0,
        "description": "GW in escrow o contestazione"
      },
      "bonus_expires_at": {
        "type": "string",
        "format": "date-time",
        "description": "Scadenza GW Bonus benvenuto"
      },
      "last_updated": {
        "type": "string",
        "format": "date-time"
      }
    },
    "required": [
      "user_id"
    ]
  }