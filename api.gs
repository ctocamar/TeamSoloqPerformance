function fetchApi(token, url, maxRetries = 6, delayMs = 1000) {
  var options = {
    "method": "get",
    "headers": { "Authorization": "Bearer " + token }
  };

  for (var attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      var response = UrlFetchApp.fetch(url, options);
      var jsonResponse = JSON.parse(response.getContentText());
      return jsonResponse; 
    } catch (e) {
      Logger.log("Intento " + attempt + " fallido: " + e.toString());
      if (attempt < maxRetries) {
        Utilities.sleep(delayMs); 
      } else {
        throw new Error("Error tras " + maxRetries + " intentos: " + e.toString());
      }
    }
  }
}
