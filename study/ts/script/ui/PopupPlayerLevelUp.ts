const { ccclass, property } = cc._decorator;

import { AudioConst } from '../const/AudioConst';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { DataConst } from '../const/DataConst';
import { SignalConst } from '../const/SignalConst';
import EffectGfxMoving from '../effect/EffectGfxMoving';
import EffectGfxNode from '../effect/EffectGfxNode';
import { Colors, G_AudioManager, G_ConfigLoader, G_ConfigManager, G_EffectGfxMgr, G_SignalManager, G_UserData } from '../init';
import { Lang } from '../lang/Lang';
import { UserDataHelper } from '../utils/data/UserDataHelper';
import { WayFuncDataHelper } from '../utils/data/WayFuncDataHelper';
import { handler } from '../utils/handler';
import { Path } from '../utils/Path';
import { TextHelper } from '../utils/TextHelper';
import UIActionHelper from '../utils/UIActionHelper';
import UIHelper from '../utils/UIHelper';
import { Util } from '../utils/Util';
import CommonContinueNode from './component/CommonContinueNode';
import CommonLevelUpAttr from './component/CommonLevelUpAttr';
import PopupBase from './PopupBase';
import PopupPlayerLevelUpCell from './PopupPlayerLevelUpCell';


@ccclass
export default class PopupPlayerLevelUp extends PopupBase {

    static preLoadRes = [
        'prefab/common/PopupPlayerLevelUpCell',
        'prefab/common/CommonLevelUpAttr'
    ];

    @property({
        type: cc.Node,
        visible: true
    })
    _panelRoot: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBK: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _effectRootNode: cc.Node = null;

    @property({
        type: PopupPlayerLevelUpCell,
        visible: true
    })
    _wayGetCell1: PopupPlayerLevelUpCell = null;

    @property({
        type: PopupPlayerLevelUpCell,
        visible: true
    })
    _wayGetCell2: PopupPlayerLevelUpCell = null;

    @property({
        type: PopupPlayerLevelUpCell,
        visible: true
    })
    _wayGetCell3: PopupPlayerLevelUpCell = null;

    @property({
        type: CommonContinueNode,
        visible: true
    })
    _commonContinueNode: CommonContinueNode = null;
    @property({
        type: cc.ScrollView,
        visible: true
    })
    private _listView: cc.ScrollView = null;

    private _functionGuideList = [];
    private _fingerEffectNodeList = [];
    private _isAnimEnd = false;
    private _effectNode;
    private _callBack;

    onLoad() {
        super.onLoad();
        this._commonContinueNode.node.active = false;
        this._panelRoot.on(cc.Node.EventType.TOUCH_END, handler(this, this._onClickScreen));
    }

    setCloseCallback(closeCallback) {
        this._callBack = closeCallback;
    }

    _onClickScreen() {
        if (this._isAnimEnd) {
            // logWarn('PopupPlayerLevelUp:_onClickScreen');
            this.close();
        }
    }

    defaultUI() {
        var baseMgr = G_UserData.getBase();
        var roleCfgData = UserDataHelper.getUpgradeAttrData(baseMgr.getOldPlayerLevel(), baseMgr.getLevel());
        var newVit = baseMgr.getResValue(DataConst.RES_VIT);
        var newSpirit = baseMgr.getResValue(DataConst.RES_SPIRIT);
        // dump(roleCfgData);
        var oldVit = newVit - roleCfgData.lvup_power;
        if (oldVit < 0) {
            oldVit = 0;
        }
        if (oldVit == 0) {
            oldVit = newVit;
        }
        var oldSpirit = newSpirit - roleCfgData.lvup_energy;
        if (oldSpirit < 0) {
            oldSpirit = 0;
        }
        if (oldSpirit == 0) {
            oldSpirit = 0;
        }
        var attrList = [];
        attrList.push({
            desc: Lang.get('player_level_up'),
            oldValue: baseMgr.getOldPlayerLevel(),
            newValue: baseMgr.getLevel()
        });
        attrList.push({
            desc: Lang.get('player_level_vip'),
            oldValue: oldVit,
            newValue: newVit
        });
        attrList.push({
            desc: Lang.get('player_level_spirit'),
            oldValue: oldSpirit,
            newValue: newSpirit
        });
        this.updateUI(attrList);
        this._initLevelInfo();
        this._addEffectNode();
    }

    updateUI(params) {
        for (var i in params) {
            var value = params[i];
            var widget = this._createLineAttr();
            this._listView.content.addChild(widget.node);
            // this._listView.pushBackCustomItem(widget);
            this._setAttrLine(widget, value.desc, value.oldValue, value.newValue);
        }
        // this._addEffectNode();
    }

    _createLineAttr(): cc.Widget {
        var rootWidget = new cc.Node().addComponent(cc.Widget);
        // var listSize = this._listView.content.getContentSize();

        var advanceAttr: CommonLevelUpAttr = Util.getNode('prefab/common/CommonLevelUpAttr', CommonLevelUpAttr);
        var advanceRoot: cc.Node = Util.getSubNodeByName(advanceAttr.node, 'Panel_root');
        var advanceSize = advanceRoot.getContentSize();
        rootWidget.node.setContentSize(advanceSize);
        rootWidget.node.addChild(advanceAttr.node);
        UIHelper.setPosByPercent(advanceAttr.node, cc.v2(0.5, 0.5), null);
        rootWidget.node.active = false;
        return rootWidget;
    }

    _setAttrLine(attr: cc.Widget, desc, oldValue, newValue) {
        Util.updateLabelByName(attr.node, 'Text_desc', desc);
        oldValue = oldValue || 0;
        Util.updateLabelByName(attr.node, 'Text_value', oldValue);
        Util.updateLabelByName(attr.node, 'Text_up_value', newValue);
        var arrow = Util.getSubNodeByName(attr.node, 'Image_arrow');
        if (arrow) {
            UIActionHelper.playFloatXEffect(arrow);
        }
    }

    addAttr(desc, oldValue, newValue) {
        var widget = this._createLineAttr();
        this._listView.content.addChild(widget.node);
        // this._listView.pushBackCustomItem(widget);
        this._setAttrLine(widget, "attrId", oldValue, newValue);
    }

    _addEffectNode() {
        if (!this._effectNode) {
            G_AudioManager.playSoundWithId(AudioConst.SOUND_CREATE_ROLE_LEVEL_UP);
            this._effectNode = this._createEffectNode(this._effectRootNode);
        }
    }

    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
    }
    _onInit() {
    }
    onEnter() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_START, "PopupPlayerLevelUp");
    }
    onClose() {
        if (this._callBack) {
            this._callBack(true);
        }
    }
    onExit() {
    }
    _initLevelInfo() {
        var infoList = [];
        var FunctionLevel = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL);
        var len = FunctionLevel.length();
        for (var i = 1; i <= len; i++) {
            var info = FunctionLevel.indexOf(i - 1);
            if (info && info.is_show_lvup != 0) {
                infoList.push(info);
            }
        }
        infoList.sort(function (a, b) {
            if (a.level == b.level) return 0;
            return a.level - b.level;
        });
        var maxShowNum = 2;
        var functionGuideList = this._getFunctionGuideList(infoList, maxShowNum);
        // console.log('>>>>>>> ', functionGuideList);
        var arr: string[] = [];
        for (var index in functionGuideList) {
            var value = functionGuideList[index];
            if (value.icon) arr.push(Path.getCommonIcon('main', value.icon));
        }
        this._functionGuideList = functionGuideList;
        if (arr.length > 0) {
            cc.resources.load(arr, cc.SpriteFrame, (err, resource) => {
                // console.log(err, resource);
                this.setFunctionGuideList();
            });
        }
        else {
            this.setFunctionGuideList();
        }
    }
    private setFunctionGuideList() {
        for (var index in this._functionGuideList) {
            var value = this._functionGuideList[index];
            this._updateWayInfo(parseInt(index) + 1, value);
        }
    }
    _updateWayInfo(index, wayInfo) {
        var wayItem: PopupPlayerLevelUpCell = this['_wayGetCell' + index];
        // console.log('>>>> ', index, wayItem);
        if (!wayItem) {
            // assert(false, 'PopupPlayerLevelUp:_updateWayInfo can\'t find wayItem by index : ' + index);
            return;
        }
        var playerLevel = G_UserData.getBase().getLevel();
        Util.updateImageView(wayItem._image_Icon, { texture: Path.getCommonIcon('main', wayInfo.icon), ignoreContentAdaptWithSize: true });
        var name = wayInfo.name;
        if (!G_ConfigManager.checkCanRecharge() && wayInfo.forbidIos == 1) {
             name = '' ;
        }
        Util.updateLabel(wayItem._text_way_name, { text: name });
        Util.updateLabel(wayItem._text_way_desc, { text: wayInfo.description });
        wayItem._button_OK.node.active = (playerLevel >= wayInfo.level && wayInfo.is_show_lvup == 1);
        var textDesc = Lang.get('way_type_no_open_desc', { level: wayInfo.level });
        Util.updateLabel(wayItem._text_way_unlock_desc, {
            visible: playerLevel < wayInfo.level,
            text: textDesc,
            color: Colors.getColor(6)
        });
        Util.updateImageView(wayItem._image_way_unlock, { visible: playerLevel >= wayInfo.level && wayInfo.is_show_lvup == 2 });
        var canSkip = playerLevel >= wayInfo.level && wayInfo.is_show_lvup == 1;
        if (wayItem._panel_Touch && canSkip) {
            wayItem._panel_Touch.on(cc.Node.EventType.TOUCH_END, () => {
                if (!this._commonContinueNode.node.active) return;
                if (canSkip) {
                    WayFuncDataHelper.gotoModuleByFuncId(wayInfo.function_id);
                }
                // this.close();
            });
        } else {
            wayItem._panel_Touch.active = false;
        }
        // console.log('>> ', playerLevel < wayInfo.level, playerLevel >= wayInfo.level && wayInfo.is_show_lvup == 2);
        // wayItem.node.active = false;
        if (wayInfo.is_show_lvup == 1 && wayInfo.is_guide == 1) {
            var effectNode = new EffectGfxNode();
            effectNode.setEffectName('effect_finger');
            wayItem._button_OK.node.addChild(effectNode.node);
            effectNode.play();
            UIHelper.setPosByPercent(effectNode.node, cc.v2(0.5, 0.5), null);
            this._fingerEffectNodeList.push(effectNode);
            // effectNode.node.active = false;
        }
    }

    _getFunctionGuideList(infoList, maxShowNum) {
        var lastIndex = null;
        for (var i = 0; i < infoList.length; i++) {
            var info = infoList[i];
            if (info.level >= G_UserData.getBase().getLevel()) {
                lastIndex = i;
                break;
            }
        }
        lastIndex = lastIndex == null ? (infoList.length - 1) : lastIndex;
        var start = lastIndex;
        var dstInfos = [];
        do {
            dstInfos.push(infoList[start]);
            // dstInfos[dstInfos.length] = infoList[start];
            start = start + 1;
        } while (dstInfos.length < maxShowNum && infoList[start] != null);
        if (dstInfos.length < maxShowNum) {
            start = lastIndex - 1;
            do {
                dstInfos.push(infoList[start]);
                // dstInfos[dstInfos.length] = infoList[start];
                start = start - 1;
            } while (dstInfos.length < maxShowNum && infoList[start] != null);
        }
        // assert(dstInfos.length >= maxShowNum, 'There is not enough info with open level: ' + tostring(G_UserData.getBase().getLevel()));
        dstInfos.sort((a, b) => {
            if (a.level == b.level) return 0;
            return a.level - b.level;
        });
        return dstInfos;
    }
    isAnimEnd() {
        return this._isAnimEnd;
    }
    _createEffectNode(effectRootNode) {
        let effectFnc = function (event) {
            // console.log('event: ', event);
            if (TextHelper.stringStartsWith(event, 'play_shuzhi')) {
                var index = TextHelper.stringGetSuffixIndex(event, 'play_shuzhi');
                var item = this._listView.content.children[index - 1];
                if (item) {
                    item.active = true;
                    G_EffectGfxMgr.applySingleGfx(item, 'smoving_herolevelup_shuzhi', null, null, null);
                }
            } else if (TextHelper.stringStartsWith(event, 'play_zhaomu')) {
                var index = TextHelper.stringGetSuffixIndex(event, 'play_zhaomu');
                if (index > this._functionGuideList.length) {
                    return;
                }
                var wayGetCell = this['_wayGetCell' + index];
                if (wayGetCell) {
                    wayGetCell.node.active = true;
                    G_EffectGfxMgr.applySingleGfx(wayGetCell.node, 'smoving_herolevelup_zhaomu', null, null, null);
                }
            } else if (event == 'play_dianji') {
                this._commonContinueNode.node.active = (true);
            } else if (event == 'finish') {
                for (var k in this._fingerEffectNodeList) {
                    var v = this._fingerEffectNodeList[k];
                    v.node.active = true;
                }
                this._isAnimEnd = true;
            }
        }
        var moving: EffectGfxMoving = G_EffectGfxMgr.createPlayMovingGfx(effectRootNode, 'moving_herolevelup', null, effectFnc.bind(this), false);
        return moving.node;
    }
}