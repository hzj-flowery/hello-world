import { G_UserData, Colors, G_Prompt, G_ConfigLoader, G_ServerTime, G_SceneManager } from "../../../init";
import { TextHelper } from "../../../utils/TextHelper";
import { Lang } from "../../../lang/Lang";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { Path } from "../../../utils/Path";
import ParameterIDConst from "../../../const/ParameterIDConst";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { HomelandConst } from "../../../const/HomelandConst";
import { AttrDataHelper } from "../../../utils/data/AttrDataHelper";
import { UserCheck } from "../../../utils/logic/UserCheck";
import UIHelper from "../../../utils/UIHelper";
import PopupItemGuider from "../../../ui/PopupItemGuider";
import { assert } from "../../../utils/GlobleFunc";
import { stringUtil } from "../../../utils/StringUtil";

export namespace HomelandHelp {
    export function getTreeInfoConfig(level) {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.TREE_INFO).get(level);
        // assert(info, stringUtil.format('tree_info config can not find id = %d', level));
        return info;
    };
    export function getTreeBuffConfig(id) {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.TREE_BUFF).get(id);
        //   assert(info, stringUtil.format('tree_buff config can not find id = %d', id));
        return info;
    }

    export function getSubTreeCfg(treeData) {
        let subTreeType = treeData.treeId, currLevel = treeData.treeLevel;
        let currData = G_UserData.getHomeland().getSubTreeCfg(subTreeType, currLevel);
        if (G_UserData.getHomeland().isSubTreeLevelMax(subTreeType, currLevel)) {
            return [currData];
        }
        let nextData = G_UserData.getHomeland().getSubTreeCfg(subTreeType, currLevel + 1);
        return [
            currData,
            nextData
        ];
    };
    export function getMainTreeCfg(treeData) {
        let currLevel = treeData.treeLevel;
        let currData = G_UserData.getHomeland().getMainTreeCfg(currLevel);
        if (G_UserData.getHomeland().isMainTreeLevelMax(currLevel)) {
            return [currData];
        }
        let nextData = G_UserData.getHomeland().getMainTreeCfg(currLevel + 1);
        return [
            currData,
            nextData
        ];
    };
    export function getSelfSubTreeCfg(subTreeType) {
        let currLevel = G_UserData.getHomeland().getSubTreeLevel(subTreeType);
        let currData = G_UserData.getHomeland().getSubTreeCfg(subTreeType, currLevel);
        if (G_UserData.getHomeland().isSubTreeLevelMax(subTreeType)) {
            return [currData];
        }
        let nextData = G_UserData.getHomeland().getSubTreeCfg(subTreeType, currLevel + 1);
        return [
            currData,
            nextData
        ];
    };
    export function getSelfMainTreeCfg() {
        let currLevel = G_UserData.getHomeland().getMainTreeLevel();
        let currData = G_UserData.getHomeland().getMainTreeCfg(currLevel);
        if (G_UserData.getHomeland().isMainTreeLevelMax()) {
            return [currData];
        }
        let nextData = G_UserData.getHomeland().getMainTreeCfg(currLevel + 1);
        return [
            currData,
            nextData
        ];
    };
    export function getPromptContent(attrId, value) {
        let absValue = Math.abs(value);
        let [attrName, attrValue] = TextHelper.getAttrBasicText(attrId, absValue);
        let color = value >= 0 && Colors.colorToNumber(Colors.getColor(2)) || Colors.colorToNumber(Colors.getColor(6));
        let outlineColor = value >= 0 && Colors.colorToNumber(Colors.getColorOutline(2)) || Colors.colorToNumber(Colors.getColorOutline(6));
        attrValue = value >= 0 && ' + ' + attrValue || ' - ' + attrValue;
        let attrContent = Lang.get('homeland_all_text') + (attrName + attrValue);
        console.log(attrContent);
        let content = Lang.get('summary_attr_change', {
            attr: attrContent,
            color: color,
            outlineColor: outlineColor
        });
        return content;
    };
    export function getPromptPower(allPower) {
        let value = Math.abs(allPower);
        let attrValue = allPower;
        let color = value >= 0 && Colors.colorToNumber(Colors.getColor(2)) || Colors.colorToNumber(Colors.getColor(6));
        let outlineColor = value >= 0 && Colors.colorToNumber(Colors.getColorOutline(2)) || Colors.colorToNumber(Colors.getColorOutline(6));
        attrValue = value >= 0 && ' + ' + attrValue || ' - ' + attrValue;
        let attrContent = Lang.get('homeland_power') + attrValue;
        let content = Lang.get('summary_attr_change', {
            attr: attrContent,
            color: color,
            outlineColor: outlineColor
        });
        return content;
    };
    export function getSubTreeAttrList(subTreeType) {
        let [currData] = getSelfSubTreeCfg(subTreeType);
        let power = currData['all_combat'];
        let attrList = [];
        for (let i = 1; i <= 4; i++) {
            let attrType = currData['attribute_type' + i];
            let attrValue = currData['attribute_value' + i];
            if (attrType > 0) {
                attrList.push({
                    type: attrType,
                    value: attrValue
                });
            }
        }
        return [
            attrList,
            power
        ];
    };
    export function checkMainTreeLevel(nextCfg, showPrompt) {
        let limitList = [];
        function subTreeType(name) {
            if (showPrompt) {
                G_Prompt.showTip(Lang.get('homeland_sub_tree_limit', { name: name }));
            }
            return false;
        }
        for (let i = 1; i <= 2; i++) {
            let subType = nextCfg['adorn_type_' + i];
            let subLevel = nextCfg['adorn_level_' + i];
            if (subType && subType > 0 && subLevel && subLevel > 0) {
                let subCfg = G_UserData.getHomeland().getSubTreeCfg(subType, subLevel);
                limitList.push({
                    type: subType,
                    level: subLevel,
                    name: subCfg.name
                });
            }
        }
        let mainTreeLevel = G_UserData.getHomeland().getMainTreeLevel();
        for (let i in limitList) {
            let value = limitList[i];
            let subLevel = G_UserData.getHomeland().getSubTreeLevel(value.type);
            if (subLevel < value.level) {
                return subTreeType(value.name);
            }
        }
        return true;
    };
    export function checkSubTreeLevel(nextCfg, showPrompt) {
        function subTreeType(name) {
            if (showPrompt) {
                G_Prompt.showTip(Lang.get('homeland_sub_tree_limit', { name: name }));
            }
            return false;
        }
        let limitList = [];
        if (nextCfg.limit_tree_level > 0) {
            limitList.push({
                type: 0,
                level: nextCfg.limit_tree_level,
                name: Lang.get('homeland_main_tree')
            });
        }
        for (let i = 1; i <= 2; i++) {
            let subType = nextCfg['adorn_type_' + i];
            let subLevel = nextCfg['adorn_level_' + i];
            if (subType && subType > 0 && subLevel && subLevel > 0) {
                let subCfg = G_UserData.getHomeland().getSubTreeCfg(subType, subLevel);
                console.log(subCfg.name);
                limitList.push({
                    type: subType,
                    level: subLevel,
                    name: subCfg.name
                });
            }
        }
        for (let i in limitList) {
            let value = limitList[i];
            if (value.type == 0) {
                let mainTreeLevel = G_UserData.getHomeland().getMainTreeLevel();
                if (mainTreeLevel < value.level) {
                    return subTreeType(value.name);
                }
            } else {
                let subLevel = G_UserData.getHomeland().getSubTreeLevel(value.type);
                if (subLevel < value.level) {
                    return subTreeType(value.name);
                }
            }
        }
        return true;
    };
    export function checkMainTreeUp(treeData, showPrompt) {
        if (showPrompt == null) {
            showPrompt = true;
        }
        let currLevel = treeData.treeLevel;
        if (G_UserData.getHomeland().isMainTreeLevelMax(currLevel)) {
            return false;
        }
        let cfg = treeData.treeCfg;
        let nextCfg = G_UserData.getHomeland().getMainTreeCfg(currLevel + 1);
        let currCfg = G_UserData.getHomeland().getMainTreeCfg(currLevel);
        if (checkMainTreeLevel(nextCfg, showPrompt) == false) {
            return false;
        }
        let enoughCheck = LogicCheckHelper.enoughValue(currCfg.type, currCfg.value, currCfg.size, showPrompt);
        if (enoughCheck == false) {
            return false;
        }
        return true;
    };
    export function checkSubTreeUpLevelEnough(subCfg) {
        let mainTreeLevel = G_UserData.getHomeland().getMainTreeLevel();
        //TODO:
        // if (mainTreeLevel < nextCfg.limit_tree_level) {
        //     return true;
        // }
        return false;
    };
    export function checkSubTreeUp(treeData, showPrompt?) {
        if (showPrompt == null) {
            showPrompt = true;
        }
        let currLevel = treeData.treeLevel;
        let nextCfg = G_UserData.getHomeland().getSubTreeCfg(treeData.treeId, currLevel + 1);
        if (nextCfg == null) {
            return false;
        }
        if (checkSubTreeLevel(nextCfg, showPrompt) == false) {
            return false;
        }
        let currCfg = G_UserData.getHomeland().getSubTreeCfg(treeData.treeId, currLevel);
        let mainTreeLevel = G_UserData.getHomeland().getMainTreeLevel();
        if (mainTreeLevel < nextCfg.limit_tree_level) {
            if (showPrompt) {
                G_Prompt.showTip(Lang.get('homeland_main_tree_limit'));
            }
            return false;
        }
        function prompt(type, value) {
            if (showPrompt) {
                G_SceneManager.openPopup('prefab/common/PopupItemGuider', (popup: PopupItemGuider) => {
                    popup.updateUI(type, value);
                    popup.setTitle(Lang.get('way_type_get'));
                    popup.openWithAction();
                })
            }
        }
        function checkEnoughValue() {
            for (let i = 1; i <= 2; i++) {
                if (currCfg['type_' + i] > 0) {
                    let type = currCfg['type_' + i];
                    let value = currCfg['value_' + i];
                    let size = currCfg['size_' + i];
                    let enoughCheck = LogicCheckHelper.enoughValue(type, value, size, showPrompt);
                    if (enoughCheck == false) {
                        prompt(type, value);
                        return false;
                    }
                }
            }
            return true;
        }
        if (checkEnoughValue() == false) {
            return false;
        }
        return true;
    };
    export function createSpine(cfgData) {
        //TODO:
        // let spineNode = new (require('SpineNode'))();
        // spineNode.setAsset(Path.getEffectSpine(data.name));
        // spineNode.setAnimation(data.animation, true);
        // spineNode.setScaleX(data.orientation);
        // return spineNode;
    };
    export function getSubTreeFontHeight(treeData) {
        if (treeData.treeId == 1) {
            return cc.size(28, 95);
        } else if (treeData.treeId == 2 || treeData.treeId == 3 || treeData.treeId == 4) {
            return cc.size(28, 118);
        } else if (treeData.treeId == 5 || treeData.treeId == 6) {
            return cc.size(28, 146);
        }
        return cc.size(28, 146);
    };
    export function updateNodeTreeTitle(rootNode, treeData) {
        let Node_treeTitle = rootNode.getChildByName('Node_treeTitle');
        let Image_bk = Node_treeTitle.getChildByName('Image_bk');
        var Image_title = Node_treeTitle.getChildByName('Image_title').getComponent(cc.Sprite);
        var Image_level = Image_bk.getChildByName('Image_level');
        if (treeData.treeId == 0) {
            let path = Path.getTextHomeland('txt_homeland_tree0' + treeData.treeLevel);
            if (treeData.treeLevel >= 10) {
                path = Path.getTextHomeland('txt_homeland_tree' + treeData.treeLevel);
            }
            console.log(path);
            UIHelper.loadTexture(Image_title, path)
            if (treeData.treeLevel > 10) {
                Image_bk.setContentSize(cc.size(34, 174));
            } else {
                Image_bk.setContentSize(cc.size(34, 146));
            }
        } else {
            if (treeData.treeLevel == 0) {
                Node_treeTitle.active = (false);
                return;
            }
            Node_treeTitle.active = (true);
            UIHelper.loadTexture(Image_title, Path.getTextHomeland('txt_homeland_decorate' + treeData.treeId))
            Image_bk.setContentSize(getSubTreeFontHeight(treeData));
            var Text_level = Image_bk.getChildByName('Image_level').getChildByName('Text_level').getComponent(cc.Label);

            Text_level.string = Lang.get('homeland_sub_tree_level' + treeData.treeLevel);
            if (treeData.treeLevel > 10) {
                Image_level.setContentSize(cc.v2(26, 75));
            } else {
                Image_level.setContentSize(cc.v2(26, 55));
            }
        }
    };
    export function isTreeProduceMax() {
        let treeMgr = G_UserData.getHomeland().getTreeManager();
        let serverMoney = treeMgr.total;
        let serverMoneyTime = treeMgr.lastStartTime;
        let serverGetMoneyTime = treeMgr.lastHarvestTime;
        let timeLimit = Number(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.HOMELAND_TIME_LIMIT).content);
        let nowTime = G_ServerTime.getTime();
        let timeDiff = nowTime - serverMoneyTime;
        let getTimeDiff = nowTime - serverGetMoneyTime;
        if (getTimeDiff >= timeLimit) {
            return true;
        }
        return false;
    };
    export function getTreeProduce() {
        let output = this.getSelfMainTreeCfg()[0].output_efficiency / 100000;
        let treeMgr = G_UserData.getHomeland().getTreeManager();
        let serverMoney = treeMgr.total;
        let serverMoneyTime = treeMgr.lastStartTime;
        let serverGetMoneyTime = treeMgr.lastHarvestTime;
        let nowTime = G_ServerTime.getTime();
        let timeDiff = nowTime - serverMoneyTime;
        let getTimeDiff = nowTime - serverGetMoneyTime;
        let timeLimit = Number(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.HOMELAND_TIME_LIMIT).content);
        if (getTimeDiff > timeLimit) {
            getTimeDiff = timeLimit;
            let overTime = nowTime - serverGetMoneyTime - timeLimit;
            timeDiff = timeDiff - overTime;
            if (timeDiff < 0) {
                timeDiff = 0;
            }
        }
        let moneyCount = Math.floor(serverMoney + timeDiff * output);
        let nowMoneyDetail = serverMoney + timeDiff * output - moneyCount;
        let percent = nowMoneyDetail * 100;
        if (getTimeDiff == timeLimit) {
            percent = 100;
        }
        return [
            moneyCount,
            percent
        ];
    };
    export function getMainTreeExp(currLevel) {
        let config = G_UserData.getHomeland().getMainTreeCfg(currLevel);
        return config.experience;
    };
    export function getSubTreePower(subType, subLevel) {
        let allPower = 0;
        let subCfg = G_ConfigLoader.getConfig(ConfigNameConst.TREE_DECORATE_ADD);
        for (let level = 1; level <= subLevel; level++) {
            let data = subCfg.get(subType, level);
            if (data) {
                allPower = data.all_combat + allPower;
            }
        }
        return allPower;
    };
    export function getMainTreePower(mainLevel) {
        let allPower = 0;
        let subCfg = G_ConfigLoader.getConfig(ConfigNameConst.TREE_INFO);
        for (let level = 1; level <= mainLevel; level++) {
            let data = subCfg.get(level);
            if (data) {
                allPower = data.all_combat + allPower;
            }
        }
        return allPower;
    };
    export function getAllPower() {
        let allPower = 0;
        for (let i = 1; i <= HomelandConst.MAX_SUB_TREE; i++) {
            let subTree = G_UserData.getHomeland().getSubTree(i);
            allPower = allPower + getSubTreePower(i, subTree.treeLevel);
        }
        let mainTree = G_UserData.getHomeland().getMainTree();
        let retPower = allPower + getMainTreePower(mainTree.treeLevel);
        return retPower;
    };
    export function getFriendAllPower(friendId) {
        let subPower = 0;
        for (let i = 1; i <= HomelandConst.MAX_SUB_TREE; i++) {
            let subTree = G_UserData.getHomeland().getInviteFriendSubTree(friendId, i);
            if (subTree) {
                subPower = subPower + getSubTreePower(i, subTree.treeLevel);
            }
        }
        let mainTree = G_UserData.getHomeland().getInviteFriendMainTree(friendId);
        let mainPower = getMainTreePower(mainTree.treeLevel);
        let retPower = subPower + mainPower;
        return retPower;
    };
    export function getHomelandAttr() {
        let attrAllList = {};
        for (let i = 1; i <= HomelandConst.MAX_SUB_TREE; i++) {
            let currLevel = G_UserData.getHomeland().getSubTreeLevel(i);
            for (let level = 1; level <= currLevel; level++) {
                let currData = G_UserData.getHomeland().getSubTreeCfg(i, level);
                if (currData) {
                    let attrList = [];
                    for (let j = 1; j <= 4; j++) {
                        let attrType = currData['attribute_type' + j];
                        let attrValue = currData['attribute_value' + j];
                        if (attrType > 0) {
                            attrList.push({
                                type: attrType,
                                value: attrValue
                            });
                        }
                    }
                    for (let k in attrList) {
                        let attrValue = attrList[k];
                        AttrDataHelper.formatAttr(attrAllList, attrValue.type, attrValue.value);
                    }
                }
            }
        }
        let currLevel = G_UserData.getHomeland().getMainTreeLevel();
        for (let level = 1; level <= currLevel; level++) {
            let currData = G_UserData.getHomeland().getMainTreeCfg(level);
            if (currData) {
                let attrList = [];
                for (let i = 1; i <= 4; i++) {
                    let attrType = currData['attribute_type' + i];
                    let attrValue = currData['attribute_value' + i];
                    if (attrType > 0) {
                        attrList.push({
                            type: attrType,
                            value: attrValue
                        });
                    }
                }
                for (let k in attrList) {
                    let attrValue = attrList[k];
                    AttrDataHelper.formatAttr(attrAllList, attrValue.type, attrValue.value);
                }
            }
        }
        return attrAllList;
    };
    export function getMainLevelAttrList(level) {
        let tempCfg = G_UserData.getHomeland().getMainTreeCfg(level);
        let valueList = [];
        let attrConfig = G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE);
        valueList[0] = {
            name: Lang.get('official_all_all_combat'),
            value: tempCfg.all_combat
        };
        for (let i = 1; i <= 4; i += 1) {
            if (tempCfg['attribute_type' + i] > 0) {
                let nameStr = attrConfig.get(tempCfg['attribute_type' + i]).cn_name;
                nameStr = Lang.get('official_all') + nameStr;
                valueList.push({
                    name: nameStr,
                    value: tempCfg['attribute_value' + i]
                });
            }
        }
        valueList.push({
            name: attrConfig.get(tempCfg['output_type']).cn_name,
            value: tempCfg.output_efficiency
        });
        return valueList;
    };
    export function getSubLevelAttrList(type, level) {
        let tempCfg = G_UserData.getHomeland().getSubTreeCfg(type, level);
        let valueList = {};
        let attrConfig = G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE);
        valueList[1] = {
            name: Lang.get('official_all_all_combat'),
            value: tempCfg.all_combat
        };
        for (let i = 1; i <= 4; i += 1) {
            if (tempCfg['attribute_type' + i] > 0) {
                let nameStr = attrConfig.get(tempCfg['attribute_type' + i]).cn_name;
                nameStr = Lang.get('official_all') + nameStr;
                valueList[i + 1] = {
                    name: nameStr,
                    value: tempCfg['attribute_value' + i]
                };
            }
        }
        return valueList;
    };
    export function getTreeItemList(data) {
        if (UserCheck.enoughOpenDay(data.day_min) == false) {
            return null;
        }
        function convertStringToNumber(convetStr) {
            if (convetStr != '') {
                let condition = convetStr.split('|');
                let [treeType, minLevel, maxLevel] = condition;
                return [
                    Number(treeType),
                    Number(minLevel),
                    Number(maxLevel)
                ];
            }
            return [0];
        }
        function makeMaterialTable(treeType, minLevel, maxLevel) {
            let matrialTable: any = {};
            matrialTable.list = [];
            for (let i = minLevel + 1; i <= maxLevel; i++) {
                let cfgData = G_UserData.getHomeland().getSubTreeCfg(treeType, i - 1);
                let item: any = {};
                item.lv = Lang.get('homeland_level_desc', {
                    num1: i - 1,
                    num2: i
                });
                item.list = [];
                for (let i = 1; i <= 2; i++) {
                    let type = cfgData['type_' + i];
                    let value = cfgData['value_' + i];
                    let size = cfgData['size_' + i];
                    if (type > 0) {
                        item.list.push({
                            type: type,
                            value: value,
                            size: size
                        });
                    }
                }
                matrialTable.list.push(item);
            }
            let cfgData = G_UserData.getHomeland().getSubTreeCfg(treeType, maxLevel);
            matrialTable.cfg = cfgData;
            return matrialTable;
        }
        let matrialList = [];
        for (let i = 1; i <= 6; i++) {
            let condition = data['condition_' + i];
            let [treeType, minLevel, maxLevel] = convertStringToNumber(condition);
            if (treeType > 0) {
                let retTable = makeMaterialTable(treeType, minLevel, maxLevel);
                matrialList.push(retTable);
            }
        }
        return matrialList;
    };
    export function getTreePreviewList() {
        let tree_preview = G_ConfigLoader.getConfig(ConfigNameConst.TREE_PREVIEW);
        let treePreviewList = [];
        for (let i = 0; i < tree_preview.length(); i++) {
            let data = tree_preview.indexOf(i);
            let treeItemList = getTreeItemList(data);
            if (treeItemList) {
                treePreviewList.push({
                    id: data.id,
                    list: treeItemList
                });
            }
        }
        console.log(treePreviewList);
        return treePreviewList;
    };

    export function getValueOfBuff(value, equation) {
        if (equation && equation != '') {
            if (equation.indexOf('/60') != -1) {
                value = value / 60;
            } else {
                value = value / 10;
            }
            // equation = stringUtil.gsub(equation, 'parameter', value);
            //var func = loadstring('return ' + equation);
            //value = func();
        }
        return value;
    };
    export function getRealValueOfBuff(info) {
        var value = info.value;
        var equation = info.equation;
        var description = info.description;
        value = HomelandHelp.getValueOfBuff(value, equation);
        if (stringUtil.find(description, '#value#%%')) {
            value = value / 100;
        }
        return value;
    };
    export function getTimesOfBuff(times, type) {
        if (type == HomelandConst.TREE_BUFF_TYPE_3) {
            times = times / 3600;
        }
        return times;
    };
    export function getBuffDes(baseId) {
        var info = HomelandHelp.getTreeBuffConfig(baseId);
        var description = info.description;
        // var bossId = G_UserData.getCrossWorldBoss().getBoss_id();
        // if (bossId && bossId > 0 && baseId == HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_24) {
        //     var pozhaoCamp = CrossWorldBossHelper.getSelfIsPoZhaoCamp();
        //     if (pozhaoCamp == true) {
        //         description = Lang.get('homeland_tree_buff24_tip2');
        //     } else {
        //         description = Lang.get('homeland_tree_buff24_tip1');
        //     }
        // }
        var value = HomelandHelp.getValueOfBuff(info.value, info.equation);
        var times = HomelandHelp.getTimesOfBuff(info.times, info.type);
        var des = Lang.getTxt(description, {
            value: value,
            times: times
        });
        return des;
    };
    export function getBuffEffectTip(baseId) {
        var info = HomelandHelp.getTreeBuffConfig(baseId);
        var comment = info.screen_comment;
        var value = HomelandHelp.getValueOfBuff(info.value, info.equation);
        var tip = Lang.getTxt(comment, {
            name: info.name,
            value: value
        });
        return tip;
    };
    export function delayShowBuffNoticeTip(buffBaseId) {
        var tips = G_UserData.getHomeland().getBuffNoticeTip(buffBaseId);
        if (tips) {
            if (tips != '') {
                G_Prompt.showTip(tips);
            }
            G_UserData.getHomeland().removeBuffNoticeTip(buffBaseId);
        }
    };
    export function checkBuffIsCanUse(buffBaseId) {
        var buffDatas = G_UserData.getHomeland().getBuffDatasWithBaseId(buffBaseId);
        for (var i in buffDatas) {
            var buffData = buffDatas[i];
            if (buffData.isEffected() == false) {
                return [
                    true,
                    buffData
                ];
            }
        }
        return [false,null];
    };
}