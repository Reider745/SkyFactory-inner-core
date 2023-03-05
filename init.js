/*try{
    const MAIN_FILE = JSON.parse(self.getFile("main.json"));
    
    MAIN_FILE.information = MAIN_FILE.information || {};

    if(MAIN_FILE.information.version_icmods !== undefined && Number(FileTools.ReadJSON(__modpack__.getRootDirectoryPath()+"/preferences.json").icmods_version) != 26)
        self.parseDialog(MAIN_FILE.information.dialog_type, self.getFile(MAIN_FILE.information.change_logs[MAIN_FILE.information.version_icmods]));
}catch(e){alert("Пожалуйста сообщите разработчику Sky Factory об ошибке: "+e+"\nP.S Ошибка не критична")}*/
self.parseDialog(null, "Артём где Двери?", "Сообщение для Артёма");