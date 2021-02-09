const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { DataConst } from '../../../const/DataConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { LimitCostConst } from '../../../const/LimitCostConst';
import PetConst from '../../../const/PetConst';
import { SignalConst } from '../../../const/SignalConst';
import UIConst from '../../../const/UIConst';
import EffectHelper from '../../../effect/EffectHelper';
import { G_AudioManager, G_EffectGfxMgr, G_Prompt, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonHelpBig from '../../../ui/component/CommonHelpBig';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import CommonHeroStar from '../../../ui/component/CommonHeroStar';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import { PetTrainHelper } from '../petTrain/PetTrainHelper';
import PetLimitCostNode from './PetLimitCostNode';
import PetLimitCostPanel from './PetLimitCostPanel';
import PopupPetLimitDetail from './PopupPetLimitDetail';

@ccclass
export default class PetTrainLimitLayer extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: CommonHelpBig,
        visible: true
    })
    _buttonHelp: CommonHelpBig = null;

    @property({
        type: CommonHeroStar,
        visible: true
    })
    _fileNodeStar: CommonHeroStar = null;

    @property({
        type: PetLimitCostNode,
        visible: true
    })
    _costNode1: PetLimitCostNode = null;

    @property({
        type: PetLimitCostNode,
        visible: true
    })
    _costNode2: PetLimitCostNode = null;

    @property({
        type: PetLimitCostNode,
        visible: true
    })
    _costNode3: PetLimitCostNode = null;

    @property({
        type: PetLimitCostNode,
        visible: true
    })
    _costNode4: PetLimitCostNode = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _petAvatar: CommonHeroAvatar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTitleBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTitle: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _petName: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBgMoving: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePopup: cc.Node = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonBreak: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _nodeSilver: CommonResourceInfo = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonDetail: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeHetiMoving: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFire: cc.Node = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _petLimitCostPanel: cc.Prefab = null;

    _materialFakeCount: any;
    _materialFakeCostCount: any;
    _materialFakeCurSize: number;
    _recordAttr: any;
    _signalPetLimitUpMaterial: any;
    _petUnitData: any;
    _parentView: any;
    _popupPanel: any;
    _costMaterials: any;
    _popupPanelSignal: any;
    _petNameOrgX: number;

    ctor(parentView) {
        this.node.name = "PetTrainStarLayer";
        this._parentView = parentView;
        UIHelper.addEventListener(this.node, this._buttonDetail, 'PetTrainLimitLayer', '_onButtonDetail');
        this._buttonBreak.addClickEventListenerEx(handler(this, this._onButtonBreak));
    }

    onCreate() {
        this.setSceneSize(null, true);
        this.node.setPosition(this.node.width/2, this.node.height/2);
        this.updateSceneId(2006);
        this._materialFakeCount = null;
        this._materialFakeCostCount = null;
        this._materialFakeCurSize = 0;
        this._petNameOrgX = 0;
        this._initUI();
        this._initAvatar();
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst.FUNC_PET_TRAIN_TYPE3);
    }
    onEnter() {
        this._signalPetLimitUpMaterial = G_SignalManager.add(SignalConst.EVENT_PET_LIMITUP_MATERIAL_SUCCESS, handler(this, this._onEventPetLimitUpPutRes));
    }
    onExit() {
        this._signalPetLimitUpMaterial.remove();
        this._signalPetLimitUpMaterial = null;
    }
    _initAvatar() {
        this._petAvatar.init();
        this._petAvatar.setConvertType(TypeConvertHelper.TYPE_PET);
        this._petAvatar.setScale(1);
        this._petAvatar.setShadowScale(2.7);
    }
    initInfo() {
        this._updateData();
        this._updateView();
        this._updateCost();
        this._playFire(true);
    }
    _updateView() {
        this._updatePet();
        this._updateInfoUI();
        this._updateNodeSliver();
    }
    _updatePet() {
        var config = this._petUnitData.getConfig();
        var petBaseId = config.potential_after > 0 && config.potential_after || config.id;
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET, petBaseId);
        this._petName.string = (param.name);
        this._petName.node.color = (param.icon_color);
        UIHelper.enableOutline(this._petName, param.icon_color_outline);
        this._petAvatar.updateUI(petBaseId);
        this._petAvatar.playAnimationLoopIdle();
        this._fileNodeStar.setCount(this._petUnitData.getStar());

        if (config.potential_after > 0) {
            this._imageTitleBg.node.active = (true);
            this._imageTitle.node.active = (true);
            this._petName.node.x = (this._petNameOrgX);
        } else {
            this._imageTitleBg.node.active = (false);
            this._imageTitle.node.active = (false);
            var sz = this._petName.node.getContentSize();
            this._petName.node.x =  (-sz.width * 0.5);
        }
    }
    _updateInfoUI() {
        var isCan = PetTrainHelper.canLimit(this._petUnitData, true);
        this._buttonBreak.setVisible(isCan);
        this._nodeSilver.setVisible(isCan);
    }
    _onEventPetLimitUpPutRes(id, costKey) {
        this._updateData();
        if (costKey != LimitCostConst.BREAK_LIMIT_UP) {
            this._putResEffect(costKey);
            this._updateNodeSliver();
        } else {
            G_AudioManager.playSoundWithId(AudioConst.SOUND_LIMIT_TUPO);
            this._playLvUpEffect();
        }
        if (this._parentView && this._parentView.checkRedPoint) {
            this._parentView.checkRedPoint(3);
        }
        // this._updateCost();
    }
    _playLvUpEffect() {
        function effectFunction(effect) {
            return new cc.Node();
        }
        var eventFunction = function (event) {
            if (event == 'faguang') {
            } else if (event == 'finish') {
                this._updateView();
                this._playFire(true);
                var delay = cc.delayTime(0.5);
                var sequence = cc.sequence(delay, cc.callFunc(function () {
                    this._playPrompt();
                }.bind(this)));
                this.node.runAction(sequence);
            }
        }.bind(this);
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeHetiMoving, 'moving_tujieheti', effectFunction, eventFunction, true);
        for (var key = LimitCostConst.LIMIT_COST_KEY_1; key <= LimitCostConst.LIMIT_COST_KEY_4; key++) {
            this['_cost' + key].playSMoving();
        }
    }
    _updateNodeSliver() {
        if (this._petUnitData.getConfig().potential_after == 0) {
            this._nodeSilver.setVisible(false);
            this._buttonBreak.setVisible(false);
            return;
        }
        var isCan = PetTrainHelper.canLimit(this._petUnitData, true);
        if (isCan) {
            this._buttonBreak.setVisible(isCan);
            this._nodeSilver.setVisible(isCan);
            var silver = PetTrainHelper.getCurLimitCostInfo()['coin_size'];
            var strSilver = TextHelper.getAmountText3(silver);
            this._nodeSilver.setCount(strSilver, null, true);
            this._nodeSilver.setVisible(silver > 0);
            var isEnough = false;
            var haveCoin = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, 2);
            isEnough = haveCoin >= silver;
            if (isEnough) {
                this._nodeSilver.setTextColorToDTypeColor();
            } else {
                this._nodeSilver.setCountColorRed(true);
            }
            this._buttonBreak.showRedPoint(isCan && isEnough);
        }
    }
    _playFire(isPlay) {
        this._nodeFire.active = (true);
        this._nodeFire.removeAllChildren();
        var effectName = isPlay && 'effect_tujietiaozi_1' || 'effect_tujietiaozi_2';
        var quality = this._petUnitData.getQuality();
        if (quality == PetConst.QUALITY_RED) {
            G_EffectGfxMgr.createPlayGfx(this._nodeFire, effectName);
        }
    }
    _putResEffect(costKey) {
        if (this._popupPanel == null) {
            this._updateCost();
            return;
        }
        if (this._materialFakeCostCount && this._materialFakeCostCount > 0) {
            this._materialFakeCostCount = null;
            this._updateCost();
        } else {
            var curCount = this._petUnitData.getMaterials()[costKey - 1] || 0;
            for (var i in this._costMaterials) {
                var material = this._costMaterials[i];
                var itemId = material.id;
                var emitter = this._createEmitter(costKey);
                var startNode = this._popupPanel.findNodeWithItemId(itemId);
                var endNode = this['_costNode' + costKey];
                this['_cost' + costKey].lock();
                this._playEmitterEffect(emitter, startNode, endNode, costKey, curCount);
            }
        }
        this._popupPanel.updateUI();
        if (this._checkIsMaterialFull(costKey) == true) {
            this._popupPanel.close();
        }
    }
    _updateData() {
        var petId = G_UserData.getPet().getCurPetId();
        this._petUnitData = G_UserData.getPet().getUnitDataWithId(petId);
        var param = { unitData: this._petUnitData };
        var attrInfo = UserDataHelper.getPetTotalAttr(param);
        this._recordAttr.updateData(attrInfo);
        G_UserData.getAttr().recordPower();
    }
    _initUI() {
        this._imageBg.node.active = (false);
        this._petNameOrgX = this._petName.node.x;
        this._initCostIcon();
        this._buttonHelp.updateLangName('pet_limit_up_help_txt');
        this._buttonBreak.setString(Lang.get('pet_limit_break_btn'));
        this._nodeSilver.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD);
        this._nodeSilver.setTextColorToDTypeColor();
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeBgMoving, 'moving_tujie_huohua', null, null, false);
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeBgMoving, 'moving_shengshoushenghong_middle', null, null, false);
    }
    _openPopupPanel(costKey, limitLevel) {
        if (this._popupPanel != null) {
            return;
        }
        var node = cc.instantiate(this._petLimitCostPanel) as cc.Node;
        this._popupPanel = node.getComponent(PetLimitCostPanel) as PetLimitCostPanel;
        this._popupPanel.setInitData(costKey, handler(this, this._onClickCostPanelItem), handler(this, this._onClickCostPanelStep), handler(this, this._onClickCostPanelStart), handler(this, this._onClickCostPanelStop), limitLevel, (this['_costNode' + costKey] as PetLimitCostNode).node)
        this._popupPanelSignal = this._popupPanel.signal.add(handler(this, this._onPopupPanelClose));
        this._nodePopup.addChild(this._popupPanel.node);
        this._popupPanel.updateUI();
    }
    _checkCanLimit() {
        var curRank = this._petUnitData.getRank_lv();
        var star = this._petUnitData.getStar();
        // var isReach = PetTrainHelper.isReachLimitRank(limitLevel, curRank), needRank;
        // return [
        //     isReach,
        //     needRank
        // ];
    }
    _checkIsMaterialFull(costKey) {
        var curCount = this._petUnitData.getMaterials()[costKey -1];
        var costInfo = PetTrainHelper.getCurLimitCostInfo();
        return curCount >= costInfo['size_' + costKey];
    }
    _doPutRes(costKey, materials) {
        if (!PetTrainHelper.petStarCanLimit(this._petUnitData)) {
            G_Prompt.showTip(Lang.get('pet_limit_up_star_not'));
            return;
        }
        var subItem = materials[0];
        G_UserData.getPet().c2sPetPostRankUpMaterial(this._petUnitData.getId(), subItem, costKey);
        this._costMaterials = materials;
    }
    _createEmitter(costKey) {
        var names = {
            [LimitCostConst.LIMIT_COST_KEY_1]: 'tujiegreen',
            [LimitCostConst.LIMIT_COST_KEY_2]: 'tujieblue',
            [LimitCostConst.LIMIT_COST_KEY_3]: 'tujiepurple',
            [LimitCostConst.LIMIT_COST_KEY_4]: 'tujieorange'
        };
        var emitter = new cc.Node();
        var particleSystem = emitter.addComponent(cc.ParticleSystem);
        if (emitter) {
            EffectHelper.loadEffectRes('particle/' + (names[costKey]), cc.ParticleAsset, function (res) {
                if (res) {
                    particleSystem.file = res;
                    particleSystem.resetSystem();
                }
            }.bind(this))
        }
        return emitter;
    }
    _playEmitterEffect(emitter, startNode, endNode, costKey, curCount) {
        function getRandomPos(startPos, endPos) {
            var pos11 = cc.v2(startPos.x + (endPos.x - startPos.x) * 1 / 2, startPos.y + (endPos.y - startPos.y) * 3 / 4);
            var pos12 = cc.v2(startPos.x + (endPos.x - startPos.x) * 1 / 4, startPos.y + (endPos.y - startPos.y) * 1 / 2);
            var pos21 = cc.v2(startPos.x + (endPos.x - startPos.x) * 3 / 4, startPos.y + (endPos.y - startPos.y) * 1 / 2);
            var pos22 = cc.v2(startPos.x + (endPos.x - startPos.x) * 1 / 2, startPos.y + (endPos.y - startPos.y) * 1 / 4);
            var tbPos = {
                [1]: [
                    pos11,
                    pos12
                ],
                [2]: [
                    pos21,
                    pos22
                ]
            };
            var index = Math.random() < 0.5 ? 1 : 2;
            return [
                tbPos[index][0],
                tbPos[index][1]
            ];
        }
        var startPos = UIHelper.convertSpaceFromNodeToNode(startNode.node, this.node);
        emitter.setPosition(startPos);
        this.node.addChild(emitter);
        var endPos = UIHelper.convertSpaceFromNodeToNode(endNode.node, this.node);
        var [pointPos1, pointPos2] = getRandomPos(startPos, endPos);
        var bezier = [
            pointPos1,
            pointPos2,
            endPos
        ];
        var action1 = cc.bezierTo(0.7, bezier);
        var action2 = action1.easing(cc.easeSineIn());
        emitter.runAction(cc.sequence(action2, cc.callFunc(function () {
            this['_cost' + costKey].playRippleMoveEffect(1, curCount);
        }.bind(this)), cc.removeSelf()));
    }

    _onClickCostPanelItem(costKey, materials) {
        if (this._checkIsMaterialFull(costKey) == true) {
            return;
        }
        this._doPutRes(costKey, materials);
    }
    _onClickCostPanelStep(costKey, itemId, itemValue, costCountEveryTime) {
        if (this._materialFakeCount <= 0) {
            return false;
        }
        var costInfo = PetTrainHelper.getCurLimitCostInfo();
        if (this._materialFakeCurSize >= costInfo['size_' + costKey]) {
            G_Prompt.showTip(Lang.get('limit_material_full'));
            return [
                false,
                null,
                true
            ];
        }
        var realCostCount = Math.min(this._materialFakeCount, costCountEveryTime);
        this._materialFakeCount = this._materialFakeCount - realCostCount;
        this._materialFakeCostCount = this._materialFakeCostCount + realCostCount;
        var costSizeEveryTime = realCostCount;
        if (costKey == LimitCostConst.LIMIT_COST_KEY_1) {
            costSizeEveryTime = itemValue * realCostCount;
        }
        this._materialFakeCurSize = this._materialFakeCurSize + costSizeEveryTime;
        if (this._popupPanel) {
            var emitter = this._createEmitter(costKey);
            var startNode = this._popupPanel.findNodeWithItemId(itemId);
            var endNode = this['_costNode' + costKey];
            this._playEmitterEffect(emitter, startNode, endNode, costKey, this._materialFakeCurSize);
            startNode.setCount(this._materialFakeCount);
        }
        return [
            true,
            realCostCount
        ];
    }
    _onClickCostPanelStart(costKey, itemId, count) {
        this._materialFakeCount = count;
        this._materialFakeCostCount = 0;
        var materials = this._petUnitData.getMaterials();
        this._materialFakeCurSize = materials[costKey -1] || 0;
    }
    _onClickCostPanelStop() {
    }
    _onPopupPanelClose(event) {
        if (event == 'close') {
            this._popupPanel = null;
            if (this._popupPanelSignal) {
                this._popupPanelSignal.remove();
                this._popupPanelSignal = null;
            }
        }
    }
    _onButtonDetail() {
        PopupPetLimitDetail.getIns(PopupPetLimitDetail, (pop)=> {
            pop.ctor(this._petUnitData);
            pop.openWithAction();
        });
    }
    _onButtonBreak() {
        var petId = this._petUnitData.getId();
        G_UserData.getPet().c2sPetRankUp(petId);
    }
    _initCostIcon() {
        for (var key = LimitCostConst.LIMIT_COST_KEY_1; key <= LimitCostConst.LIMIT_COST_KEY_4; key++) {
            this['_cost' + key] = this['_costNode' + key];
            this['_costNode' + key].setInitData(key, handler(this, this._onClickCostAdd));
        }
    }
    _onClickCostAdd(costKey) {
        this._openPopupPanel(costKey, 1);
    }
    _updateCost() {
        var materials = this._petUnitData.getMaterials();
        for (var key = LimitCostConst.LIMIT_COST_KEY_1; key <= LimitCostConst.LIMIT_COST_KEY_4; key++) {
            var curCount = materials[key-1] || 0;
            this['_cost' + key].updateUI(1, curCount);
            this["_cost" + key].enableTextOutline(true)
            this['_costNode' + key].setVisible(this._petUnitData.getConfig().potential_after > 0);
            var isShow = PetTrainHelper.isPromptPetLimitWithCostKey(this._petUnitData, key);
            this['_cost' + key].showRedPoint(isShow);
        }
    }
    _playPrompt() {
        var summary = [];
        var content = Lang.get('summary_pet_limit_break_success');
        var param = { content: content };
        summary.push(param);
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary();
    }
    _addBaseAttrPromptSummary(summary) {
        var attr = this._recordAttr.getAttr();
        var desInfo = TextHelper.getAttrInfoBySort(attr);
        for (var i in desInfo) {
            var info = desInfo[i];
            var attrId = info.id;
            var diffValue = this._recordAttr.getDiffValue(attrId);
            if (diffValue != 0) {
                var param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: new cc.Vec2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_ATTR }
                };
                summary.push(param);
            }
        }
        return summary;
    }
}