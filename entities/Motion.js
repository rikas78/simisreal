{
    "name": "Motion",
    "type": "object",
    "properties": {
      "title": {
        "type": "string"
      },
      "description": {
        "type": "string"
      },
      "proposed_by": {
        "type": "string"
      },
      "category": {
        "type": "string",
        "enum": [
          "regola",
          "penalita",
          "governance",
          "carriera",
          "altro"
        ]
      },
      "status": {
        "type": "string",
        "enum": [
          "open",
          "closed",
          "approved",
          "rejected"
        ],
        "default": "open"
      },
      "votes_yes": {
        "type": "number",
        "default": 0
      },
      "votes_no": {
        "type": "number",
        "default": 0
      },
      "votes_abstain": {
        "type": "number",
        "default": 0
      },
      "eligible_roles": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Ruoli abilitati al voto"
      },
      "deadline": {
        "type": "string",
        "format": "date-time"
      }
    },
    "required": [
      "title",
      "description",
      "proposed_by"
    ]
  }