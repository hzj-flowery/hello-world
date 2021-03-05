import { FunctionConst } from "../../../const/FunctionConst";
import { HistoryHeroConst } from "../../../const/HistoryHeroConst";
import { RedPointHelper } from "../../../data/RedPointHelper";
import { G_UserData, G_Prompt, G_SceneManager } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonHeroStar from "../../../ui/component/CommonHeroStar";
import CommonHistoryHeroIcon from "../../../ui/component/CommonHistoryHeroIcon";
import PopupItemGuider from "../../../ui/PopupItemGuider";
import { HistoryHeroDataHelper } from "../../../utils/data/HistoryHeroDataHelper";
import { handler } from "../../../utils/handler";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIActionHelper from "../../../utils/UIActionHelper";
import UIHelper from "../../../utils/UIHelper";
import { PopupChooseHistoricalItemView } from "../historyhero/PopupChooseHistoricalItemView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TeamHistoryHeroIcon extends cc.Component {
    @property({
        type: cc.Sprite,
        visible: true
    })
    _spriteAdd: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNameBg: cc.Sprite = null;

    @property({
        type: CommonHistoryHeroIcon,
        visible: true
    })
    _fileNodeCommon: CommonHistoryHeroIcon = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRedPoint: cc.Sprite = null;

    @property({
        type: CommonHeroStar,
        visible: true
    })
    _fileNodeStar: CommonHeroStar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;
    _pos: any;
    _heroId: any;
    _totalList: {};
    _noWearList: {};
    _historyHeroId: any;

    onLoad() {
        this._pos = null;
        this._heroId = null;
        this._totalList = {};
        this._noWearList = {};
        UIHelper.addEventListenerToNode(this.node, this._panelTouch, 'TeamHistoryHeroIcon', '_onPanelTouch');
    }
    _initUI() {
        this._spriteAdd.node.active = (false);
        this._fileNodeCommon.node.active = (false);
        this._textName.node.active = (false);
        this._imageNameBg.node.active = (false);
        this._imageRedPoint.node.active = (false);
        this._imageArrow.node.active = (false);
        this._fileNodeStar.node.active = (false);
    }
    updateIcon(pos) {
        this._pos = pos;
        var historyHeroData = G_UserData.getHistoryHero().getHeroDataWithPos(pos);
        this._initUI();
        if (historyHeroData) {
            this._historyHeroId = historyHeroData.getId();
            this._fileNodeCommon.updateUIWithUnitData(historyHeroData, 1);
            this._fileNodeCommon.node.active = (true);
            this._fileNodeCommon.setRoundType(false);
            var reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, 'strongerThanMe', historyHeroData);
            var reach2 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HISTORY_HERO_WAKEN, historyHeroData);
            var heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(historyHeroData.getSystem_id(), 2);
            var exist = false;
            if (historyHeroData.getBreak_through() == 2) {
                for (var i = 1; i <= 3; i++) {
                    var value = heroStepInfo['value_' + i];
                    var reach3 = G_UserData.getHistoryHero().existLevel2Hero(value);
                    var reach4 = G_UserData.getHistoryHero().existLevel1HeroWithWeapon(value);
                    exist = exist || (reach3 || reach4);
                }
            }
            this.showRedPoint(reach1 || reach2 || exist);
            var param = this._fileNodeCommon.getParam();
            this._imageNameBg.node.active = (true);
            this._textName.node.active = (true);
            this._textName.string = (historyHeroData.getConfig().name);
            this._textName.node.color = (param.icon_color);
            UIHelper.updateTextOutline(this._textName, param);
        } else {
            this._historyHeroId = null;
            var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, 'space');
            this._spriteAdd.node.active = (reach);
            this.showRedPoint(reach);
            if (reach) {
                UIActionHelper.playBlinkEffect(this._spriteAdd.node);
            }
            this._imageNameBg.node.active = (false);
            this._textName.node.active = (false);
        }
    }
    _onPanelTouch() {
        var [isOpen, des, info] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO);
        if (!isOpen) {
            G_Prompt.showTip(des);
            return;
        }
        var historyHeroData = G_UserData.getHistoryHero().getHeroDataWithPos(this._pos);
        if (historyHeroData) {
            G_SceneManager.showScene('historyheroTrain', this._pos);
        } else {
            var okCallback = function (id) {
                this._isDoOnformation = true;
                G_UserData.getHistoryHero().c2sStarEquip(id, this._pos - 1);
            }.bind(this);
            var notInFormationList = G_UserData.getHistoryHero().getNotInFormationList();
            if (notInFormationList.length == 0) {
                G_SceneManager.openPopup(Path.getCommonPrefab("PopupItemGuider"), (popup: PopupItemGuider) => {
                    popup.setTitle(Lang.get('way_type_get'));
                    popup.updateUI(TypeConvertHelper.TYPE_HISTORY_HERO, HistoryHeroConst.DEFAULT_HISTORY_HERO_ID);
                    popup.openWithAction();
                })
            } else {
                G_SceneManager.openPopup('prefab/historyhero/PopupChooseHistoricalItemView', (pop: PopupChooseHistoricalItemView) => {
                    pop.updateUI(HistoryHeroConst.TAB_TYPE_HERO, null, okCallback);
                    pop.openWithAction();
                });
            }
        }
    }
    _onChooseHorse(horseId) {
        G_UserData.getHorse().c2sWarHorseFit(this._pos, horseId);
    }
    showRedPoint(visible) {
        this._imageRedPoint.node.active = (visible);
    }
    showUpArrow(visible) {
        this._imageArrow.node.active = (visible);
        if (visible) {
            UIActionHelper.playFloatEffect(this._imageArrow.node);
        }
    }
    _blankFunc() {
    }
    onlyShow(data) {
        this._initUI();
        //this._panelTouch.setEnabled(false);
        if (data) {
            this._historyHeroId = data.getId();
            this._fileNodeCommon.updateUIWithUnitData(data, 1);
            this._fileNodeCommon.node.active = (true);
            this._fileNodeCommon.setRoundType(false);
            this._fileNodeCommon.setCallBack(handler(this, this._blankFunc));
            var param = this._fileNodeCommon.getParam();
            this._imageNameBg.node.active = (true);
            this._textName.node.active = (true);
            this._textName.string = (data.getConfig().name);
            this._textName.node.color = (param.icon_color);
            UIHelper.updateTextOutline(this._textName, param);
        }
    }
}