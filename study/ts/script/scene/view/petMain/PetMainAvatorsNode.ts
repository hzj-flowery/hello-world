const { ccclass, property } = cc._decorator;

import CommonPetMainAvatar from '../../../ui/component/CommonPetMainAvatar'
import { G_UserData, G_SignalManager, G_Prompt } from '../../../init';
import { Path } from '../../../utils/Path';
import PetConst from '../../../const/PetConst';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { FunctionConst } from '../../../const/FunctionConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import CircleScroll from '../../../ui/CircleScroll';

@ccclass
export default class PetMainAvatorsNode extends CircleScroll {
    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;
    @property({
        type: CommonPetMainAvatar,
        visible: true
    })
    _avatar5: CommonPetMainAvatar = null;

    @property({
        type: CommonPetMainAvatar,
        visible: true
    })
    _avatar6: CommonPetMainAvatar = null;

    @property({
        type: CommonPetMainAvatar,
        visible: true
    })
    _avatar4: CommonPetMainAvatar = null;

    @property({
        type: CommonPetMainAvatar,
        visible: true
    })
    _avatar3: CommonPetMainAvatar = null;

    @property({
        type: CommonPetMainAvatar,
        visible: true
    })
    _avatar2: CommonPetMainAvatar = null;

    @property({
        type: CommonPetMainAvatar,
        visible: true
    })
    _avatar1: CommonPetMainAvatar = null;

    @property({
        type: CommonPetMainAvatar,
        visible: true
    })
    _avatar7: CommonPetMainAvatar = null;
    _startIndex: any;
    _parentView: any;
    _signalPetLevelUpdate;
    _signalChangePetFormation;
    _signalRedPointUpdate;
    _signalPetLimitUp: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;

    ctorSlef(size, angles, startIndex, parentView, angleOffset, circle, scaleRange) {
        super.ctor(size, angles, startIndex, angleOffset, circle, scaleRange);
        this._resourceNode = null;
        this._startIndex = startIndex;
        this._parentView = parentView;
        this.node.name = "PetMainAvatorsNode";
    }
    _preCreateAvatar() {
        var [showNum] = G_UserData.getPet().getShowPetNum();
        let createAvatar = function (index) {
            var petAvatar = this['_avatar' + index];
            petAvatar.updateImageBk(Path.getPet('pet_taizi' + index));
            petAvatar.node.name = ('_avatar' + index);
            this['_avatar' + index] = petAvatar;
            return petAvatar;
        }.bind(this);
        if (showNum <= PetConst.SCROLL_AVATART_NUM) {
            for (var i = 1; i <= showNum; i++) {
                var petInfo = PetConst['PET_INFO' + showNum];
                var position = petInfo[i].position;
                var scale = petInfo[i].scale;
                var zorder = petInfo[i].zorder;
                var imageScale = petInfo[i].imageScale;
                var petAvatar = createAvatar(i);
                petAvatar.node.setPosition(position);
                petAvatar.setAvatarScale(scale);
                petAvatar.setImageScale(imageScale);
                petAvatar.node.zIndex = (zorder);
                this.addMidLayer(petAvatar.node);
            }
        } else {
            for (var i = 1; i <= showNum; i++) {
                var petAvatar = createAvatar(i);
                petAvatar.setAvatarScale(PetConst.SCROLL_AVATAR_SCALE);
                this.addNode(petAvatar.node, i);
            }
        }
        for (var i = showNum + 1; i <= 7; i++) {
            this['_avatar' + i].node.active = false;
            this['_avatar' + i] = null;
        }
    }
    updateAll() {
        this._updatePetAvatar();
    }
    start() {
        this._preCreateAvatar();
        this._playNodeEffect();
        this._signalPetLevelUpdate = G_SignalManager.add(SignalConst.EVENT_PET_LEVEL_UP_SUCCESS, handler(this, this._onEventPetLevelUpdate));
        this._signalChangePetFormation = G_SignalManager.add(SignalConst.EVENT_PET_ON_TEAM_SUCCESS, handler(this, this._onEventUserPetChange));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalPetLimitUp = G_SignalManager.add(SignalConst.EVENT_PET_LIMITUP_SUCCESS, handler(this, this._onEventUserPetChange));
        this.updateAll();
        G_UserData.getAttr().recordPower();
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PetMainAvatorsNode");
    }
    onDestroy() {
        this._signalPetLevelUpdate.remove();
        this._signalPetLevelUpdate = null;
        this._signalChangePetFormation.remove();
        this._signalChangePetFormation = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalPetLimitUp.remove();
        this._signalPetLimitUp = null;
    }
    _onClickPetAvatar(mainAvatar) {
    }
    getAvatarIndex(funcId) {
        var funcIdList = this._getFuncList();
        for (var i in funcIdList) {
            var value = funcIdList[i];
            if (value == funcId) {
                return parseFloat(i);
            }
        }
        return 1;
    }
    _getFuncList() {
        var funcIdList = {};
        var [showNum] = G_UserData.getPet().getShowPetNum();
        if (showNum <= 5) {
            funcIdList = {
                [1]: FunctionConst.FUNC_PET_HELP_SLOT1,
                [2]: FunctionConst.FUNC_PET_HELP_SLOT2,
                [3]: FunctionConst.FUNC_PET_HELP_SLOT3,
                [4]: FunctionConst.FUNC_PET_HELP_SLOT4,
                [5]: FunctionConst.FUNC_PET_HELP_SLOT5
            };
        } else {
            funcIdList = {
                [1]: FunctionConst.FUNC_PET_HELP_SLOT1,
                [2]: FunctionConst.FUNC_PET_HELP_SLOT2,
                [3]: FunctionConst.FUNC_PET_HELP_SLOT3,
                [4]: FunctionConst.FUNC_PET_HELP_SLOT4,
                [5]: FunctionConst.FUNC_PET_HELP_SLOT5,
                [6]: FunctionConst.FUNC_PET_HELP_SLOT6,
                [7]: FunctionConst.FUNC_PET_HELP_SLOT7
            };
        }
        return funcIdList;
    }
    getFuncIdByIndex(index) {
        var funcIdList = this._getFuncList();
        return funcIdList[index];
    }
    _playNodeEffect() {
        for (var i = 4; i <= 6; i++) {
            var avatarNode = this['_avatar' + i];
            if (avatarNode) {
                avatarNode.playEffect('effect_shenshou_taizi' + i);
            }
        }
    }
    _updatePetAvatar() {
        var petIdList = G_UserData.getTeam().getPetIdsInHelpWithZero();
        var startFuncId = FunctionConst.FUNC_PET_HELP_SLOT1;
        for (var index = 1; index <= 7; index++) {
            var avatarNode = this['_avatar' + index];
            if (avatarNode && avatarNode.node.active) {
                var funcTeamSoltId = this.getFuncIdByIndex(index);
                avatarNode.setFuncId(funcTeamSoltId);
            }
        }
        let onlyUnlockOne = function () {
            var unLockOne = 0;
            var lockLevel = 0;
            var retCanMove = true;
            for (var index = FunctionConst.FUNC_PET_HELP_SLOT1; index <= FunctionConst.FUNC_PET_HELP_SLOT7; index++) {
                var avatarIndex = this.getAvatarIndex(index);
                var avatarNode = this['_avatar' + avatarIndex];
                if (avatarNode) {
                    var funcTeamSoltId = this.getFuncIdByIndex(avatarIndex);
                    var petId = petIdList[funcTeamSoltId - FunctionConst.FUNC_PET_HELP_SLOT1];
                    var [isOpen] = LogicCheckHelper.funcIsOpened(funcTeamSoltId);
                    var isShow = LogicCheckHelper.funcIsShow(funcTeamSoltId);
                    avatarNode.node.active = (isShow);
                    if (isShow == false) {
                        retCanMove = false;
                    }
                    avatarNode.setLock(!isOpen);
                    avatarNode.setAdd(isOpen);
                    if (isOpen == false && lockLevel == 0 && petId == 0) {
                        avatarNode.showOpenLevel(true);
                        lockLevel = lockLevel + 1;
                    }
                }
            }
            return retCanMove;
        }.bind(this);
        this.setMoveEnable(false);
        var moveEnable = onlyUnlockOne();
        this.setMoveEnable(moveEnable);
        for (var i in petIdList) {
            var value = petIdList[i];
            var petUnit = G_UserData.getPet().getUnitDataWithId(value);
            var avatarIndex = this.getAvatarIndex(parseFloat(i) + FunctionConst.FUNC_PET_HELP_SLOT1);
            var funcTeamSoltId = this.getFuncIdByIndex(avatarIndex);
            var avatarNode = this['_avatar' + avatarIndex];
            if (petUnit && avatarNode) {
                avatarNode.updateUI(petUnit.getBase_id(), handler(this, this._onClickPetAvatar));
                avatarNode.updatePetName(petUnit.getBase_id(), petUnit.getStar(), petUnit.getLevel());
                avatarNode.setPetIndex(funcTeamSoltId - FunctionConst.FUNC_PET_HELP_SLOT1 + 1);
            }
        }
        this._updatePetAvatarRedPoint();
    }
    _updateRedPointByFuncId(funcId, param) {
        if (funcId && funcId > 0) {
            if (this._isInPetAvatarFuncList(funcId)) {
                this._updatePetAvatarRedPoint(funcId, param);
            }
        }
    }
    _onEventUserDataUpdate(_, param) {
        this._updatePetAvatar();
    }
    _onEventPetLevelUpdate(_, param) {
        this._updatePetAvatar();
    }
    _onEventUserPetChange(_, param) {
        G_UserData.getAttr().recordPower();
        this._updatePetAvatar();
        G_Prompt.playTotalPowerSummary();
    }
    _onEventOfficialLevelUp(_, param) {
        this._updatePetAvatar();
    }
    _onEventRedPointUpdate(id, funcId, param) {
        this._updateRedPointByFuncId(funcId, param);
    }
    _isInPetAvatarFuncList(funcId) {
        var list = {};
        for (var i in list) {
            var id = list[i];
            if (id == funcId) {
                return true;
            }
        }
        return false;
    }
    _updatePetAvatarRedPoint(funcId?, param?) {
        function checkPetUpgrade(petId) {
            var petUnitData = G_UserData.getPet().getUnitDataWithId(petId);
            if (petUnitData == null) {
                return false;
            }
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE1, petUnitData);
            return reach;
        }
        function checkPetBreak(petId) {
            var petUnitData = G_UserData.getPet().getUnitDataWithId(petId);
            if (petUnitData == null) {
                return false;
            }
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE2, petUnitData);
            return reach;
        }
        function checkPetLimit(petId) {
            var petUnitData = G_UserData.getPet().getUnitDataWithId(petId);
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE3, petUnitData);
            return reach;
        }
        var checkFuncs = {
            [FunctionConst.FUNC_PET_TRAIN_TYPE1]: checkPetUpgrade,
            [FunctionConst.FUNC_PET_TRAIN_TYPE2]: checkPetBreak,
            [FunctionConst.FUNC_PET_TRAIN_TYPE3]: checkPetLimit
        };
        var redPointFuncId = [
            FunctionConst.FUNC_PET_TRAIN_TYPE1,
            FunctionConst.FUNC_PET_TRAIN_TYPE2,
            FunctionConst.FUNC_PET_TRAIN_TYPE3
        ];
        var petIdList = G_UserData.getTeam().getPetIdsInHelpWithZero();
        for (var index = FunctionConst.FUNC_PET_HELP_SLOT1; index <= FunctionConst.FUNC_PET_HELP_SLOT7; index++) {
            var avatarIndex = this.getAvatarIndex(index);
            var avatarNode = this['_avatar' + avatarIndex];
            if (avatarNode) {
                var funcTeamSoltId = this.getFuncIdByIndex(avatarIndex);
                var petId = petIdList[funcTeamSoltId - FunctionConst.FUNC_PET_HELP_SLOT1];
                if (petId > 0) {
                    var reachRedPoint = false;
                    for (var j in redPointFuncId) {
                        funcId = redPointFuncId[j];
                        var func = checkFuncs[funcId];
                        var reach = func(petId);
                        if (reach) {
                            reachRedPoint = true;
                            break;
                        }
                    }
                    avatarNode.showRedPoint(reachRedPoint);
                }
            }
        }
    }

}