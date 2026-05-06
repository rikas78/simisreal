{
    "name": "Message",
    "type": "object",
    "properties": {
      "type": {
        "type": "string",
        "enum": [
          "dm",
          "race_chat"
        ],
        "description": "DM tra piloti o chat gara"
      },
      "race_id": {
        "type": "string",
        "description": "ID gara (solo per race_chat)"
      },
      "sender_id": {
        "type": "string",
        "description": "ID utente mittente"
      },
      "sender_username": {
        "type": "string",
        "description": "Username mittente"
      },
      "recipient_id": {
        "type": "string",
        "description": "ID utente destinatario (solo per DM)"
      },
      "recipient_username": {
        "type": "string",
        "description": "Username destinatario (solo per DM)"
      },
      "content": {
        "type": "string",
        "description": "Testo del messaggio"
      }
    },
    "required": [
      "type",
      "sender_id",
      "sender_username",
      "content"
    ]
  }