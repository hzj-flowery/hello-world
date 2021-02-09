import { CakeActivityConst } from "../../../const/CakeActivityConst";
import { CakeActivityDataHelper } from "../../../utils/data/CakeActivityDataHelper";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { G_EffectGfxMgr } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
import { Lang } from "../../../lang/Lang";
import { TextHelper } from "../../../utils/TextHelper";
import CommonUI from "../../../ui/component/CommonUI";

var RES_INFO = {
    [CakeActivityConst.MATERIAL_TYPE_1]: {
        bgRes: 'img_special_03',
        outlineColor: new cc.Color(0,0,0, 255)
    },
    [CakeActivityConst.MATERIAL_TYPE_2]: {
        bgRes: 'img_special_04',
        outlineColor: new cc.Color(0,0,0, 255)
    },
    [CakeActivityConst.MATERIAL_TYPE_3]: {
        bgRes: 'img_special_05',
        outlineColor: new cc.Color(0,0, 0, 255)
    }
};
var POS_INFO = {
    [5]: {
        posY: -30,
        zOrder: 50
    },
    [4]: {
        posY: -105,
        zOrder: 40
    },
    [3]: {
        posY: -180,
        zOrder: 30
    },
    [2]: {
        posY: -255,
        zOrder: 20
    },
    [1]: {
        posY: -330,
        zOrder: 10
    }
};

const { ccclass, property } = cc._decorator;

@ccclass
export default class CakeGivePushNode extends cc.Component {

    public static readonly RES_INFO = {
        [CakeActivityConst.MATERIAL_TYPE_1]: {
            bgRes: 'img_special_03',
            outlineColor: new cc.Color(0,0,0, 255),
        },
        [CakeActivityConst.MATERIAL_TYPE_2]: {
            bgRes: 'img_special_04',
            outlineColor: new cc.Color(0,0,0, 255),
        },
        [CakeActivityConst.MATERIAL_TYPE_3]: {
            bgRes: 'img_special_05',
            outlineColor: new cc.Color(0,0,0, 255),
        }
    };
    _index: any;
    _onReset: any;
    _onDoGive: any;
    _isPlaying: boolean;
    _data: any;
    _showCount: number;
    _itemId: number;
    _realCount: number;
    _schedulerCheck: any;
    _schedulerSend: any;
    _posY: number;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDesc: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    private _lastPos;
    private _curPos;
    private _type;
    private _playTime;
    initData(pos, onReset, onDoGive) {
        this._lastPos = pos;
        this._curPos = pos;
        this._onReset = onReset;
        this._onDoGive = onDoGive;
        this._isPlaying = false;
        this._data = null;
        this._itemId = 0;
        this._type = 0;
        this._playTime = 0;
        this._showCount = 0;
        this._realCount = 0;
        this._schedulerCheck = null;
        this._schedulerSend = null;
        this._imageBg.sizeMode = cc.Sprite.SizeMode.RAW;
    }
    onExit() {
        this._removeCheckSchedule();
        this._removeSendSchedule();
        this.forceReset();
    }
    _updateUI(data) {
        var serverName = CakeActivityDataHelper.formatServerName(data.getContentDesWithKey('sname'), null);
        var name = data.getContentDesWithKey('uname');
        this._itemId = parseInt(data.getContentDesWithKey('itemid1'));
        this._showCount = parseInt(data.getContentDesWithKey('itemnum'));
        this._realCount = parseInt(data.getContentDesWithKey('itemnum'));
        var type = CakeActivityConst.getMaterialTypeWithId(this._itemId);
        var info = CakeGivePushNode.RES_INFO[type];
        UIHelper.loadTexture(this._imageBg, Path.getAnniversaryImg(info.bgRes));
        var itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, this._itemId);
        var effectName = info.effect;
        this._nodeEffect.removeAllChildren();
        G_EffectGfxMgr.createPlayGfx(this._nodeEffect, effectName);
        this._textName.string = (serverName + (' ' + name));
        this._textDesc.string = (Lang.get('cake_activity_give_item_des', { name: itemParam.name }));
        UIHelper.enableOutline(this._textCount, info.outlineColor, 1);
        this._textCount.string = ('x' + this._showCount);
    }
    updateUI(data) {
        this._data = data;
        var serverName = TextHelper.cutText(data.getContentDesWithKey('sname'));
        var name = data.getContentDesWithKey('uname');
        this._itemId = parseInt(data.getContentDesWithKey('itemid1'));
        this._showCount = parseInt(data.getContentDesWithKey('itemnum'));
        this._realCount = parseInt(data.getContentDesWithKey('itemnum'));
        this._type = CakeActivityDataHelper.getMaterialTypeWithId(this._itemId);
        this._playTime = CakeActivityDataHelper.getBulletPlayTime(this._type);
        var info = RES_INFO[this._type];
        this._imageBg.node.addComponent(CommonUI).loadTexture(Path.getAnniversaryImg(info.bgRes));
        var itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, this._itemId);
        var effectName = CakeActivityDataHelper.getMaterialMoving(this._type);
        this._nodeEffect.removeAllChildren();
        G_EffectGfxMgr.createPlayGfx(this._nodeEffect, effectName);
        this._textName.string = (serverName + (' ' + name));
        this._textDesc.string = (Lang.get('cake_activity_give_item_des', { name: itemParam.name }));
        UIHelper.enableOutline(this._textCount,info.outlineColor, 1)
        this._textCount.string = ('x' + this._showCount);
    }

    addCount(count) {
        this._showCount = this._showCount + count;
        this._realCount = this._realCount + count;
        this._textCount.string = ('x' + this._showCount);
        // this._textCount.doScaleAnimation();
        this._checkUpdateCount();
        this._checkSend();
    }
    playStart() {
        this._isPlaying = true;
        var posY = this.node.y;
        
        var easeBounceOut = cc.easeBounceOut();
        // easeBounceOut.setTag(123);
        var moveTo = cc.moveTo(0.2, cc.v2(260, posY)).easing(easeBounceOut);
        this.node.runAction(moveTo);
        this._checkUpdateCount();
        this._checkSend();
    }

    _removeCheckSchedule() {
        this.unschedule(this._playEnd);
    }
    _checkUpdateCount() {
        this._removeCheckSchedule();
        this.schedule(this._playEnd,this._playTime);
    }
    _removeSendSchedule() {
        this.unschedule(this._sendMatrical);
    }
    _checkSend() {
        this._removeSendSchedule();
        this.scheduleOnce(this._sendMatrical, 0.5);
    }
    _playEnd() {
        this._reset();
        if (this._onReset) {
            this._onReset();
        }
        
    }
    _sendMatrical() {
        var item = null;
        if (this._data && this._data.isFake() && this._realCount > 0) {
            item = {
                id: this._itemId,
                num: this._realCount
            };
        }
        if (this._onDoGive) {
            this._onDoGive(item);
        }
        this._realCount = 0;
    }
    _reset() {
        this.node.x = (0);
        this._isPlaying = false;
        this._data = null;
    }
    isEmpty() {
        return !this._data;
    }
    isPlaying() {
        return this._isPlaying;
    }
    isFake() {
        if (this._data && this._data.isFake()) {
            return true;
        } else {
            return false;
        }
    }
    isSameNode(data) {
        if (this._data) {
            if (this._data.getNotice_id() == CakeActivityConst.NOTICE_TYPE_COMMON && this._data.getNotice_id() == data.getNotice_id() && this._data.getContentDesWithKey('sname') == data.getContentDesWithKey('sname') && this._data.getContentDesWithKey('itemid1') == data.getContentDesWithKey('itemid1') && this._data.getContentDesWithKey('uol') == data.getContentDesWithKey('uol') && this._data.getContentDesWithKey('sgname') == data.getContentDesWithKey('sgname') && this._data.getContentDesWithKey('uname') == data.getContentDesWithKey('uname') && this._data.getContentDesWithKey('tgname') == data.getContentDesWithKey('tgname')) {
                return true;
            }
        }
        return false;
    }
    forceReset() {
        if (this._realCount > 0) {
            this._sendMatrical();
        }
        this._reset();
    }

    updatePos(pos) {
        this._lastPos = this._curPos;
        this._curPos = pos;
    }
    getPos() {
        return this._curPos;
    }
    moveToPos() {
        var pos = this._curPos;
        var posY = this.node.y;
        if (this.node.getActionByTag(123)) {
            this.node.stopAllActions();
            this.node.setPosition(cc.v2(260, posY));
        }
        if (this.node.getActionByTag(456)) {
            this.node.stopAllActions();
        }
        var posX = this.node.x;
        var tarPosY = POS_INFO[pos].posY;
        var zOrder = POS_INFO[pos].zOrder;
        this.node.zIndex = (zOrder);
        if (this.isPlaying()) {
            var moveTo = cc.moveTo(0.2, cc.v2(posX, tarPosY));
            moveTo.setTag(456);
            this.node.runAction(moveTo);
        } else {
            this.node.setPosition(cc.v2(posX, tarPosY));
        }
        this._checkUpdateCount();
    }
    getType() {
        return this._type;
    }
    getShowCount() {
        return this._showCount;
    }
    isPosChange() {
        return this._lastPos != this._curPos;
    }
    

}