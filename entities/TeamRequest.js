{
    "name": "TeamRequest",
    "type": "object",
    "properties": {
      "team_id": {
        "type": "string",
        "description": "ID della scuderia"
      },
      "team_name": {
        "type": "string",
        "description": "Nome della scuderia"
      },
      "pilot_id": {
        "type": "string",
        "description": "ID del pilota richiedente"
      },
      "pilot_username": {
        "type": "string",
        "description": "Username del pilota"
      },
      "status": {
        "type": "string",
        "enum": [
          "pending",
          "accepted",
          "rejected"
        ],
        "default": "pending",
        "description": "Stato della richiesta"
      },
      "message": {
        "type": "string",
        "description": "Messaggio di presentazione"
      }
    },
    "required": [
      "team_id",
      "pilot_id",
      "pilot_username"
    ]
  }