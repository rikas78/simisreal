{
    "name": "Announcement",
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Titolo annuncio"
      },
      "content": {
        "type": "string",
        "description": "Corpo del messaggio"
      },
      "category": {
        "type": "string",
        "enum": [
          "hardware",
          "setup",
          "livrea",
          "coaching",
          "slot_team",
          "evento",
          "broadcast",
          "altro"
        ],
        "description": "Categoria annuncio"
      },
      "author_username": {
        "type": "string"
      },
      "price": {
        "type": "number",
        "description": "Prezzo se vendita/servizio"
      },
      "contact": {
        "type": "string",
        "description": "Contatto (discord, email, etc)"
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
      "pinned": {
        "type": "boolean",
        "default": false
      }
    },
    "required": [
      "title",
      "content",
      "category"
    ]
  }