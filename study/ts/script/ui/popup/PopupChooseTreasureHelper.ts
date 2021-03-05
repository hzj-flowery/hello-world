import { UserDataHelper } from "../../utils/data/UserDataHelper";
import { G_UserData } from "../../init";
import { EquipDataHelper } from "../../utils/data/EquipDataHelper";
import { TeamDataHelper } from "../../utils/data/TeamDataHelper";
import { Lang } from "../../lang/Lang";
import { TreasureDataHelper } from "../../utils/data/TreasureDataHelper";

export namespace PopupChooseTreasureHelper {

	export let FROM_TYPE1 = 1 //穿戴 “+”点进来
	export let FROM_TYPE2 = 2 //更换 Icon点进来
	export let FROM_TYPE3 = 3 //重生宝物 点进来
	export let FROM_TYPE4 = 4 //从“宝物置换”点进来

	var BTN_DES = {
		1: "treasure_btn_wear",
		2: "treasure_btn_replace",
		3: "reborn_list_btn",
		4: "reborn_list_btn",
	}

	export let addTreasureDataDesc = function (treasureData, fromType, showRP?, curTreasureUnitData?, pos?) {
		if (treasureData == null) {
			return null;
		}
		var heroBaseId = UserDataHelper.getHeroBaseIdWithTreasureId(treasureData.getId());
		var rData = G_UserData.getBattleResource().getTreasureDataWithId(treasureData.getId());
		var cellData: any = {};
		for (const key in treasureData) {
			cellData[key] = treasureData[key];
		}
		cellData.heroBaseId = heroBaseId;
		cellData.btnDesc = Lang.get(BTN_DES[fromType]);
		cellData.btnIsHightLight = false;
		cellData.isYoke = false;
		if (rData) {
			cellData.btnDesc = Lang.get('treasure_btn_grab');
			cellData.btnIsHightLight = true;
		}
		if (fromType == PopupChooseTreasureHelper.FROM_TYPE2 && showRP == true && !rData) {
			cellData.showRP = PopupChooseTreasureHelper._checkIsShowRP(treasureData, curTreasureUnitData);
		}
		if (fromType == PopupChooseTreasureHelper.FROM_TYPE1 || fromType == PopupChooseTreasureHelper.FROM_TYPE2 && pos) {
			var baseId = UserDataHelper.getHeroBaseIdWithPos(pos);
			cellData.isYoke = UserDataHelper.isHaveYokeBetweenHeroAndTreasured(baseId, treasureData.getBase_id());
		}
		return cellData;
	}

	export let _checkIsShowRP = function (treasureData, curData) {
		var curColor = curData.getConfig().color;
		var curPotential = curData.getConfig().potential;
		var curLevel = curData.getLevel();
		var curRLevel = curData.getRefine_level();
		var color = treasureData.getConfig().color;
		var potential = treasureData.getConfig().potential;
		var level = treasureData.getLevel();
		var rLevel = treasureData.getRefine_level();
		if (color != curColor) {
			return color > curColor;
		} else if (potential != curPotential) {
			return potential > curPotential;
		} else if (level != curLevel) {
			return level > curLevel;
		} else if (rLevel != curRLevel) {
			return rLevel > curRLevel;
		}
		return false;
	}

	export let _FROM_TYPE1 = function (data) {
		return data
	}

	export let _FROM_TYPE2 = function (data) {
		return data
	}

	export let _FROM_TYPE3 = function (data) {
		return G_UserData.getTreasure().getRebornList()
	}

	export let _FROM_TYPE4 = function (param) {
		var filterIds = param[0];
		var tempData = param[1];
		return TreasureDataHelper.getTreasureTransformTarList(filterIds, tempData)
	}
}