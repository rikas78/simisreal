{
    "name": "Race",
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Nome della gara"
      },
      "championship": {
        "type": "string",
        "description": "Campionato di appartenenza"
      },
      "description": {
        "type": "string"
      },
      "regulations": {
        "type": "string"
      },
      "simulator": {
        "type": "string",
        "enum": [
          "GT7",
          "Assetto Corsa",
          "iRacing",
          "MotoGP"
        ]
      },
      "category": {
        "type": "string",
        "enum": [
          "GT3",
          "GT4",
          "Formula",
          "Rally",
          "Endurance"
        ]
      },
      "track": {
        "type": "string"
      },
      "track_image_url": {
        "type": "string"
      },
      "date": {
        "type": "string",
        "format": "date-time"
      },
      "duration_laps": {
        "type": "number"
      },
      "duration_minutes": {
        "type": "number"
      },
      "status": {
        "type": "string",
        "enum": [
          "upcoming",
          "live",
          "completed",
          "cancelled"
        ],
        "default": "upcoming"
      },
      "entry_fee": {
        "type": "number",
        "default": 0,
        "description": "Quota iscrizione in GW"
      },
      "max_participants": {
        "type": "number"
      },
      "current_participants": {
        "type": "number",
        "default": 0
      },
      "registered_pilot_ids": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "default": []
      },
      "image_url": {
        "type": "string"
      },
      "bop": {
        "type": "boolean",
        "default": false
      },
      "realistic_damage": {
        "type": "boolean",
        "default": true
      },
      "weather": {
        "type": "string",
        "enum": [
          "Fisso",
          "Dinamico"
        ],
        "default": "Fisso"
      },
      "fuel_consumption": {
        "type": "boolean",
        "default": false
      },
      "mandatory_pitstop": {
        "type": "boolean",
        "default": false
      },
      "stability_control": {
        "type": "string",
        "enum": [
          "Consentito",
          "Vietato"
        ],
        "default": "Consentito"
      },
      "escrow_amount": {
        "type": "number",
        "default": 0,
        "description": "GW depositati in escrow prima delle iscrizioni"
      },
      "escrow_status": {
        "type": "string",
        "enum": [
          "none",
          "pending",
          "deposited",
          "frozen",
          "released"
        ],
        "default": "none",
        "description": "Stato escrow montepremi"
      },
      "prize_frozen": {
        "type": "boolean",
        "default": false,
        "description": "Premio congelato per contestazione"
      },
      "has_real_prize": {
        "type": "boolean",
        "default": false,
        "description": "Gara con montepremi reale in GW"
      }
    },
    "required": [
      "title",
      "simulator",
      "date",
      "status"
    ]
  }