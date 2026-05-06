{
    "name": "AuditLog",
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "description": "Azione eseguita"
      },
      "entity_type": {
        "type": "string"
      },
      "entity_id": {
        "type": "string"
      },
      "performed_by": {
        "type": "string"
      },
      "details": {
        "type": "string"
      },
      "severity": {
        "type": "string",
        "enum": [
          "info",
          "warning",
          "critical"
        ],
        "default": "info"
      }
    },
    "required": [
      "action",
      "performed_by"
    ]
  }