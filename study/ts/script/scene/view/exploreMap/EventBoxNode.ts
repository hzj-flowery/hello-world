const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'

import { handler } from '../../../utils/handler';
import { G_ServerTime, G_UserData, G_ConfigLoader } from '../../../init';
import { ExploreData } from '../../../data/ExploreData';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import CommonTalkNode from '../../../ui/component/CommonTalkNode';

@ccclass
export default class EventBoxNode extends cc.Component {

    @property({
        type: cc.Button,
        visible: true
    })
    _btnBox: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLight: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textAfter: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;

    @property({
        type: CommonTalkNode,
        visible: true
    })
    _talkNode: CommonTalkNode = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _reward1: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _reward2: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _reward3: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _reward4: CommonIconTemplate = null;

    private _eventData;
    private _configData;
    private _finishTime;
    private _canOpenBox: boolean;
    private _rewards: CommonIconTemplate[];

    setUp(eventData){
        this._eventData = eventData;
        this._configData = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_DISCOVER).get(eventData.getEvent_type());
        this._finishTime = this._eventData.getValue2() + this._configData.time;
        this._canOpenBox = false;

        this._setTalk();
        this._showItem();
        this._refreshBoxTime();
        this._refreshBoxState();
        this.schedule(handler(this, this._update), 0.5, cc.macro.REPEAT_FOREVER);
    }
    onLoad() { 
        this._rewards = [
            this._reward1,
            this._reward2,
            this._reward3,
            this._reward4
        ];
    }
    onDestroy() { 
        this.unschedule(this._update);
    }
    _setTalk() { 
        var textTalk: string = this._configData.description;
        this._talkNode.setText(textTalk, 300, true);
    }
    _refreshBoxTime() { 
        var str = G_ServerTime.getLeftSecondsString(this._finishTime, '');
        if (str == '-') {
            this._canOpenBox = true;
            this._imageLight.node.active = false;
            this._textAfter.node.active = false;
            this._textTime.node.active = false;
        } else {
            this._textTime.string = str;
            this._canOpenBox = false;
        }
    }
    _refreshBoxState() { 
        if (this._eventData.getParam() == 1) {
            this._btnBox.interactable = false;
        }
    }
    //更新
    _update(dt) { 
        this._refreshBoxTime();
    }
    //处理可能获得
    _showItem() { 
        for (var i = 1; i <= 4; i++) {
            this._rewards[i].initUI(this._configData['drop' + (i + '_type')], this._configData['drop' + (i + '_id')], 1);
        }
    }
    //点击宝箱事件
    _onBoxClick() { 
        if (this._canOpenBox) {
            G_UserData.getExplore().c2sExploreDoEvent(this._eventData.getEvent_id());
        }
    }
    //处理事件
    doEvent() { 
        G_UserData.getExplore().setEventParamById(this._eventData.getEvent_id(), 1);
        this._refreshBoxState();
    }

}