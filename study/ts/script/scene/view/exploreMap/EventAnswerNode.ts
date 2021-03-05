import { assert } from "../../../utils/GlobleFunc";
import { G_ServerTime, G_SignalManager, G_Prompt, G_UserData, G_ConfigLoader, G_TutorialManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { Util } from "../../../utils/Util";
import EventAnswerCell from "./EventAnswerCell";
import { Lang } from "../../../lang/Lang";
import { ExploreData } from "../../../data/ExploreData";
import { ExploreEventData } from "../../../data/ExploreEventData";
import ConfigLoader from "../../../config/ConfigLoader";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EventAnswerNode extends cc.Component {

    static ANSWER_COUNT = 4;

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgDitu: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCell1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCell2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCell3: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCell4: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _rightResIcon: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _rightResSize: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _wrongResIcon: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _wrongResSize: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _talkQuestion: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _countDownNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _leftTimeLabel: cc.Label = null;

    private _eventData: ExploreEventData;
    private _configData;
    private _answerPanels: EventAnswerCell[];
    private _myAnswer: number;

    onLoad() { }

    setUp(eventData: ExploreEventData) {
        this._eventData = eventData;
        this._configData = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_ANSWER).get(eventData.getValue1());
      //assert((this._configData != null, 'can not find answer config id = ' + eventData.getValue1());

        this._answerPanels = [];
        this._myAnswer = eventData.getParam();
        this.node.name = 'EventAnswerNode';
        this._leftTimeLabel.string = G_ServerTime.getLeftSecondsString(this._eventData.getEndTime(), '00:00:00');

        this._setReward();
        this._setQuestion();
        this._setAnswer();
        if (this._myAnswer != 0) {
            this._showAnswer();
        }
        this.schedule(handler(this, this._onTimer), 0.5, cc.macro.REPEAT_FOREVER);
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
    }
    onDestroy() {
        this.unschedule(this._onTimer);
    }
    //设置答对答错奖励
    _setReward() {
        var rightItemParams = TypeConvertHelper.convert(this._configData.right_type, this._configData.right_resource);
        if (rightItemParams.res_mini) {
            UIHelper.loadTexture(this._rightResIcon,rightItemParams.res_mini);
        }
        this._rightResSize.string = this._configData.right_size || '0';
        var wrongItemParams = TypeConvertHelper.convert(this._configData.wrong_type, this._configData.wrong_resource);
        if (wrongItemParams.res_mini) {
            UIHelper.loadTexture(this._wrongResIcon,wrongItemParams.res_mini);
        }
        this._wrongResSize.string = this._configData.wrong_size || '0';
    }
    //设置问题
    _setQuestion() {
        var question = this._configData.description;
        this._talkQuestion.string = question;
    }
    //设置回答
    _setAnswer() {
        for (var i = 1; i <= EventAnswerNode.ANSWER_COUNT; i++) {
            var eventAnswerCell: EventAnswerCell = Util.getNode('prefab/exploreMap/EventAnswerCell', EventAnswerCell);
            eventAnswerCell.setUp(this._configData, i, handler(this, this._onAnswerClick));
            this['_nodeCell' + i].addChild(eventAnswerCell.node);
            this._answerPanels.push(eventAnswerCell);
        }
    }
    //点击答案
    _onAnswerClick(index) {
        var endTime = this._eventData.getEndTime();
        var curTime = G_ServerTime.getTime();
        if (curTime > endTime) {
            G_Prompt.showTip(Lang.get('explore_event_time_over'));
            return;
        }
        if (this._myAnswer != 0) return;
        this._myAnswer = index;
        G_UserData.getExplore().c2sExploreDoEvent(this._eventData.getEvent_id(), this._myAnswer);
    }
    //处理事件
    doEvent(message) {
        G_UserData.getExplore().setEventParamById(this._eventData.getEvent_id(), this._myAnswer);
        var isRight: boolean = this._showAnswer();
        if (isRight) {
            G_Prompt.showTip(Lang.get('explore_answer_right'), () => {
                this.showTipsCallBack(message);
            });
        } else {
            G_Prompt.showTip(Lang.get('explore_answer_wrong'), () => {
                this.showTipsCallBack(message);
            });
        }
    }

    private showTipsCallBack(message): void {
        if (message['awards']) {
            var rewards = [];
            for (var i in message.awards) {
                var v = message.awards[i];
                var reward = {
                    type: v.type,
                    value: v.value,
                    size: v.size
                };
                rewards.push(reward);
            }
            G_Prompt.showAwards(rewards);
            if (G_TutorialManager.isDoingStep(19) && this.node.active) {
                var delayAction = cc.delayTime(0.4);
                var callAction = cc.callFunc(this.dispatchFunc.bind(this));
                this.node.runAction(cc.sequence(delayAction, callAction));
            }
        }
    }

    private dispatchFunc() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
    }
    //显示答案
    _showAnswer() {
        for (var key in this._answerPanels) {
            var v = this._answerPanels[key];
            v.disableAnswer();
        }
        var rightAnswer = this._eventData.getValue2();
        if (this._myAnswer != rightAnswer) {
            this._answerPanels[this._myAnswer - 1].setRight(false);
            this._answerPanels[rightAnswer - 1].setRight(true);
        } else {
            this._answerPanels[this._myAnswer - 1].setRight(true);
        }
        return this._myAnswer == rightAnswer;
    }

    _onTimer() {
        this._leftTimeLabel.string = G_ServerTime.getLeftSecondsString(this._eventData.getEndTime(), '00:00:00');
    }

}