{
    "name": "KYCDocument",
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string"
      },
      "pilot_id": {
        "type": "string"
      },
      "doc_type": {
        "type": "string",
        "enum": [
          "id_front",
          "id_back",
          "selfie",
          "iban_proof"
        ],
        "description": "Tipo documento"
      },
      "file_url": {
        "type": "string",
        "description": "URL documento caricato"
      },
      "status": {
        "type": "string",
        "enum": [
          "pending",
          "approved",
          "rejected"
        ],
        "default": "pending"
      },
      "rejected_reason": {
        "type": "string"
      },
      "approved_at": {
        "type": "string",
        "format": "date-time"
      },
      "reviewed_by": {
        "type": "string",
        "description": "Admin che ha revisionato"
      }
    },
    "required": [
      "user_id",
      "doc_type"
    ]
  }