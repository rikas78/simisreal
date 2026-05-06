{
  "name": "Pilot",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "ID utente collegato"
    },
    "username": {
      "type": "string",
      "description": "Username unico del pilota"
    },
    "nationality": {
      "type": "string",
      "description": "Nazionalit\u00e0"
    },
    "main_simulator": {
      "type": "string",
      "enum": [
        "GT7",
        "Assetto Corsa",
        "iRacing",
        "MotoGP"
      ],
      "description": "Simulatore principale"
    },
    "role": {
      "type": "string",
      "enum": [
        "Pilota",
        "Team Member",
        "Team Manager",
        "Admin"
      ],
      "default": "Pilota"
    },
    "category": {
      "type": "string",
      "enum": [
        "START",
        "ROOKIE",
        "AMATEUR",
        "SEMI-PRO",
        "PRO",
        "K"
      ],
      "default": "START",
      "description": "Categoria del pilota"
    },
    "team_id": {
      "type": "string",
      "description": "ID della scuderia"
    },
    "team_name": {
      "type": "string",
      "description": "Nome della scuderia"
    },
    "avatar_url": {
      "type": "string",
      "description": "URL avatar"
    },
    "total_points": {
      "type": "number",
      "default": 0
    },
    "speed_points": {
      "type": "number",
      "default": 0
    },
    "sportsmanship_points": {
      "type": "number",
      "default": 0
    },
    "safety_rating": {
      "type": "string",
      "enum": [
        "S",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F"
      ],
      "default": "S"
    },
    "races_completed": {
      "type": "number",
      "default": 0
    },
    "wins": {
      "type": "number",
      "default": 0
    },
    "podiums": {
      "type": "number",
      "default": 0
    },
    "earnings": {
      "type": "number",
      "default": 0,
      "description": "Guadagni totali in euro (legacy)"
    },
    "wallet_id": {
      "type": "string",
      "description": "ID wallet GW collegato"
    },
    "kyc_status": {
      "type": "string",
      "enum": [
        "not_started",
        "pending",
        "approved",
        "rejected"
      ],
      "default": "not_started",
      "description": "Stato verifica identit\u00e0"
    },
    "suspended": {
      "type": "boolean",
      "default": false
    },
    "banned": {
      "type": "boolean",
      "default": false
    },
    "ban_reason": {
      "type": "string"
    }
  },
  "required": [
    "username",
    "nationality",
    "main_simulator"
  ]
}