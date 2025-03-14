function importTeamStats() {

    var cache = CacheService.getScriptCache();
    var queue = JSON.parse(cache.get("teamQueue") || "[]");

    if (queue.length === 0) {
        Logger.log("Todas las hojas han sido generadas.");
        return;
    }
    token = obtenerToken();
    team = queue.shift();
    teamObject = getTeamById(token,team);
    teamName = teamObject.nombre_corto;
    cache.put("teamQueue", JSON.stringify(queue), 3600); // Guarda la cola
    teamPlayers = getTeamPlayers(token,team);
    var playerNicks = teamPlayers.map(player => player.nick);
    fileName = teamName + " SOLOQ PERFORMANCE";

    CacheService.getScriptCache().put("playerQueue", JSON.stringify(playerNicks), 3600);
    CacheService.getScriptCache().put("currentFile", fileName, 3600);
    managePlayerStats(); // Inicia la ejecución en cadena

    manageTeamTrigger(queue);
}

function manageTeamTrigger(queue){

      
    var triggers = ScriptApp.getProjectTriggers();

    for (var i = 0; i < triggers.length; i++) {
      if(triggers[i].getHandlerFunction()=== "importTeamStats"){

        ScriptApp.deleteTrigger(triggers[i]);
      }
    }
    if (queue.length > 0) {
        ScriptApp.newTrigger("importTeamStats")
            .timeBased()
            .after(60000 * 8) // Espera 8 minutos
            .create();
    } else {
        Logger.log("Proceso completado.");
    }

}

function managePlayerTrigger(queue){

      
    var triggers = ScriptApp.getProjectTriggers();

    for (var i = 0; i < triggers.length; i++) {
      if(triggers[i].getHandlerFunction()=== "managePlayerStats"){

        ScriptApp.deleteTrigger(triggers[i]);
      }
    }
    if (queue.length > 0) {
        ScriptApp.newTrigger("managePlayerStats")
            .timeBased()
            .after(60000 * 1) // Espera 1 minuto
            .create();
    } else {
        Logger.log("Proceso completado.");
    }

}

function startProcessingTeams() {
    CacheService.getScriptCache().put("teamQueue", JSON.stringify(CONFIG.NEXOTEAMS), 3600);
    importTeamStats(); 
}

function startProcessingTeamsCt() {
    CacheService.getScriptCache().put("teamQueue", JSON.stringify(CONFIG.CTTEAMS), 3600);
    importTeamStats(); 
}

function testToken(){


  var token = obtenerToken();

  console.log(token);



}





