{
    "name": "Complaint",
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
      "submitted_by": {
        "type": "string",
        "description": "Username del pilota"
      },
      "against_pilot": {
        "type": "string",
        "description": "Username del pilota accusato"
      },
      "description": {
        "type": "string",
        "description": "Descrizione del reclamo"
      },
      "evidence_url": {
        "type": "string",
        "description": "URL del video/immagine di prova"
      },
      "status": {
        "type": "string",
        "enum": [
          "pending",
          "reviewing",
          "resolved",
          "rejected"
        ],
        "default": "pending",
        "description": "Stato del reclamo"
      },
      "resolution": {
        "type": "string",
        "description": "Esito del reclamo"
      },
      "penalty": {
        "type": "string",
        "description": "Penalit\u00e0 applicata"
      }
    },
    "required": [
      "race_id",
      "submitted_by",
      "description"
    ]
  }