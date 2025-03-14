function managePlayerStats() {

  try {
    var cache = CacheService.getScriptCache();
    var queue = JSON.parse(cache.get("playerQueue") || "[]");
    var fileName = cache.get("currentFile");
    var player = queue.shift();
    cache.put("playerQueue", JSON.stringify(queue), 3600);
    Logger.log(player);
    Logger.log(fileName);

    var sheet = resetSheet(player);

    importMatchStats(player, sheet);
    updateRemoteSheet(fileName, player);
    deleteSheet(player);

    managePlayerTrigger(queue);

  } catch (error) {

      if (error.message.includes("Address unavailable")) {
        queue.push(player);
        logError(error.message + " -- Requeued", player, fileName);

        cache.put("playerQueue", JSON.stringify(queue), 3600);

      }else{

        logError(error, player, fileName);

      }

      
        deleteSheet(player);
        managePlayerTrigger(queue);

  }
}
