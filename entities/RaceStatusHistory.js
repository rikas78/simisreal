{
    "name": "RaceStatusHistory",
    "type": "object",
    "properties": {
      "race_id": {
        "type": "string"
      },
      "race_title": {
        "type": "string"
      },
      "from_status": {
        "type": "string"
      },
      "to_status": {
        "type": "string"
      },
      "changed_by": {
        "type": "string"
      },
      "note": {
        "type": "string"
      }
    },
    "required": [
      "race_id",
      "to_status",
      "changed_by"
    ]
  }