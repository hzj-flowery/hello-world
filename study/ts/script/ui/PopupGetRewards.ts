import { AnimationConst } from "../const/AnimationConst";
import { AudioConst } from "../const/AudioConst";
import { SignalConst } from "../const/SignalConst";
import { Colors, G_AudioManager, G_EffectGfxMgr, G_SignalManager, G_WaitingMask } from "../init";
import { EffectGfxType } from "../manager/EffectGfxManager";
import GoldHeroShow from "../scene/view/gachaDrawGoldHero/GoldHeroShow";
import { DropHelper } from "../utils/DropHelper";
import { unpack } from "../utils/GlobleFunc";
import { Path } from "../utils/Path";
import ResourceLoader from "../utils/resource/ResourceLoader";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import UIHelper from "../utils/UIHelper";
import { Util } from "../utils/Util";
import CommonContinueNode from "./component/CommonContinueNode";
import CommonIconBase from "./component/CommonIconBase";
import { ComponentIconHelper } from "./component/ComponentIconHelper";
import PopupBase from "./PopupBase";
import { Waiting_Show_Type } from "./WaitingMask";
import CommonPetIcon from "./component/CommonPetIcon";

const { ccclass, property } = cc._decorator;
@ccclass
export class PopupGetRewards extends PopupBase {

    static popupReward(awards, fromText, tipsText, finishCallback, titleImagePath, callback, isDouble?) {
        G_WaitingMask.showWaiting(true, Waiting_Show_Type.LOAD_RES);
        PopupGetRewards.loadPopupGetRewards(titleImagePath, (reward: PopupGetRewards) => {
            reward.show(awards, fromText, tipsText, finishCallback, titleImagePath, isDouble);
            callback && callback(reward);
            G_WaitingMask.showWaiting(false, Waiting_Show_Type.LOAD_RES);
        });
    }

    static showRewards(awards, finishCallback?) {
        this.popupReward(awards, null, null, finishCallback, null, null);
    }

    static loadPopupGetRewards(titleImagePath?, callback?) {
        if (!titleImagePath) titleImagePath = Path.getPopupReward('img_gain_boradtxt01');

        ResourceLoader.loadResAndEffectArray(
            [
                { path: titleImagePath, type: cc.SpriteFrame },
                { path: Path.getPopupReward('img_gain_borad01'), type: cc.SpriteFrame },
                { path: 'prefab/common/PopupGetRewards', type: cc.Prefab },
                { path: 'prefab/common/CommonContinueNode', type: cc.Prefab }
            ],
            [
                { name: "moving_choujiang_hude", type: EffectGfxType.MovingGfx }
            ],
            () => {
                var reward: PopupGetRewards = Util.getNode('prefab/common/PopupGetRewards', PopupGetRewards);
                callback(reward);
            });
    }

    //奖励
    static LINE_ITEM_COUNT = 5  // 一行5个ICON
    static LINE_ITEM_BLACK = 45 // 物品横排间隔
    static LINE_ITEM_BLACK_V = 32 // 物品横排间隔
    static LINE_ITEM_VERTICAL_BLACK = 142;

    private _itemShowTimes;
    private _titleImagePath;
    private _finishCallback;

    private _awards;
    private _fromText;
    private _tipsText;
    private _commonContinueNode: CommonContinueNode;
    private _scrollView;
    private _clonewidgets: any[];
    private _duration;
    private _isContinue;
    private _btn;
    private _isDrawCard: boolean;
    private _touchEnable: boolean;

    constructor() {
        super();

        this._itemShowTimes = 1;
        this._titleImagePath = Path.getPopupReward('img_gain_boradtxt01');

        this.setShowFinish(false);
    }

    onLoad() {
        this.node.name = "PopupGetRewards";
        this._itemShowTimes = 1;
    }

    setCallBack(callback) {
        this._finishCallback = callback;
    }

    onClose() {
        this._finishCallback && this._finishCallback();
    }
    onExit() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_START, "PopupGetRewards");
    }

    _updateAwards(rewardParentNodes: cc.Widget, awards, isDouble?) {
        isDouble = isDouble || false;
        var itemScale = 1;
        var itemWidgets = [];
        var lineNum = Math.ceil(awards.length / PopupGetRewards.LINE_ITEM_COUNT);
        var maxCol = lineNum <= 1 && awards.length || PopupGetRewards.LINE_ITEM_COUNT;
        var commonTemSize = cc.size(0, 0);
        for (var i = 0; i < awards.length; i++) {
            var award = awards[i];
            var size = isDouble == true ? award.size * 2 : award.size;
            var itemNode: cc.Node = ComponentIconHelper.createIcon(award.type, award.value, size);
            var className = TypeConvertHelper.getTypeClass(award.type);
            var comp: CommonIconBase = itemNode.getComponent(className);
            var itemSize = cc.size(98, 98);
            if (award.type == TypeConvertHelper.TYPE_HEAD_FRAME) {
                itemScale = itemScale * 1;
            }
            comp.showDoubleTips(isDouble);
            if (award.type == TypeConvertHelper.TYPE_PET) {
                (comp as CommonPetIcon).showPetIconInitialStars();
            }
            comp.showName(true, null);
            rewardParentNodes.node.addChild(itemNode);
            var currLineNum = Math.ceil((i + 1) / PopupGetRewards.LINE_ITEM_COUNT);
            var currCol = i + 1 - (currLineNum - 1) * PopupGetRewards.LINE_ITEM_COUNT;
            currLineNum = lineNum - currLineNum + 1;
            var x = (currCol - 1) * itemSize.width * itemScale + (currCol - 1) * PopupGetRewards.LINE_ITEM_BLACK;
            var y = (currLineNum - 1) * itemSize.height * itemScale + (currLineNum - 1) * PopupGetRewards.LINE_ITEM_BLACK_V + 22;
            if(awards.length==1)
            {
                itemNode.x = 0;
                itemNode.y = 0;
            }
            else
            {
                itemNode.x = (x + itemSize.width * itemScale * 0.5);
                itemNode.y = (y + itemSize.height * itemScale * 0.5);
            }
            // itemNode.y = (y + itemSize.height * itemScale * 0.5);
            itemWidgets.push(itemNode);
            commonTemSize = itemSize;
        }
        var totalW = maxCol * commonTemSize.width * itemScale + Math.max(maxCol - 1, 0) * PopupGetRewards.LINE_ITEM_BLACK;
        var totalH = lineNum * commonTemSize.height * itemScale + Math.max(lineNum - 1, 0) * PopupGetRewards.LINE_ITEM_BLACK_V;
        if (lineNum > 0) {
            totalH = totalH + 22;
        }
        rewardParentNodes.node.setContentSize(totalW, totalH);
        return itemWidgets;
    }
    // 自动合并相同的道具
    static showRewardsWithAutoMerge(awards: any[], finishCallback?) {
        var tempAwards = [];
        var keyMap = {};
        for (let k = 0; k < awards.length; k++) {
            var v = awards[k];
            var key = v.type + '_' + v.value;
            var temp = keyMap[key];
            if (!temp) {
                temp = {};
                temp.type = v.type;
                temp.value = v.value;
                temp.size = 0;
                keyMap[key] = temp;
            }
            temp.size = temp.size + v.size;
        }
        for (let k in keyMap) {
            tempAwards.push(keyMap[k]);
        }
        this.popupReward(tempAwards, null, null, finishCallback, null, null);
    }

    _createTouchLayer(isDrawCard) {
        // var numAlpha = 0.75;
        // var layerColor = cc.LayerColor.create(cc.c4b(0, 0, 0, 255 * numAlpha));
        // layerColor.setIgnoreAnchorPointForPosition(false);
        // layerColor.setTouchMode(cc.TOUCHES_ONE_BY_ONE);
        // layerColor.setTouchEnabled(true);
        // layerColor.registerScriptTouchHandler(function (event, x, y) {
        //     if (event == 'began') {
        //         return true;
        //     } else if (event == 'ended') {
        //         if (this.isShowFinish() == true) {
        //             if (isDrawCard) {
        //                 G_SignalManager.dispatch(SignalConst.EVENT_GACHA_GOLDENHERO_DRAWCLOSE);
        //             }
        //             this.close();
        //         }
        //     }
        // });
        // this.addChild(layerColor);

        // this._layerColor = layerColor;
        this._isDrawCard = isDrawCard;
        this._touchEnable = true;
        var resourceNode: cc.Node = this.node.getChildByName('_resourceNode');
        resourceNode.on(cc.Node.EventType.TOUCH_END, this.onTouchClose, this);
    }
    onTouchClose() {
        if (!this._touchEnable || !this.isShowFinish()) {
            return;
        }
        if (this._commonContinueNode && !this._commonContinueNode.node.active) return;
        if (this._isDrawCard) {
            G_SignalManager.dispatch(SignalConst.EVENT_GACHA_GOLDENHERO_DRAWCLOSE);
        }
        this.close();
    }
    //-==========================
    //-获取奖励弹窗，但以类似提示的样式弹出
    //-@awards 奖励列表
    //-@text01 获得来源提示文字
    //-@text02 tips文字
    //-@finishCallback 结束回调
    //-==========================
    show(awards, fromText, tipsText, finishCallback, titleImagePath?,isDouble?) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_POPUP_REARD);
        if (awards.length == 0) {
            finishCallback && finishCallback();
            return;
        }
        this._finishCallback = finishCallback;
        awards = DropHelper.sortDropList(unpack(awards));
        this._awards = awards;
        this._fromText = fromText;
        this._tipsText = tipsText;
        if (titleImagePath) {
            this._titleImagePath = titleImagePath;
        }
        this._createTouchLayer(null);
        this._createEffectNode();

        this._commonContinueNode = Util.getNode('prefab/common/CommonContinueNode', CommonContinueNode);
        this._commonContinueNode.node.setPosition(0, -289);
        this._commonContinueNode.node.active = false;
        this.node.addChild(this._commonContinueNode.node);

        var widget: cc.Widget = this._createRewardWidget();
        var itemWidgets = this._updateAwards(widget, awards, isDouble);
        var duration = AnimationConst.FRAME_RATE * 9;
        if (awards.length > PopupGetRewards.LINE_ITEM_COUNT) {
            this._scrollView = this._createScrollView(widget.node);
            this._scrollView.node.active = false;
        } else {
            if(awards.length==1)
            {
                widget.node.setPosition(0,30);
            }
            else
            {
                widget.node.setPosition(-widget.node.width / 2, -20);
            }
            this.node.addChild(widget.node);
            for (var k in itemWidgets) {
                var node = itemWidgets[k];
                var arr = this.itemAppearAction(duration, false, null);
                var action = arr[0];
                var time = arr[1] as number;
                duration += time;
                node.active = true;
                node.opacity = 0;
                node.runAction(action);
            }
        }
        var delayAction = cc.delayTime(duration);
        var callAction = cc.callFunc(() => {
            if (this._scrollView) {
                this._scrollView.node.active = true;
            }
            this.setShowFinish(true);
            this.signal.dispatch('anim');
        });
        this.open();
        this.setShowFinish(false);
        this.node.runAction(cc.sequence(delayAction, callAction));
    }
    //-==========================
    //-获取奖励弹窗，但以类似提示的样式弹出
    //-@awards 奖励列表
    //-@text01 获得来源提示文字
    //-@text02 tips文字
    //-@finishCallback 结束回调
    //-==========================
    showDrawCard(awards, fromText?, tipsText?, finishCallback?, titleImagePath?) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_POPUP_REARD);
        if (awards.length == 0) {
            finishCallback && finishCallback();
            return;
        }
        if (finishCallback) {
            this._finishCallback = finishCallback;
        }
        this._fromText = fromText;
        this._tipsText = tipsText;
        if (titleImagePath) {
            this._titleImagePath = titleImagePath;
        }
        this._createTouchLayer(true);
        // this._layerColor.setTouchEnabled(false);
        this._touchEnable = false;
        var resPath: string = Path.getPopupReward('img_gain_borad01');
        var bgSp: cc.Sprite = Util.newSprite(resPath);
        bgSp.node.y = 35;
        this.node.addChild(bgSp.node);

        this._commonContinueNode = Util.getNode('prefab/common/CommonContinueNode', CommonContinueNode);
        this._commonContinueNode.node.setPosition(0, -289);
        this.node.addChild(this._commonContinueNode.node);

        var widget: cc.Widget = this._createRewardWidget();
        var itemWidgets = this._updateAwards(widget, awards);
        var duration = AnimationConst.FRAME_RATE * 9;
        this.node.addChild(widget.node);

        if (awards.length > PopupGetRewards.LINE_ITEM_COUNT) {
            var contentSize = widget.node.getContentSize();
            widget.node.setAnchorPoint(0.5, 0);
            widget.node.setPosition(-contentSize.width / 2, -90);
            this._clonewidgets = itemWidgets;
            this._duration = duration;
            this._isContinue = true;
            for (var k in itemWidgets) {
                var node = itemWidgets[k];
                node.active = true;
                node.opacity = 0;
            }
        } else {
            widget.node.setPosition(0, 45);
            this._clonewidgets = itemWidgets;
            this._duration = duration;
            this._isContinue = true;
            for (k in itemWidgets) {
                var node = itemWidgets[k];
                node.active = true;
                node.opacity = 0;
            }
        }
        var delayAction = cc.delayTime(this._duration);
        var callAction = cc.callFunc(() => {
            if (this._scrollView) {
                this._scrollView.node.active = true;
            }
            this.setShowFinish(true);
            this.signal.dispatch('anim');
        }, this);
        this.node.runAction(cc.sequence(delayAction, callAction));
        this.open();
        this._loopShowNode();
    }
    _showNode(item, isHero, runCallBack) {
        isHero = isHero || false;
        var [action, time] = this.itemAppearAction(this._duration, isHero, function () {
            if (this._isContinue) {
                this._loopShowNode();
            } else {
                if (runCallBack) {
                    runCallBack();
                }
            }
        }.bind(this));
        this._duration = this._duration + 0.01;
        item.runAction(action);
    }
    _loopShowNode() {
        // function finishCallback() {
        //     this._isContinue = true;
        // }
        if (this._clonewidgets && this._clonewidgets.length > 0) {
            var node = this._clonewidgets[0].getComponent(CommonIconBase) as CommonIconBase;
            var itemParams = node.getItemParams();
            if (itemParams.type == 1) {
                this._isContinue = false;
                this._showNode(node.node, true, () => {
                    this._clonewidgets.shift();
                    console.warn('todo GoldHeroShow.open');
                    let callback = function () {
                        this._isContinue = true;
                        this._loopShowNode();
                    }.bind(this);
                    PopupBase.loadCommonPrefab('GoldHeroShow', (popup: GoldHeroShow) => {
                        popup.ctor(itemParams.value, callback);
                        popup.open();
                    });
                });
            } else {
                this._showNode(node.node, null, null);
                this._clonewidgets.shift();
            }
        } else {
            // this._layerColor.setTouchEnabled(true);
            this._touchEnable = true;
        }
    }
    isAnimEnd() {
        return this.isShowFinish();
    }
    //出现动画
    itemAppearAction(delayTime, isHeroIcon, finishCallback) {
        var time = AnimationConst.FRAME_RATE * 3;
        return [
            cc.sequence(cc.delayTime(delayTime), cc.scaleTo(0, 0.7), cc.show(), cc.callFunc(() => {
                if (this._itemShowTimes > 10) {
                    return;
                }
                G_AudioManager.playSoundWithId(AudioConst.SOUND_GET_ONE_REARD);
                this._itemShowTimes = this._itemShowTimes + 1;
            }, this), cc.spawn(cc.scaleTo(time, 1), cc.fadeIn(time)), cc.delayTime(isHeroIcon && 0.3 || 0), cc.callFunc(() => {
                finishCallback && finishCallback();
            })),
            time
        ];
    }
    _createActionNode(effect) {
        if (effect == 'txt') {
            var txtSp = Util.newSprite(this._titleImagePath);
            return txtSp.node;
        } else if (effect == 'all_bg') {
            var bgSp = Util.newSprite(Path.getPopupReward('img_gain_borad01'));
            return bgSp.node;
        } else if (effect == 'button') {
            this._commonContinueNode.node.active = true;
            return new cc.Node();
        } else if (effect == 'txt_meirilibao') {
            if (this._fromText) {
                var labelGetFrom = this._createLabel(this._fromText, 20, Path.getCommonFont(), Colors.SYSTEM_TIP);
                UIHelper.enableOutline(labelGetFrom, Colors.SYSTEM_TIP_OUTLINE, 2);
                return labelGetFrom.node;
            } else {
                return new cc.Node();
            }
        } else if (effect == 'txt_shuoming') {
            if (this._tipsText) {
                var labelGetFrom = this._createLabel(this._tipsText, 20, Path.getCommonFont(), Colors.BRIGHT_BG_TWO);
                return labelGetFrom.node;
            } else {
                return new cc.Node();
            }
        }
    }
    _createEffectNode() {
        var rootNode: cc.Node = new cc.Node();
        this.node.addChild(rootNode);
        G_EffectGfxMgr.createPlayMovingGfx(rootNode, 'moving_choujiang_hude', this._createActionNode.bind(this), (event) => {
            if (event == 'finish') {
            }
        }, false);
    }

    _createScrollView(content: cc.Node) {
        var node: cc.Node = new cc.Node("ScrollView");
        node.setAnchorPoint(0, 0.5);
        node.setContentSize(content.width + 40, Math.min(271, content.height));
        node.addChild(content);
        node.setPosition(-content.width / 2, 20);
        content.setPosition(20, node.height / 2 - content.height)
        this.node.addChild(node);
        var scrollView: cc.ScrollView = node.addComponent(cc.ScrollView);
        scrollView.vertical = true;
        scrollView.horizontal = false;
        scrollView.inertia = true;
        scrollView.elastic = true;
        scrollView.content = content;
        var mask: cc.Mask = node.addComponent(cc.Mask);
        // mask.type = cc.Mask.Type.RECT;
        return scrollView;
    }

    _createRewardWidget() {
        var node = new cc.Node("RewardWidget");
        node.setAnchorPoint(0, 0);
        return node.addComponent(cc.Widget);
    }

    _createLabel(value, fontSize, font, color = null) {
        var label: cc.Label = UIHelper.createLabel().getComponent(cc.Label);
        label.fontSize = fontSize;
        if (color) label.node.color = color;
        label.string = value;
        return label;
    }

}