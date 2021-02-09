import ViewBase from "../../ViewBase";
import { G_SignalManager, G_UserData, G_TutorialManager, G_HeroVoiceManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { FunctionConst } from "../../../const/FunctionConst";
import CommonMainHeroNode from "../../../ui/component/CommonMainHeroNode";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { RedPointHelper } from "../../../data/RedPointHelper";
import { DataConst } from "../../../const/DataConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainAvatorsNode extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _resourceNode: cc.Node = null;

    private heroAvatar: { [key: string]: CommonMainHeroNode };

    private _signalUserDataUpdate;
    private _signalUserLevelUpdate;
    private _signalChangeHeroFormation;
    private _signalRedPointUpdate;
    private _signalOfficialLevelUp;
    private _signalEquipTitle;
    private _signalUnloadTitle;
    private _signalUpdateTitleInfo;
    private _funcId2HeroReach;

    protected onCreate() {
        this.heroAvatar = {};
        let resNode: cc.Node = this.node.getChildByName("_resourceNode");
        for (let i = 0; i < resNode.childrenCount; i++) {
            let hero: CommonMainHeroNode = resNode.children[i].getComponent(CommonMainHeroNode);
            hero.init();
            this.heroAvatar[resNode.children[i].name] = hero;
        }
        this.heroAvatar['_heroAvatar' + 1].changeTitle();
        this.onEnter1();
    }

    protected onEnter1() {
        this._signalUserDataUpdate = G_SignalManager.add(SignalConst.EVENT_RECV_ROLE_INFO, handler(this, this._onEventUserDataUpdate));
        this._signalUserLevelUpdate = G_SignalManager.add(SignalConst.EVENT_USER_LEVELUP, handler(this, this._onEventUserLevelUpdate));
        this._signalChangeHeroFormation = G_SignalManager.add(SignalConst.EVENT_CHANGE_HERO_FORMATION_SUCCESS, handler(this, this._onEventUserHeroChange));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalOfficialLevelUp = G_SignalManager.add(SignalConst.EVENT_OFFICIAL_LEVEL_UP, handler(this, this._onEventOfficialLevelUp));
        this._signalEquipTitle = G_SignalManager.add(SignalConst.EVENT_EQUIP_TITLE, handler(this, this._onEventTitleChange));
        this._signalUnloadTitle = G_SignalManager.add(SignalConst.EVENT_UNLOAD_TITLE, handler(this, this._onEventTitleChange));
        this._signalUpdateTitleInfo = G_SignalManager.add(SignalConst.EVENT_UPDATE_TITLE_INFO, handler(this, this._onEventTitleChange));
        this._funcId2HeroReach = {};

        this.updateAll();

   
    }

    onEnter(){
        G_HeroVoiceManager.setIsInMainMenu(true);
        if (!G_TutorialManager.isDoingStep()) {
            G_HeroVoiceManager.startPlayMainMenuVoice();
        }
    }

    onExit(){
        G_HeroVoiceManager.setIsInMainMenu(false);
        if (!G_TutorialManager.isDoingStep()) {
            G_HeroVoiceManager.stopPlayMainMenuVoice();
        }
    }

    onCleanup() {
        this._signalUserDataUpdate.remove();
        this._signalUserDataUpdate = null;
        this._signalUserLevelUpdate.remove();
        this._signalUserLevelUpdate = null;
        this._signalChangeHeroFormation.remove();
        this._signalChangeHeroFormation = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalOfficialLevelUp.remove();
        this._signalOfficialLevelUp = null;
        this._signalEquipTitle.remove();
        this._signalEquipTitle = null;
        this._signalUnloadTitle.remove();
        this._signalUnloadTitle = null;
        this._signalUpdateTitleInfo.remove();
        this._signalUpdateTitleInfo = null;
    }

    private updateAll() {
        this._updateHeroAvatar();
    }

    private _onClickHeroAvatar(mainAvatar) {
    }

    /**
     * 更新上阵武将列表
     */
    private _updateHeroAvatar() {
        var heroIdList = G_UserData.getTeam().getHeroIdsInBattle();

        for (let i = 1; i <= 6; i++) {
            var heroNode: CommonMainHeroNode = this.heroAvatar['_heroAvatar' + i];
            if (heroNode) {
                var funcTeamSoltId = i - 1 + FunctionConst.FUNC_TEAM_SLOT1;
                heroNode.setFuncId(funcTeamSoltId);
            }
        }

        this._onlyUnlockOne(heroIdList);

        for (let i = 0; i < heroIdList.length; i++) {
            var value = heroIdList[i];
            var heroUnit = G_UserData.getHero().getUnitDataWithId(value);
            var heroNode: CommonMainHeroNode = this.heroAvatar['_heroAvatar' + (i + 1)];
            if (heroUnit && heroNode) {
                var [heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel] = AvatarDataHelper.getShowHeroBaseIdByCheck(heroUnit);
                var limitLevel = avatarLimitLevel || heroUnit.getLimit_level();
                var limitRedLevel = arLimitLevel || heroUnit.getLimit_rtg();
                heroNode.updateUI(heroBaseId, isEquipAvatar, limitLevel, limitRedLevel);
                heroNode.updateHeroName(heroUnit.getBase_id(), heroUnit.getRank_lv(), heroUnit.getLevel(), heroUnit.getLimit_level(), heroUnit.getLimit_rtg());
                if (heroUnit.getConfig().type == 1) {
                    heroNode.updateOfficial();
                }
            }
        }

        this._updateHeroAvatarRedPoint();
    }

    private _onlyUnlockOne(heroIdList) {
        var unLockOne = 0;
        var lockLevel = 0;
        for (var index = 1; index <= 6; index++) {
            var heroNode: CommonMainHeroNode = this.heroAvatar['_heroAvatar' + index];
            var heroId = heroIdList[index - 1];
            if (heroNode) {
                var funcTeamSoltId = index - 1 + FunctionConst.FUNC_TEAM_SLOT1;
                var isOpen = FunctionCheck.funcIsOpened(funcTeamSoltId)[0];
                if (isOpen == true && heroId == null) {
                    if (unLockOne == 0) {
                        heroNode.setLock(false);
                        heroNode.setAdd(true);
                    } else {
                        heroNode.setLock(false);
                        heroNode.setAdd(false);
                        heroNode.setShadowVisible(false);
                    }
                    unLockOne = unLockOne + 1;
                } else {
                    if (isOpen == false && lockLevel == 0 && heroId == null) {
                        heroNode.showOpenLevel(true);
                        lockLevel = lockLevel + 1;
                    }
                }
            }
        }
    }

    private _updateRedPointByFuncId(funcId, param) {
        if (funcId && funcId > 0) {
            if (this._isInHeroAvatarFuncList(funcId)) {
                this._updateHeroAvatarRedPoint(funcId, param);
            }
        }
    }

    private _onEventUserDataUpdate(_, param) {
        this._updateHeroAvatar();
    }

    private _onEventUserLevelUpdate(_, param) {
    }

    private _onEventUserHeroChange(_, param) {
        this._updateHeroAvatar();
    }

    private _onEventOfficialLevelUp(_, param) {
        this._updateHeroAvatar();
    }

    private _onEventRedPointUpdate(id, funcId, param) {
        this._updateRedPointByFuncId(funcId, param);
    }

    private _onEventTitleChange() {
        this.heroAvatar['_heroAvatar' + 1].changeTitle();
    }

    private _isInHeroAvatarFuncList(funcId) {
        var list = [
            FunctionConst.FUNC_EQUIP,
            FunctionConst.FUNC_TREASURE,
            FunctionConst.FUNC_INSTRUMENT,
            FunctionConst.FUNC_HORSE,
            FunctionConst.FUNC_HERO_TRAIN_TYPE1,
            FunctionConst.FUNC_HERO_TRAIN_TYPE2,
            FunctionConst.FUNC_HERO_TRAIN_TYPE3,
            FunctionConst.FUNC_HERO_TRAIN_TYPE4,
            FunctionConst.FUNC_EQUIP_TRAIN_TYPE1,
            FunctionConst.FUNC_EQUIP_TRAIN_TYPE2,
            FunctionConst.FUNC_TREASURE_TRAIN_TYPE1,
            FunctionConst.FUNC_TREASURE_TRAIN_TYPE2,
            FunctionConst.FUNC_TREASURE_TRAIN_TYPE4,
            FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1,
            FunctionConst.FUNC_HORSE_TRAIN,
            FunctionConst.FUNC_HERO_KARMA,
            FunctionConst.FUNC_TACTICS
        ];
        for (const key in list) {
            var id = list[key];
            if (id == funcId) {
                return true;
            }
        }
        return false;
    }

    private _updateHeroAvatarRedPoint(funcId?, param?) {
        function checkEquipRP(pos) {
            var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP, 'posRP', pos);
            return reach;
        }
        function checkTreasureRP(pos) {
            var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE, 'posRP', pos);
            return reach;
        }
        function checkInstrumentRP(pos) {
            var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                var unitData = G_UserData.getHero().getUnitDataWithId(heroId);
                var heroBaseId = unitData.getBase_id();
                var param = {
                    pos: pos,
                    heroBaseId: heroBaseId
                };
                var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT, 'posRP', param);
                return reach;
            }
            return false;
        }
        function checkHorseRP(pos) {
            var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                var unitData = G_UserData.getHero().getUnitDataWithId(heroId);
                var heroBaseId = unitData.getBase_id();
                var param = {
                    pos: pos,
                    heroBaseId: heroBaseId
                };
                var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE, 'posRP', param);
                return reach;
            }
            return false;
        }
        function checkHeroUpgrade(pos) {
            var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE1, heroUnitData);
            return reach;
        }
        function checkHeroBreak(pos) {
            var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE2, heroUnitData);
            return reach;
        }
        function checkHeroAwake(pos) {
            var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE3, heroUnitData);
            return reach;
        }
        function checkHeroLimit(pos) {
            var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE4, heroUnitData);
            return reach;
        }
        function checkEquipStrengthen(pos) {
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1, pos);
            return reach;
        }
        function checkEquipRefine(pos) {
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2, pos);
            return reach;
        }
        function checkTreasureUpgrade(pos) {
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1, pos);
            return reach;
        }
        function checkTreasureRefine(pos) {
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2, pos);
            return reach;
        }
        function checkTreasureLimit(pos) {
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4, pos);
            return reach;
        }
        function checkInstrumentAdvance(pos) {
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1, pos);
            return reach;
        }
        function checkHorseUpStar(pos) {
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HORSE_TRAIN, pos);
            return reach;
        }
        function checkKarma(pos) {
            var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_KARMA, heroUnitData);
            return reach;
        }
        function checkHeroChange(pos) {
            var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_CHANGE, heroUnitData);
            return reach;
        }
        function checkAvatar(pos) {
            if (pos != 1) {
                return false;
            }
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_AVATAR);
            return reach;
        }
        function checkEquipJade(pos) {
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3, pos);
            return reach;
        }
        function checkTactics(pos) {
            var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TACTICS, 'posRP', pos);
            return reach;
        }
        var checkFuncs = {
            [FunctionConst.FUNC_EQUIP]: checkEquipRP,
            [FunctionConst.FUNC_TREASURE]: checkTreasureRP,
            [FunctionConst.FUNC_INSTRUMENT]: checkInstrumentRP,
            [FunctionConst.FUNC_HORSE]: checkHorseRP,
            [FunctionConst.FUNC_HERO_TRAIN_TYPE1]: checkHeroUpgrade,
            [FunctionConst.FUNC_HERO_TRAIN_TYPE2]: checkHeroBreak,
            [FunctionConst.FUNC_HERO_TRAIN_TYPE3]: checkHeroAwake,
            [FunctionConst.FUNC_HERO_TRAIN_TYPE4]: checkHeroLimit,
            [FunctionConst.FUNC_EQUIP_TRAIN_TYPE1]: checkEquipStrengthen,
            [FunctionConst.FUNC_EQUIP_TRAIN_TYPE2]: checkEquipRefine,
            [FunctionConst.FUNC_TREASURE_TRAIN_TYPE1]: checkTreasureUpgrade,
            [FunctionConst.FUNC_TREASURE_TRAIN_TYPE2]: checkTreasureRefine,
            [FunctionConst.FUNC_TREASURE_TRAIN_TYPE4]: checkTreasureLimit,
            [FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1]: checkInstrumentAdvance,
            [FunctionConst.FUNC_HORSE_TRAIN]: checkHorseUpStar,
            [FunctionConst.FUNC_HERO_KARMA]: checkKarma,
            [FunctionConst.FUNC_TACTICS]: checkTactics,
            [FunctionConst.FUNC_HERO_CHANGE]: checkHeroChange,
            [FunctionConst.FUNC_AVATAR]: checkAvatar,
            [FunctionConst.FUNC_EQUIP_TRAIN_TYPE3]: checkEquipJade
        };
        var redPointFuncId = [
            FunctionConst.FUNC_EQUIP,
            FunctionConst.FUNC_TREASURE,
            FunctionConst.FUNC_INSTRUMENT,
            FunctionConst.FUNC_HORSE,
            FunctionConst.FUNC_HERO_TRAIN_TYPE1,
            FunctionConst.FUNC_HERO_TRAIN_TYPE2,
            FunctionConst.FUNC_HERO_TRAIN_TYPE3,
            FunctionConst.FUNC_HERO_TRAIN_TYPE4,
            FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1,
            FunctionConst.FUNC_HORSE_TRAIN,
            FunctionConst.FUNC_HERO_KARMA,
            FunctionConst.FUNC_HERO_CHANGE,
            FunctionConst.FUNC_AVATAR,
            FunctionConst.FUNC_EQUIP_TRAIN_TYPE3,
            FunctionConst.FUNC_TACTICS
        ];
        var arrowFuncId = [
            FunctionConst.FUNC_EQUIP_TRAIN_TYPE1,
            FunctionConst.FUNC_EQUIP_TRAIN_TYPE2,
            FunctionConst.FUNC_TREASURE_TRAIN_TYPE1,
            FunctionConst.FUNC_TREASURE_TRAIN_TYPE2,
            FunctionConst.FUNC_TREASURE_TRAIN_TYPE4
        ];
        var heroIdList = G_UserData.getTeam().getHeroIdsInBattle();
        for (let i = 0; i < heroIdList.length; i++) {
            var value = heroIdList[i];
            var heroNode = this.heroAvatar['_heroAvatar' + (i + 1).toString()];
            var reachArrow = false;
            var reachRedPoint = false;
            if (heroNode) {
                if (funcId) {
                    if (param) {
                        var item2FuncId = null;
                        for (let j = 0; j < param.length; j++) {
                            var item = param[j];
                            if (item.id) {
                                if (funcId == FunctionConst.FUNC_HERO_TRAIN_TYPE2 && item.id == DataConst.ITEM_BREAK) {
                                    item2FuncId = funcId;
                                    break;
                                }
                                if (funcId == FunctionConst.FUNC_EQUIP_TRAIN_TYPE2 && item.id == DataConst['ITEM_REFINE_STONE_1'] && item.id == DataConst['ITEM_REFINE_STONE_2'] && item.id == DataConst['ITEM_REFINE_STONE_3'] && item.id == DataConst['ITEM_REFINE_STONE_4']) {
                                    item2FuncId = funcId;
                                    break;
                                }
                                if (funcId == FunctionConst.FUNC_TREASURE_TRAIN_TYPE2 && item.id == DataConst.ITEM_TREASURE_REFINE_STONE) {
                                    item2FuncId = funcId;
                                    break;
                                }
                                if (funcId == FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1 && item.id == DataConst.ITEM_INSTRUMENT_STONE) {
                                    item2FuncId = funcId;
                                    break;
                                }
                            }
                        }
                        if (item2FuncId) {
                            var func = checkFuncs[item2FuncId];
                            if (func) {
                                this._funcId2HeroReach[item2FuncId] = func(i + 1);
                            }
                        }
                    } else {
                        var func = checkFuncs[funcId];
                        if (func) {
                            this._funcId2HeroReach[funcId] = func(i + 1);
                        }
                    }
                } else {
                    for (let j in arrowFuncId) {
                        let funcId_2 = arrowFuncId[j];
                        let func = checkFuncs[funcId_2];
                        if (func) {
                            var reach = func(i + 1);
                            this._funcId2HeroReach[funcId_2] = reach;
                            if (reach) {
                                reachArrow = true;
                                break;
                            }
                        }
                    }
                    //小红点
                    for (let j in redPointFuncId) {
                        let funcId_1 = redPointFuncId[j];
                        let func = checkFuncs[funcId_1];
                        if (func) {
                            var reach = func(i + 1);
                            this._funcId2HeroReach[funcId_1] = reach;
                            if (reach) {
                                reachRedPoint = true;
                                break;
                            }
                        }
                    }
                }
                if (reachArrow) {
                    heroNode.showRedPoint(reachRedPoint);
                    heroNode.showImageArrow(false);
                } else {
                    heroNode.showRedPoint(reachRedPoint);
                    heroNode.showImageArrow(false);
                }
            }
        }
    }
}