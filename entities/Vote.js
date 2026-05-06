{
    "name": "Vote",
    "type": "object",
    "properties": {
      "motion_id": {
        "type": "string",
        "description": "ID della mozione"
      },
      "motion_title": {
        "type": "string"
      },
      "voter_username": {
        "type": "string"
      },
      "choice": {
        "type": "string",
        "enum": [
          "yes",
          "no",
          "abstain"
        ]
      },
      "voter_role": {
        "type": "string"
      }
    },
    "required": [
      "motion_id",
      "voter_username",
      "choice"
    ]
  }