{
    "name": "Evidence",
    "type": "object",
    "properties": {
      "complaint_id": {
        "type": "string"
      },
      "type": {
        "type": "string",
        "enum": [
          "screenshot",
          "replay",
          "video",
          "note"
        ],
        "description": "Tipo di prova"
      },
      "file_url": {
        "type": "string"
      },
      "description": {
        "type": "string"
      },
      "submitted_by": {
        "type": "string"
      }
    },
    "required": [
      "complaint_id",
      "type",
      "submitted_by"
    ]
  }