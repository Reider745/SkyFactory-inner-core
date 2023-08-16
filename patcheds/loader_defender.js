const NAME = "Loader Defender 1.1";

/*
Уровни защиты 
0 - отсутствует защита 
1 - предупреждение об удаление/выключения мода
2 - предупреждение об удаление/выключения/изменения версии мода
3 - блокировка сборки, если мод отключён или удалён
4 - блокировка сборки, если мод отключён или удалён или версия мода изменена 
5 - если мод установлен, посылать юзера нахуй и недовать ему войти в игру
*/

/*let ModsDefender = [
	{name: "Test", level_defender: 1, description: "\n<text>:Тестовое сообщение"},
	{name: "ClassicUI", level_defender: 2, description: "", versions: ["test 1"]},
	{name: "CoreUtility", level_defender: 4, description: "", versions: ["test 1"]}
];*/ 
if(!this["self"]){
	var CONFIG = Config;
	var self = ModPack;
	for(let key in FileSystem)
		self[key] = FileSystem[key];
	
	function Event(){
		PathEvent.apply(this);
		
		this.getInformation = function(){
			return {name: NAME};
		}
	}
	PathManager.addEvent(new Event());
}

let ModsDefender = JSON.parse(self.getFile("mods_defender.json"));
const DefaultMessage = [
	"",
	"<translation,ru,The absence of this mod can lead to unpredictable consequences>:Отсутсвие данного мода может привести к не предсказуемым последствиям\n<text>:The absence of this mod can lead to unpredictable consequences",
	"<translation,ru,This mod is important for gameplay>:Данный мод важен для геймплея\n<text>:This mod is important for gameplay",
	"<translation,ru,This mod is an important technical mod>:Данный мод является важным техническим модом\n<text>:This mod is an important technical mod",
	"<translation,ru,Quests are associated with this mod>:С данным модом связаны квесты\n<text>:Quests are associated with this mod",
	"<translation,ru,Changing the mod version is not desirable>:Изменение версии мода не желательна\n<text>:Changing the mod version is not desirable",
	"<translation,ru,Setting this mode is prohibited>:Установка данного мода запрещена\n<text>:Setting this mode is prohibited"
	
];

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
}();

void function(){
	const Defender = {
		levels: {},
		addDefenderLevel(level, func){
			this.levels[level] = func;
		},
		getJson(path){
			if(!FileTools.isExists(path)) return null;
			return FileTools.ReadJSON(path)
		},
		check(list){
			let dir = __modpack__.getRootDirectoryPath();
			let block = false;
			let text = "";
			
			for(let i in list){
				let object = list[i];
				object.level_defender = object.level_defender || 0;
				object.description = object.description || DefaultMessage[object.message || 0];
				
				let name = object.name;
				let result = this.levels[object.level_defender](
					object,
					FileTools.isExists(dir+"/mods/"+object.name),
					this.getJson(dir+"/config/"+name.replace(/ /g, "-")+"-config.json"),
					dir
				);
				if(!result) continue;
				if(result.block) block = true;
				text += result.text+"\n";
			}
			if(text != ""){
				let ui = self.parseDialog(null, block ? "<translation,ru,Access to the assembly is blocked>:Доступ к сборке заблокирован\n<text>:Access to the assembly is blocked\n"+text : text, NAME);
				if(block){
					ui.setCanExit(false);
					while(true){}
				}
			}
		}
	};
	
	Defender.addDefenderLevel(0, function(){});
	
	Defender.addDefenderLevel(1, function(obj, isMod, config, dir){
		if(!isMod)
			return {
				block: false,
				text: "<translation,ru,Modification {name} not found.>:Модификация {name} не найдена.\n<text>:Modification {name} not found.\n{description}".replace(/{name}/g, obj.name).replace("{description}", obj.description)
			};
		if(!config || !config.enabled)
			return {
				block: false,
				text: "<translation,ru,Modification of {name} is disabled.>:Модификация {name} отключена.\n<text>:Modification of {name} is disabled.\n{description}".replace(/{name}/g, obj.name).replace("{description}", obj.description)
			};
	});
	
	Defender.addDefenderLevel(2, function(obj, isMod, config, dir){
		if(!isMod)
			return {
				block: false,
				text: "<translation,ru,Modification {name} not found.>:Модификация {name} не найдена.\n<text>:Modification {name} not found.\n{description}".replace(/{name}/g, obj.name).replace("{description}", obj.description)
			};
		if(!config || !config.enabled)
			return {
				block: false,
				text: "<translation,ru,Modification of {name} is disabled.>:Модификация {name} отключена.\n<text>:Modification of {name} is disabled.\n{description}".replace(/{name}/g, obj.name).replace("{description}", obj.description)
			};
		let info = Defender.getJson(dir+"/mods/"+obj.name+"/mod.info");
		if(!info || obj.versions.indexOf(info.version) == -1)
			return {
				block: false,
				text: "<translation,ru,The version of the modification {name} has been changed.>:Версия модификации {name} изменена.\n<text>:The version of the modification {name} has been changed.\n{description}".replace(/{name}/g, obj.name).replace("{description}", obj.description)
			};
	});
	
	Defender.addDefenderLevel(3, function(obj, isMod, config, dir){
		if(!isMod)
			return {
				block: true,
				text: "<translation,ru,Modification {name} not found.>:Модификация {name} не найдена.\n<text>:Modification {name} not found.\n{description}".replace(/{name}/g, obj.name).replace("{description}", obj.description)
			};
		if(!config || !config.enabled)
			return {
				block: true,
				text: "<translation,ru,Modification of {name} is disabled.>:Модификация {name} отключена.\n<text>:Modification of {name} is disabled.\n{description}".replace(/{name}/g, obj.name).replace("{description}", obj.description)
			};
	});
	
	Defender.addDefenderLevel(4, function(obj, isMod, config, dir){
		if(!isMod)
			return {
				block: true,
				text: "<translation,ru,Modification {name} not found.>:Модификация {name} не найдена.\n<text>:Modification {name} not found.\n{description}".replace(/{name}/g, obj.name).replace("{description}", obj.description)
			};
		if(!config || !config.enabled)
			return {
				block: true,
				text: "<translation,ru,Modification of {name} is disabled.>:Модификация {name} отключена.\n<text>:Modification of {name} is disabled.\n{description}".replace(/{name}/g, obj.name).replace("{description}", obj.description)
			};
		let info = Defender.getJson(dir+"/mods/"+obj.name+"/mod.info");
		if(!info || obj.versions.indexOf(info.version) == -1)
			return {
				block: true,
				text: "<translation,ru,The version of the modification {name} has been changed.>:Версия модификации {name} изменена.\n<text>:The version of the modification {name} has been changed.\n{description}".replace(/{name}/g, obj.name).replace("{description}", obj.description)
			};
	});

	Defender.addDefenderLevel(5, function(obj, isMod, config, dir){
		if(isMod)
			return {
				block: true,
				text: "<translation,ru,Installing the {name} mod is prohibited!>Установка мода {name} запрещена!\n<text>:Installing the {name} mod is prohibited!\n{description}".replace(/{name}/g, obj.name).replace("{description}", obj.description)
			};
	});

	if(CONFIG.getSetting()["defender"] == "true")
		Defender.check(ModsDefender);
}();
