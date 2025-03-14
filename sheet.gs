function logError(message, player, fileName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Logs");
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Logs");
  }
  
  var row = sheet.appendRow([new Date(), player, fileName, message]);
  styleLog(row);
}

function styleLog(row) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Logs");
  var range = sheet.getRange(row.getRow(), 1, 1, row.getLastCell().getColumn());
  var backgroundColor = row.getRow() % 2 === 0 ? "#f2f2f2" : "#ffffff";
  range.setBackground(backgroundColor);
  sheet.getRange(row.getRow(), 1).setFontColor("#333333").setFontWeight("bold").setFontSize(10);
  sheet.getRange(row.getRow(), 2).setFontColor("#0066cc").setFontSize(12);
  sheet.getRange(row.getRow(), 3).setFontColor("#ff3333").setFontSize(12);
  sheet.autoResizeColumns(1, 3);
}

function updateRemoteSheet(fileName, sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName); 
  if (!sheet) {
    SpreadsheetApp.getUi().alert("La hoja con el nombre '" + sheetName + "' no existe.");
    return;
  }

  var folder = DriveApp.getFolderById(CONFIG.NEXOFOLDER);
  var files = folder.getFilesByName(fileName);
  var file, newSs;

  if (files.hasNext()) {
    file = files.next(); 
    newSs = SpreadsheetApp.openById(file.getId());
  } else {
    var newFile = SpreadsheetApp.create(fileName);
    var newFileId = newFile.getId(); 
    file = DriveApp.getFileById(newFileId);
    folder.addFile(file); 
    DriveApp.getRootFolder().removeFile(file); 
    newSs = SpreadsheetApp.openById(newFileId);
    DriveApp.getFileById(newFileId).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  }

  var existingSheet = newSs.getSheetByName(sheetName);
  if (existingSheet) {
    newSs.deleteSheet(existingSheet);
  }

  var copiedSheet = sheet.copyTo(newSs);
  copiedSheet.setName(sheet.getName());
}
function resetSheet(sheetName) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    // Si la hoja existe, elimínala
    if (sheet) {
        ss.deleteSheet(sheet);
    }

    var newSheet = ss.insertSheet(sheetName);
    return newSheet; 
}

function deleteSheet(sheetName) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    // Si la hoja existe, elimínala
    if (sheet) {
        ss.deleteSheet(sheet);
    }
}

function importMatchStats(playerName, sheet) {
    var url = `${CONFIG.API_URL}/match/stats/${playerName}`; // Reemplaza con tu API

    // Encabezados
    var titles = CONFIG.TITLES
    sheet.getRange("A1:U1").setValues([titles])
        .setFontWeight("bold");

    var response = UrlFetchApp.fetch(url);
    var jsonData = JSON.parse(response.getContentText());

    var data = [];
    var championStartRow = 2; 

    jsonData.forEach(champion => {
        var startRow = data.length + championStartRow;
        var rows = [];

        var totalRow = champion.children.find(enemy => enemy.enemy_champion_name === null);
        if (totalRow) {
            var championImage = `=IMAGE("${CONFIG.CHAMPION_IMAGE_URL}/${champion.champion_name}.png")`;
            data.push([
                championImage, // Imagen del campeón en "Champion"
                "TOTAL", // Texto "Total" en "Enemy Champion"
                totalRow.stats.GAMES,
                Math.round((totalRow.stats.WINS / totalRow.stats.GAMES) * 100 * 100) / 100, // Redondeo de WR
                totalRow.stats.MINUTE,
                Math.round(totalRow.stats.KDA * 100) / 100, // Redondeo de KDA
                Math.round(((totalRow.stats.CS + totalRow.stats.CSJ) / totalRow.stats.MINUTE) * 100) / 100, // Redondeo de CSM
                Math.round(totalRow.stats.SOLOKILL * 100) / 100, // Redondeo de SOLOKILL
                Math.round(totalRow.stats.PLATES * 100) / 100, // Redondeo de PLATES
                Math.round((totalRow.stats.VISION / totalRow.stats.MINUTE) * 100) / 100, // Redondeo de VISION
                Math.round(totalRow.stats.GD * 100) / 100, // Redondeo de GD
                Math.round(totalRow.stats.CSD * 100) / 100, // Redondeo de CS
                Math.round(totalRow.stats.CSJD * 100) / 100, // Redondeo de CSJ
                Math.round(totalRow.stats.XPD * 100) / 100, // Redondeo de XP
                Math.round((totalRow.stats.TOTAL_GOLD / totalRow.stats.MINUTE) * 100) / 100, // Redondeo de GPM
                Math.round(totalRow.stats.GOLD_SHARE * 10000) / 100, // Redondeo de GOLD(%) 
                Math.round((totalRow.stats.DMG_DONE / totalRow.stats.MINUTE) * 100) / 100, // Redondeo de DPM
                Math.round(totalRow.stats.DMG_SHARE * 10000) / 100, // Redondeo de DMG(%)
                Math.round(totalRow.stats.XP_SHARE * 10000) / 100, // Redondeo de XP(%)
                Math.round((totalRow.stats.DMG_TAKEN / totalRow.stats.MINUTE) * 100) / 100, // Redondeo de DMG TAKEN
                Math.round(totalRow.stats.DMG_TAKEN_SHARE * 10000) / 100 // Redondeo de DMG TAKEN(%)
            ]);
        }

        champion.children.forEach(enemy => {
            if (enemy.enemy_champion_name !== null) {
                var enemyImage = `=IMAGE("${CONFIG.CHAMPION_IMAGE_URL}/${enemy.enemy_champion_name}.png")`;
                rows.push([
                    "", // "Champion" vacío en los subgrupos
                    enemyImage, // Imagen del enemigo en "Enemy Champion"
                    enemy.stats.GAMES,
                    Math.round((enemy.stats.WINS / enemy.stats.GAMES) * 100 * 100) / 100, // Redondeo de WR
                    enemy.stats.MINUTE,
                    Math.round(enemy.stats.KDA * 100) / 100, // Redondeo de KDA
                    Math.round(((enemy.stats.CS + totalRow.stats.CSJ) / enemy.stats.MINUTE) * 100) / 100,
                    Math.round(enemy.stats.SOLOKILL * 100) / 100, // Redondeo de SOLOKILL
                    Math.round(enemy.stats.PLATES * 100) / 100, // Redondeo de PLATES
                    Math.round((enemy.stats.VISION / enemy.stats.MINUTE)* 100) / 100, // Redondeo de VISION
                    Math.round(enemy.stats.GD * 100) / 100, // Redondeo de GD
                    Math.round(enemy.stats.CSD * 100) / 100, // Redondeo de CS
                    Math.round(enemy.stats.CSJD * 100) / 100, // Redondeo de CSJ
                    Math.round(enemy.stats.XPD * 100) / 100, // Redondeo de XP
                    Math.round((enemy.stats.TOTAL_GOLD / enemy.stats.MINUTE) * 100) / 100, // Redondeo de GPM
                    Math.round(enemy.stats.GOLD_SHARE * 10000) / 100, // Redondeo de GOLD(%)
                    Math.round((enemy.stats.DMG_DONE / enemy.stats.MINUTE) * 100) / 100, // Redondeo de DPM
                    Math.round(enemy.stats.DMG_SHARE * 10000) / 100, // Redondeo de DMG(%)
                    Math.round(enemy.stats.XP_SHARE * 10000) / 100, // Redondeo de XP(%)
                    Math.round((enemy.stats.DMG_TAKEN / enemy.stats.MINUTE) * 100) / 100, // Redondeo de DMG TAKEN
                    Math.round(enemy.stats.DMG_TAKEN_SHARE * 10000) / 100 // Redondeo de DMG TAKEN(%)
                ]);
            }
        });

        data.push(...rows);

        var endRow = data.length + championStartRow - 1;
        if (endRow > startRow) {
            sheet.getRange(startRow + 1, 1, endRow - startRow, 5).shiftRowGroupDepth(1);
        }
    });

    if (data.length > 0) {
        sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
    }
  styleSheet()
}



function styleSheet() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    sheet.clearFormats();

    
    sheet.getRange("A1:U1")
        .setFontFamily("Arial") 
        .setFontSize(14) 
        .setFontWeight("bold") 
        .setBackground("#0073e6") 
        .setFontColor("#ffffff") 
        .setHorizontalAlignment("center") 
        .setVerticalAlignment("middle") 
        .setBorder(true, true, true, true, true, true) 
        .setWrap(true); 

    sheet.getRange("A2:U")
        .setFontFamily("Arial")
        .setFontSize(11)
        .setFontWeight("normal")
        .setBackground("#ffffff")
        .setHorizontalAlignment("center")
        .setVerticalAlignment("middle");

    sheet.getRange("A1:U").setBorder(true, true, true, true, true, true);

    sheet.getRange("A2:U").setBackground("#fafafa");
    sheet.getRange("A3:U").setBackground("#ffffff");
    sheet.getRange("A4:U").setBackground("#fafafa");

    sheet.getRange("A1:U").setBorder(true, false, true, false, false, false);

    sheet.setRowHeights(1, 1, 50); 
    sheet.setRowHeights(2, sheet.getMaxRows() - 1, 50); 

    sheet.setColumnWidths(1, 1, 80);  
    sheet.setColumnWidths(2, 1, 80);  

    sheet.setColumnWidths(3, 18, 120); 

    var totalRows = sheet.getRange(2, 2, sheet.getMaxRows() - 1, 1).getValues();
    for (var i = 0; i < totalRows.length; i++) {
        if (totalRows[i][0] == "TOTAL") {

            sheet.getRange(i + 2, 1, 1, 21)
                .setFontWeight("bold")
                .setBackground("#d1e7fd") 
                .setFontColor("#004085") 
                .setBorder(true, true, true, true, true, true); 
        } else if (totalRows[i][0] == "Subtotal") {

            sheet.getRange(i + 2, 1, 1, 21)
                .setFontWeight("normal")
                .setBackground("#f7f7f7") 
                .setFontColor("#333") 
                .setBorder(true, true, true, true, true, true); 
        } else {
            
            sheet.getRange(i + 2, 1, 1, 21)
                .setFontWeight("normal")
                .setBackground("#ffffff") 
                .setFontColor("#000"); 
        }
    }

    sheet.getRange("A1:U" + sheet.getMaxRows()).setBorder(false, false, false, false, false, false);


    var images = sheet.getRange("A2:A" + sheet.getMaxRows());
    images.setHorizontalAlignment("center");


    sheet.getRange("A2:U").setBackground("#f9f9f9");
}

function removeAllRowGroups(sheet) {
    var lastRow = sheet.getLastRow();
    for (var i = 2; i <= lastRow; i++) {
        if (sheet.getRowGroupDepth(i) > 0) {
            sheet.getRange(i, 1).shiftRowGroupDepth(-1);
        }
    }
}
