const { ccclass, property } = cc._decorator;

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'
import ViewBase from '../../ViewBase';
import { Path } from '../../../utils/Path';
import { GuildAnswerConst } from '../../../const/GuildAnswerConst';
import ExaminationIndex from './ExaminationIndex';
import { G_SignalManager, G_UserData, G_Prompt, G_ServerTime, G_EffectGfxMgr } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import { GuildAnswerHelper } from './GuildAnswerHelper';
import UIActionHelper from '../../../utils/UIActionHelper';

@ccclass
export default class AnswerClientNotStart extends ViewBase {

    @property({
        type: cc.Label,
        visible: true
    })
    _timeDes1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _time1: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _alreadyApply1: cc.Sprite = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _btnChange1: CommonButtonLevel1Normal = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _timeDes2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _time2: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _alreadyApply2: cc.Sprite = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _btnChange2: CommonButtonLevel1Normal = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _timeDes3: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _time3: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _alreadyApply3: cc.Sprite = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _btnChange3: CommonButtonLevel1Normal = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _richtextTip: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _tip2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _countDownTime: cc.Label = null;
    _loadingBarProgress: any;
    _questionContent: any;
    _questionIndexText: any;
    _questionIndexParent: any;
    _questionOptionsParent: any;
    _curSelectAnswerOptionIndex: any;
    _curBeginTime: number;
    _curEndTime: number;
    _questions: any;
    _countDownCallback: any;
    _indexs: any[];
    _options: {};
    _respondTime: any;
    _awardTime: any;
    _curIndex: any;
    _isAwardTime: any;
    _curQuestion: any;
    _curSelectOption: any;
    _answerSignal: any;
    _awardTimeLabel: any;
    _countDownParentNode: any;
    _effectTipsNode: cc.Node;


    initData(questions, countDownCallback) {
        this._loadingBarProgress = null;
        this._questionContent = null;
        this._questionIndexText = null;
        this._questionIndexParent = null;
        this._questionOptionsParent = null;
        this._curSelectAnswerOptionIndex = null;
        this._curBeginTime = 0;
        this._curEndTime = 0;
        this._questions = questions;
        this._countDownCallback = countDownCallback;
    }
    onCreate() {
        var renderLabel = this._questionContent.getVirtualRenderer();
        renderLabel.setWidth(400);
        renderLabel.setLineSpacing(3);
        this._indexs = [];
        var indexGap = 60;
        for (var i = 1; i <= GuildAnswerConst.QUESTION_NUM; i++) {
            // var indexNode = new ExaminationIndex(i);
            // indexNode.setPositionX((i - 1) * indexGap);
            // this._questionIndexParent.addChild(indexNode);
            // this._indexs[i] = indexNode;
        }
        this._options = {};
        var optionXGap = 300;
        var optionYGap = 80;
        // for (var i = 1; i <= 4; i++) {
        //     var optionNode = new ExaminationOption(i, handler(this, this._onSelectOption));
        //     optionNode.setPosition(cc.v2((i - 1) % 2 * optionXGap, -math.floor((i - 1) / 2) * optionYGap));
        //     this._questionOptionsParent.addChild(optionNode);
        //     this._options[i] = optionNode;
        // }
        // this._respondTime = GuildAnswerHelper.getRespondTime();
        // this._awardTime = GuildAnswerHelper.getAwardTime();
        // this._curIndex = GuildAnswerHelper.getCurQuestionIndex(this._questions), this._isAwardTime = null;
        // this._curQuestion = this._questions[this._curIndex];
        // if (!this._curQuestion) {
        //     //assert(false, 'self._curQuestion == nil');
        //     return;
        // }
        this._curSelectOption = this._curQuestion.getSelectOption();
        this._updateQuestionContent();
        this._startCountDown();
    }
    onEnter() {
        this._answerSignal = G_SignalManager.add(SignalConst.EVENT_ANSWER_GUILD_QUESTION_SUCCESS, handler(this, this._onEventAnswerResult));
    }
    onExit() {
        this._answerSignal.remove();
        this._answerSignal = null;
    }
    _updateQuestionContent() {
        this._updateQuestionsIndex();
        this._updateOptions();
    }
    _updateQuestionsIndex() {
        for (var i = 1; i <= GuildAnswerConst.QUESTION_NUM; i++) {
            var questionData = this._questions[i];
            var isRight = questionData.getRightAnswer() == questionData.getSelectOption();
            var isAnswer = questionData.getSelectOption() != 0;
            this._indexs[i].updateUI(this._curIndex, isRight, isAnswer);
            if (this._curIndex == i) {
                this._questionIndexText.setString(Lang.get('lang_guild_answer_start_question_index', { num: i }));
                this._questionContent.setString(questionData.getQuestionDes());
            }
        }
    }
    _updateOptions() {
        if (!this._curQuestion) {
            return;
        }
        var options = this._curQuestion.getOptions();
        for (var j = 1; j <= 4; j++) {
            var isNeedShowRight = this._isAwardTime;
            var isSelect = this._curQuestion.getSelectOption() == j;
            var isRight = this._curQuestion.getRightAnswer() == j;
            this._options[j].updateUI(options[j], isNeedShowRight, isSelect, isRight);
        }
    }
    _updateOptionByIndex(index) {
        if (!this._curQuestion) {
            return;
        }
        var options = this._curQuestion.getOptions();
        for (var j = 1; j <= 4; j++) {
            if (j == index) {
                var isSelect = this._curQuestion.getSelectOption() == j;
                var isRight = this._curQuestion.getRightAnswer() == j;
                this._options[j].updateUI(options[j], true, isSelect, isRight);
                break;
            }
        }
    }
    _onSelectOption(index) {
        if (this._isAwardTime) {
            return;
        }
        if (!this._curQuestion) {
            //assert(false, 'self._curQuestion  == nil ');
            return;
        }
        if (this._curSelectAnswerOptionIndex) {
            return;
        }
        var isInGuild = G_UserData.getGuild().isInGuild();
        if (!isInGuild) {
            G_Prompt.showTip(Lang.get('lang_guild_answer_no_guild'));
            return;
        }
        G_UserData.getGuildAnswer().c2sAnswerGuildQuestion(this._curQuestion.getQuestionNo(), index);
    }
    _setLoadingBarProgress(curTime) {
        if (this._isAwardTime) {
            this._loadingBarProgress.setPercent(0);
        } else {
            var percent = 100 * (this._curEndTime - curTime) / (this._curEndTime - this._curBeginTime);
            if (percent < 0) {
                percent = 0;
            }
            this._loadingBarProgress.setPercent(percent);
        }
    }
    _startCountDown() {
        if (!this._curQuestion) {
            return;
        }
        this._countDownTime.node.stopAllActions();
        this._curBeginTime = GuildAnswerHelper.getQuestionBeginTime(this._curQuestion);
        if (this._isAwardTime) {
            this._awardTimeLabel.setVisible(false);
            this._countDownParentNode.setVisible(false);
            this._curBeginTime = this._curBeginTime + this._respondTime;
            this._curEndTime = this._curBeginTime + this._awardTime;
        } else {
            this._countDownParentNode.setVisible(true);
            this._awardTimeLabel.setVisible(false);
            this._curEndTime = this._curBeginTime + this._respondTime;
        }
        var curTime = G_ServerTime.getTime();
        var action = UIActionHelper.createUpdateAction(function () {
            var curTime2 = G_ServerTime.getTime();
            var diffTime = this._curEndTime - curTime2;
            if (diffTime < 0) {
                diffTime = 0;
            }
            this._countDownTime.setString(diffTime);
            this._setLoadingBarProgress(curTime2);
            if (curTime2 >= this._curEndTime) {
                this._next();
            }
        }, 0.02);
        this._countDownTime.string = (this._curEndTime - curTime) + "";
        this._setLoadingBarProgress(curTime);
        this._countDownTime.node.runAction(action);
    }
    _addScorePromptTips(questionData, callback) {
        if (questionData) {
            if (questionData.getSelectOption() != 0) {
                if (questionData.getRightAnswer() == questionData.getSelectOption()) {
                    var score = GuildAnswerHelper.getRightPoint();
                    var str = Lang.get('lang_guild_answer_start_right_score_add', { num: score });
                    this._showTips(str, true, callback);
                } else {
                    var score = GuildAnswerHelper.getWrongPoint();
                    var str = Lang.get('lang_guild_answer_start_wrong_score_add', { num: score });
                    this._showTips(str, false, callback);
                }
            } else {
                var str = Lang.get('lang_guild_answer_start_not_answer');
                this._showTips(str, false, callback);
            }
        } else {
            callback();
        }
    }
    _next() {
        this._curIndex = GuildAnswerHelper.getCurQuestionIndex(this._questions), this._isAwardTime = null;
        if (!this._curIndex || this._curIndex > this._questions.length) {
            this._countDownTime.node.stopAllActions();
            if (this._countDownCallback) {
                this._countDownCallback();
            }
            return;
        }
        if (!this._isAwardTime) {
            this._curSelectAnswerOptionIndex = null;
        }
        this._curQuestion = this._questions[this._curIndex];
        this._updateQuestionContent();
        this._startCountDown();
    }
    _onEventAnswerResult(id, message) {
        var question_no = message['question_no'];
        if (question_no) {
            var questionData = this._questions[question_no];
            if (!questionData) {
                //assert(false, 'questionData == nil');
                return;
            }
            var answer_id = message['answer_id'];
            var awards = message['reward'] || {};
            if (answer_id) {
                questionData.setSelectOption(answer_id);
                this._curSelectAnswerOptionIndex = answer_id;
                this._addScorePromptTips(questionData, function () {
                    G_Prompt.showAwards(awards);
                });
                if (questionData.getQuestionNo() == this._curQuestion.getQuestionNo()) {
                    this._updateOptionByIndex(answer_id);
                }
            }
        }
    }
    _showTips(str, isRight, callback) {
        function eventFunction(event) {
            if (event == 'finish') {
                if (callback) {
                    callback();
                }
            }
        }
        var movingName = 'moving_juntuandati_zhengque';
        if (!isRight) {
            movingName = 'moving_juntuandati_cuowu';
        }
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._effectTipsNode, movingName, null, eventFunction, true);
    }

}