const {ccclass, property} = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { DataConst } from '../../../const/DataConst';
import { SignalConst } from '../../../const/SignalConst';
import { Colors, G_AudioManager, G_EffectGfxMgr, G_SignalManager } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonContinueNode from '../../../ui/component/CommonContinueNode';
import PopupBase from '../../../ui/PopupBase';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class PopupRankUpReward extends PopupBase {

   @property({
       type: CommonContinueNode,
       visible: true
   })
   _fileNodeContinnue: CommonContinueNode = null;
   
   private _onCloseCall:any;
   private _isAction:boolean;
   private _oldRank:number;
   private _newRank:number;
   private _reward:number;

   preloadResList = [
       {path:Path.getUICommon('img_com_arrow06'),type:cc.SpriteFrame}
   ];


   setInitData(rankUpInfo, onCloseCall) {
  //assert((rankUpInfo, 'rankUpInfo can not be nil');
    this._oldRank = rankUpInfo.oldRank;
    this._newRank = rankUpInfo.newRank;
    this._reward = rankUpInfo.award;
    this._onCloseCall = onCloseCall;
    this._isAction = true;
    this.node.name = ('PopupRankUpReward');
}
onCreate() {
    this._isClickOtherClose = true;
    this._fileNodeContinnue.node.active = (false);
}
onEnter() {
    G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN);
    G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'ArenaView PopupRankUpReward');
    this.play();
    G_AudioManager.playSoundWithId(AudioConst.SOUND_ARENA_RANK_UP);
    this._isAction = true;
}
onClose() {
    G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
    G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END);
    if (this._onCloseCall) {
        this._onCloseCall();
    }
}
showUI() {
    this.open();
}
onBtnCancel() {
    this.close();
}
_createActionNode(effect) {
    var effectFunction = function (effect) {
        if (effect == 'shuoming_1') {
            return this._createShuoMing1();
        } else if (effect == 'shuoming_2') {
            var reward = this._reward || {
                type: TypeConvertHelper.TYPE_RESOURCE,
                value: DataConst.RES_DIAMOND,
                size: 1000
            };
            return this._createShuoMing2(reward);
        }
    }.bind(this)
    var eventFunction = function (event) {
    }
    if (effect == 'paiming_shuzi_1') {
        if (this._oldRank == 0) {
            var node = this._createNum1(Lang.get('arena_rank_zero'));
            var label = node.getChildByName('label1');
            if(!label)
            {
                cc.error("var label = node.getChildByName('label1')---------");
            }
            else
            {
                label.setPosition(-35, 0);
            }
            return node;
        }
        return this._createNum1(this._oldRank);
    }
    else if(effect == "paiming_shuzi_2")
	{
        return this._createNum2(this._newRank);
    } 
    else if (effect == 'moving_paiming_shuoming') {
        var node = new cc.Node();
        var effect1 = G_EffectGfxMgr.createPlayMovingGfx(node, 'moving_paiming_shuoming', effectFunction, eventFunction, false);
        effect1.play();
        return node;
    }
}
_createNum1(num):cc.Node {
    var paramList = {
        1: {
            name: 'label1',
            text: num,
            anchorPoint: new cc.Vec2(0, 0.5),
            fontSize: 48,
            // position:cc.v2(0,-30),
            color: Colors.SYSTEM_TIP,
            outlineColor: Colors.SYSTEM_TIP_OUTLINE,
            outlineSize: 3
        }
    };
    var labelNode = UIHelper.createLabels(paramList);
    return labelNode;
}
_createNum2(num) {
    var paramList = {
        1: {
            name: 'label1',
            text: num,
            fontSize: 48,
            // position:cc.v2(0,-30),
            anchorPoint: new cc.Vec2(0, 0.5),
            color: Colors.CLASS_GREEN,
            outlineColor: Colors.CLASS_GREEN_OUTLINE,
            outlineSize: 3
        }
    };
    var labelNode = UIHelper.createLabels(paramList);
    return labelNode;
}
_createShuoMing1() {
    if (this._oldRank == 0) {
        var node = new cc.Node();
        return node;
    }
    var addRank = this._oldRank - this._newRank;
    var paramList = {
        1: {
            type: 'label',
            text: Lang.get('arena_reward_dlg1'),
            fontSize: 22,
            color: Colors.SYSTEM_TIP,
            outlineColor: Colors.SYSTEM_TIP_OUTLINE,
            anchorPoint: new cc.Vec2(0, 0)
        },
        2: {
            type: 'image',
            size:new cc.Size(50,20),
            anchorPoint: new cc.Vec2(0, 0),
            texture: Path.getUICommon('img_com_arrow06')
        },
        3: {
            type: 'label',
            text: Lang.get('arena_reward_dlg3', { rank: addRank }),
            fontSize: 22,
            anchorPoint: new cc.Vec2(0, 0),
            color: Colors.CLASS_GREEN
        }
    };
    var node = UIHelper.createRichItems(paramList, true);
    return node;
}
_createShuoMing2(reward) {
    var itemParams = TypeConvertHelper.convert(reward.type, reward.value, reward.size);
    var paramList = {
        1: {
            type: 'label',
            text: Lang.get('arena_reward_dlg2'),
            fontSize: 22,
            color: Colors.SYSTEM_TIP,
            outlineColor: Colors.SYSTEM_TIP_OUTLINE,
            anchorPoint: new cc.Vec2(0, 0)
        },
        2: {
            type: 'image',
            anchorPoint: new cc.Vec2(0, 0),
            size:new cc.Size(50,20),
            texture: itemParams.res_mini
        },
        3: {
            type: 'label',
            name: 'res1',
            text: itemParams.size,
            fontSize: 22,
            anchorPoint: new cc.Vec2(0, 0),
            color: Colors.DARK_BG_ONE
        }
    };
    var node = UIHelper.createRichItems(paramList, true);
    var resWidget = node.getChildByName('res1');
    resWidget.x = (resWidget.x + 3);
    return node;
}
public play() {
    var effectFunction = function (effect) {
        return this._createActionNode(effect);
    }.bind(this)
    var eventFunction = function (event) {
        if (event == 'finish') {
            this._isAction = false;
            this._fileNodeContinnue.node.active = (true);
        }
    }.bind(this)
    var effect = G_EffectGfxMgr.createPlayMovingGfx(this.getResourceNode(), 'moving_paiming', effectFunction, eventFunction, false);
    var size = this.getResourceNode().getContentSize();
    effect.node.setPosition(0, 0);
}
}