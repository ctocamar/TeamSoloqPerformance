function obtenerToken(maxRetries = 3, delayMs = 1000) {
  var url = `${CONFIG.API_URL}/auth/generateJWT`;
  var payload = {
    "api_key": CONFIG.API_KEY,
    "permisos": CONFIG.PERMISOS,
    "user": "GoogleSheets"
  };
  var options = { "method": "post", "contentType": "application/json", "payload": JSON.stringify(payload) };
  
  for (var attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      var response = UrlFetchApp.fetch(url, options);
      var jsonResponse = JSON.parse(response.getContentText());
      if (jsonResponse.token) {
        return jsonResponse.token; 
      } else {
        Logger.log("Respuesta sin token en intento " + attempt);
      }
    } catch (e) {
      Logger.log("Intento " + attempt + " fallido: " + e.toString());
    }
    if (attempt < maxRetries) {
      Utilities.sleep(delayMs); 
    } else {
      throw new Error("Error obteniendo token tras " + maxRetries + " intentos.");
    }
  }
}
