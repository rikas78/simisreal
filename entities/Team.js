{
    "name": "Team",
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Nome della scuderia"
      },
      "tag": {
        "type": "string",
        "description": "Tag breve della scuderia (es. [FER])"
      },
      "logo_url": {
        "type": "string",
        "description": "Logo della scuderia"
      },
      "manager_id": {
        "type": "string",
        "description": "ID del Team Manager"
      },
      "manager_username": {
        "type": "string",
        "description": "Username del Team Manager"
      },
      "member_count": {
        "type": "number",
        "default": 1,
        "description": "Numero di membri"
      },
      "total_points": {
        "type": "number",
        "default": 0,
        "description": "Punti totali della scuderia"
      },
      "description": {
        "type": "string",
        "description": "Descrizione della scuderia"
      }
    },
    "required": [
      "name",
      "tag"
    ]
  }