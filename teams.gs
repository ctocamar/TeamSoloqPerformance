function getTeamPlayers(token, team) {
  var url = `${CONFIG.API_URL}/player/teamplayers/${team}`;
  return fetchApi(token, url);
}

function getTeamById(token, team) {
  var url = `${CONFIG.API_URL}/team/teams/${team}`;
  return fetchApi(token, url);
}
