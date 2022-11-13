try{
    const MAIN_FILE = JSON.parse(self.getFile("main.json"));
    const ICMOD_PACK = JSON.parse(sendHttp("https://icmods.mineprogramming.org/api/description?id=816"));
    const VERSION_PACK = (function(){
        if(ICMOD_PACK.last_update == "2021-12-05 08:39:52")
            return "pre-release 1.1";
        return "pre-release 1.0";
    })();
    
    MAIN_FILE.information = MAIN_FILE.information || {};

    if(MAIN_FILE.information.version_icmods !== undefined && VERSION_PACK == version)
        self.parseDialog(MAIN_FILE.information.dialog_type, self.getFile(MAIN_FILE.information.version_icmods));
}catch(e){alert("Пожалуйста сообщите разработчику Sky Factory об ошибке: "+e+"\nP.S Ошибка не критична")}