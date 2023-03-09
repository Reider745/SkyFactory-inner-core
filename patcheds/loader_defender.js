const NAME = "Loader Defender 1.0";

/*
Уровни защиты 
0 - отсутствует защита 
1 - предупреждение об удаление/выключения мода
2 - предупреждение об удаление/выключения/изменения версии мода
3 - блокировка сборки, если мод отключён или удалён
4 - блокировка сборки, если мод отключён или удалён или версия мода изменена 
*/


let ModsDefender = self.getFile("mods_defender.json");
const DefaultMessage = [
	"",
	"\n<text>:Отсутсвие данного мода может привести к не предсказуемым последствиям",
	"\n<text>:Данный мод важен для геймплея",
	"\n<text>:Данный мод является важным техническим модом",
	"\n<text>:С данным модом связаны квесты",
	"\n<text>:Изменение версии мода не желательна"
];

let canBlock = true;

void function(){
	let setting = FileTools.ReadJSON(__dir__+"setting.json");
	if(setting.description["defender"]) return;
	setting.description["defender"] = {
		"type": "boolean",
		"text": "Loader Defender(вкл/выкл)"
	};
	setting.setting["defender"] = "true";
	FileTools.WriteJSON(__dir__+"setting.json", setting, true);
	CONFIG.read();
	canBlock = false;
}();

void function(){
	const Defender =  {
		levels: {},
		addDefenderLevel(level, func){
			this.levels[level] = func;
		},
		getJson(path){
			if(!FileTools.isExists(path)) return null;
			return FileTools.ReadJSON(path)
		},
		check(list, cb, message){
			let dir = __modpack__.getRootDirectoryPath();
			let block = false;
			let text = "";
			
			for(let i in list){
				let object = list[i];
				object.level_defender = object.level_defender || 0;
				object.description = object.description || DefaultMessage[object.message || 0];
				
				let result = this.levels[object.level_defender](
					object,
					FileTools.isExists(dir+"/mods/"+object.name),
					this.getJson(dir+"/config/"+object.name.replace(/ /g, "-")+"-config.json"),
					dir
				);
				if(!result) continue;
				if(result.block) block = true;
				text += result.text+"\n";
			}
			if(text != "" && message){
				let ui = self.parseDialog(null, block ? "<text>:Доступ к сборке заблокирован\n"+text : text, NAME);
				if(block && cb){
					ui.setCanExit(false);
					while(true){}
				}
			}
			return {block: block, text: text};
		}
	};
	
	Defender.addDefenderLevel(0, function(){});
	
	Defender.addDefenderLevel(1, function(obj, isMod, config, dir){
		if(!isMod)
			return {
				block: false,
				text: "<text>:Модификация "+obj.name+" не найдена."+obj.description
			};
		if(!config || !config.enabled)
			return {
				block: false,
				text: "<text>:Модификация "+obj.name+" отключена."+obj.description
			};
	});
	
	Defender.addDefenderLevel(2, function(obj, isMod, config, dir){
		if(!isMod)
			return {
				block: false,
				text: "<text>:Модификация "+obj.name+" не найдена."+obj.description
			};
		if(!config || !config.enabled)
			return {
				block: false,
				text: "<text>:Модификация "+obj.name+" отключена."+obj.description
			};
		let info = Defender.getJson(dir+"/mods/"+obj.name+"/mod.info");
		if(!info || obj.versions.indexOf(info.version))
			return {
				block: false,
				text: "<text>:Версия модификации "+obj.name+" изменена."+obj.description
			};
	});
	
	Defender.addDefenderLevel(3, function(obj, isMod, config, dir){
		if(!isMod)
			return {
				block: true,
				text: "<text>:Модификация "+obj.name+" не найдена."+obj.description
			};
		if(!config || !config.enabled)
			return {
				block: true,
				text: "<text>:Модификация "+obj.name+" отключена."+obj.description
			};
	});
	
	Defender.addDefenderLevel(4, function(obj, isMod, config, dir){
		if(!isMod)
			return {
				block: true,
				text: "<text>:Модификация "+obj.name+" не найдена."+obj.description
			};
		if(!config || !config.enabled)
			return {
				block: true,
				text: "<text>:Модификация "+obj.name+" отключена."+obj.description
			};
		let info = Defender.getJson(dir+"/mods/"+obj.name+"/mod.info");
		if(!info || obj.versions.indexOf(info.version))
			return {
				block: true,
				text: "<text>:Версия модификации "+obj.name+" изменена."+obj.description
			};
	});
	if(CONFIG.getSetting()["defender"] == "true"){
		let result = Defender.check(ModsDefender, canBlock, true);
		if(result.block && !canBlock){
			let ui = self.parseDialog(null, "<text>:В сборку был установлен компонент Loader Defender.\n<text>:В каком-то смысле данный компонент предназначен\n<text>:для более стабильной работы сборки. Как это работает?\n<text>:Этот компонент предупреждает если был отключён или\n<text>:как-то изменён мод который не стоило изменять при\n<text>:изменение важных модификаций доступ к сборке компонент\n<text>:будет блокировать. Компонент можно отключить в \n<text>:настройках.\n<title>:Внимание!\n<text>:Доступ к сборке не был заблокирован т.к это первый вход.", NAME);
			ui.addElement(new Setting.SettingButtonTextElement("Настройки", "NativeButton").setClick(function(){
				CONFIG.open();
			}));
		}else if(!canBlock){
			let ui = self.parseDialog(null, "<text>:В сборку был установлен компонент Loader Defender.\n<text>:В каком-то смысле данный компонент предназначен\n<text>:для более стабильной работы сборки. Как это работает?\n<text>:Этот компонент предупреждает если был отключён или\n<text>:как-то изменён мод который не стоило изменять при\n<text>:изменение важных модификаций доступ к сборке компонент\n<text>:будет\nблокировать. Компонент можно отключить в \n<text>:настройках.", NAME);
			ui.addElement(new Setting.SettingButtonTextElement("Настройки", "NativeButton").setClick(function(){
				CONFIG.open();
			}));
		}
	}
}();
