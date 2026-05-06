{
    "name": "Activity",
    "type": "object",
    "properties": {
      "type": {
        "type": "string",
        "enum": [
          "registration",
          "result",
          "complaint_resolved",
          "new_race",
          "team_created"
        ],
        "description": "Tipo di attivit\u00e0"
      },
      "message": {
        "type": "string",
        "description": "Messaggio dell'attivit\u00e0"
      },
      "pilot_username": {
        "type": "string",
        "description": "Username del pilota coinvolto"
      },
      "race_id": {
        "type": "string",
        "description": "ID della gara collegata"
      },
      "race_title": {
        "type": "string",
        "description": "Titolo della gara collegata"
      }
    },
    "required": [
      "type",
      "message"
    ]
  }