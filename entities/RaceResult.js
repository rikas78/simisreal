{
    "name": "RaceResult",
    "type": "object",
    "properties": {
      "race_id": {
        "type": "string",
        "description": "ID della gara"
      },
      "race_title": {
        "type": "string",
        "description": "Titolo della gara"
      },
      "pilot_id": {
        "type": "string",
        "description": "ID del pilota"
      },
      "pilot_username": {
        "type": "string",
        "description": "Username del pilota"
      },
      "position": {
        "type": "number",
        "description": "Posizione finale"
      },
      "gap": {
        "type": "string",
        "description": "Distacco dal leader (es: +1:23.4)"
      },
      "speed_points": {
        "type": "number",
        "default": 0,
        "description": "Punti velocit\u00e0 assegnati"
      },
      "sportsmanship_points": {
        "type": "number",
        "default": 10,
        "description": "Punti sportivit\u00e0"
      },
      "total_points": {
        "type": "number",
        "default": 0,
        "description": "Punti gara totali"
      },
      "penalties": {
        "type": "string",
        "description": "Penalit\u00e0 applicate"
      },
      "notes": {
        "type": "string",
        "description": "Note aggiuntive"
      },
      "verified": {
        "type": "boolean",
        "default": false,
        "description": "Risultati verificati"
      },
      "prize_distributed": {
        "type": "boolean",
        "default": false,
        "description": "Montepremi distribuito"
      },
      "prize_distributed_date": {
        "type": "string",
        "format": "date",
        "description": "Data distribuzione montepremi"
      }
    },
    "required": [
      "race_id",
      "pilot_id",
      "position"
    ]
  }