{
    "name": "Appeal",
    "type": "object",
    "properties": {
      "complaint_id": {
        "type": "string",
        "description": "ID del reclamo originale"
      },
      "submitted_by": {
        "type": "string"
      },
      "reason": {
        "type": "string",
        "description": "Motivazione del ricorso"
      },
      "new_evidence_url": {
        "type": "string",
        "description": "Nuova prova allegata"
      },
      "status": {
        "type": "string",
        "enum": [
          "pending",
          "accepted",
          "rejected"
        ],
        "default": "pending"
      },
      "reviewed_by": {
        "type": "string"
      },
      "outcome": {
        "type": "string",
        "description": "Esito del ricorso"
      }
    },
    "required": [
      "complaint_id",
      "submitted_by",
      "reason"
    ]
  }