import ViewBase from "../../ViewBase";
import ExaminationIndex from "./ExaminationIndex";
import { GuildAnswerConst } from "../../../const/GuildAnswerConst";
import { Util } from "../../../utils/Util";
import ExaminationOption from "./ExaminationOption";
import { handler } from "../../../utils/handler";
import { GuildAnswerHelper } from "./GuildAnswerHelper";
import { G_SignalManager, G_UserData, G_Prompt, G_ServerTime, G_EffectGfxMgr } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { Lang } from "../../../lang/Lang";
import UIActionHelper from "../../../utils/UIActionHelper";
import { GuildAnswerQuestionUnitData } from "../../../data/GuildAnswerQuestionUnitData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AnswerClientStart extends ViewBase {

    @property({
        type: cc.Label,
        visible: true
    })
    _questionIndexText: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _questionContent: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _questionIndexParent: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _questionOptionsParent: cc.Node = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _loadingBarProgress: cc.ProgressBar = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _countDownParentNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _countDownTime: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _awardTimeLabel: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _effectTipsNode: cc.Node = null;
    _curSelectAnswerOptionIndex: any;
    _curBeginTime: number;
    _curEndTime: number;
    _questions: any;
    _countDownCallback: any;
    _indexs: any[];
    _options: ExaminationOption[];
    _respondTime: number;
    _awardTime: number;
    _curIndex: any;
    _curQuestion: GuildAnswerQuestionUnitData;
    _answerSignal: any;
    _answerNextSignal:any;
    _isAwardTime: any;


    initData(questions, countDownCallback) {
        this._curSelectAnswerOptionIndex = 0;
        this._curBeginTime = 0;
        this._curEndTime = 0;
        this._questions = questions;
        for (var i = 1; i <= GuildAnswerConst.QUESTION_NUM; i++) {
            var questionData = this._questions[i - 1];
            console.log("输出正确答案*--------当前题目是--",i,questionData.getRightAnswer());
        }
        this._countDownCallback = countDownCallback;
    }
    onCreate() {
        this._questionContent["_updateRenderData"](true);
        this._questionContent.node.width = (400);
        this._questionContent.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        this._questionContent.lineHeight = this._questionContent.fontSize + (3);
        this._indexs = [];
        var indexGap = 60;
        for (var i = 1; i <= GuildAnswerConst.QUESTION_NUM; i++) {
            var indexNode = Util.getNode("prefab/guildAnswer/ExaminationIndex", ExaminationIndex) as ExaminationIndex;
            indexNode.initData(i);
            this._questionIndexParent.addChild(indexNode.node);
            indexNode.node.x = ((i - 1) * indexGap);
            this._indexs[i] = indexNode;
        }
        this._options = [];
        var optionXGap = 300;
        var optionYGap = 80;
        for (var i = 1; i <= 4; i++) {
            var optionNode = Util.getNode("prefab/guildAnswer/ExaminationOption", ExaminationOption) as ExaminationOption;
            optionNode.initData(i, handler(this, this._onSelectOption));
            this._questionOptionsParent.addChild(optionNode.node);
            optionNode.node.setPosition(cc.v2((i - 1) % 2 * optionXGap, -Math.floor((i - 1) / 2) * optionYGap));
            this._options[i] = optionNode;
        }
        this._respondTime = GuildAnswerHelper.getRespondTime();
        this._awardTime = GuildAnswerHelper.getAwardTime();
        [this._curIndex, this._awardTime] = GuildAnswerHelper.getCurQuestionIndex(this._questions);
        this._curQuestion = this._questions[this._curIndex - 1];
        if (!this._curQuestion) {
            // assert(false, 'self._curQuestion == nil');
            return;
        }
        this._curSelectAnswerOptionIndex = this._curQuestion.getSelectOption();
        this._updateQuestionContent();
        this._startCountDown();
    }
    onEnter() {
        this._answerSignal = G_SignalManager.add(SignalConst.EVENT_ANSWER_GUILD_QUESTION_SUCCESS, handler(this, this._onEventAnswerResult));
        this._answerNextSignal = G_SignalManager.add(SignalConst.EVENT_GUILD_ANSWER_ONE_QUESTION_DONE, handler(this, this._next));
    }
    onExit() {
        this._answerSignal.remove();
        this._answerSignal = null;
        this._answerNextSignal.remove();
        this._answerNextSignal = null;
    }
    //更新问题的内容
    _updateQuestionContent() {
        this._updateQuestionsIndex();
        this._updateOptions();
    }
    //显示最上排小灯笼每一道题答题的对错
    _updateQuestionsIndex() {
        for (var i = 1; i <= GuildAnswerConst.QUESTION_NUM; i++) {
            var questionData = this._questions[i - 1];
            var isRight = questionData.getRightAnswer() == questionData.getSelectOption();
            
            var isAnswer = questionData.getSelectOption() != 0;
            this._indexs[i].updateUI(this._curIndex, isRight, isAnswer);
            if (this._curIndex == i) {
                this._questionIndexText.string = (Lang.get('lang_guild_answer_start_question_index', { num: i }));
                var des = questionData.getQuestionDes();
                // var parts = des.split('_');
                // var index = parseInt(parts[0]);
                // var realDes = parts[index + 1];
                let realDes = des;
                this._questionContent.string = (realDes || '');
            }
        }
    }
    //更新选项
    //在即将进入下一道题时，会显示当前这道题的正确答案
    _updateOptions() {
        if (!this._curQuestion) {
            return;
        }
        var hasShowWrongBuff = false;
        var showWrongNum = 0;
        var buffDatas = G_UserData.getHomeland().getBuffDatasWithBaseId(2);
        if (buffDatas.length != 0) {
            hasShowWrongBuff = true;
            showWrongNum = buffDatas[0].getConfig().value;
        }
        //获取四个选项
        var options = this._curQuestion.getOptions();
        var wrongAnswers = this._curQuestion.getWrongParam();
        for (var j = 1; j <= 4; j++) {
            var isNeedShowRight = this._isAwardTime;
            var isNeedShowWrong = hasShowWrongBuff && showWrongNum > 0 && wrongAnswers[j];
            var isSelect = this._curQuestion.getSelectOption() == j;
            var isRight = false;
            if (this._curQuestion.getRightAnswer() > 0) {
                isRight = this._curQuestion.getRightAnswer() == j;
            } else {
                isRight = this._curQuestion.isIs_right();
            }
            this._options[j].updateUI(options[j-1], isNeedShowRight || isSelect, isSelect, isRight, isNeedShowWrong);
            if (isRight == false && isNeedShowWrong) {
                showWrongNum = showWrongNum - 1;
            }
        }
    }
    //玩家答完每一道题以后， 有服务端下发结果 ，对或者错立即显示出来
    _updateOptionByIndex(index) {
        if (!this._curQuestion) {
            return;
        }
        var options = this._curQuestion.getOptions();
        for (var j = 1; j <= 4; j++) {
            //只更新当前你答的那道题的对错
            if (j == index) {
                var isSelect = this._curQuestion.getSelectOption() == j;
                var isRight = this._curQuestion.isIs_right();
                console.log("你的答题结果为------",isRight?"对的":"错的",this._curQuestion.getQuestionId(),this._curQuestion.getRightAnswer(),this._curQuestion.getSelectOption());
                this._options[j].updateUI(options[j - 1], true, isSelect, isRight);
                break;
            }
        }
    }
    _onSelectOption(index) {
        if (this._isAwardTime) {
            return;
        }
        if (!this._curQuestion) {
            // assert(false, 'self._curQuestion  == nil ');
            return;
        }
        if (this._curSelectAnswerOptionIndex && this._curSelectAnswerOptionIndex > 0) {
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
            this._loadingBarProgress.progress = (0);
        } else {
            var percent = (this._curEndTime - curTime) / (this._curEndTime - this._curBeginTime);
            if (percent < 0) {
                percent = 0;
            }
            this._loadingBarProgress.progress = (percent);
        }
    }
    _startCountDown() {
        if (!this._curQuestion) {
            return;
        }
        this._countDownTime.node.stopAllActions();
        this._curBeginTime = GuildAnswerHelper.getQuestionBeginTime(this._curQuestion);
        if (this._isAwardTime) {
            this._awardTimeLabel.node.active = (false);
            this._countDownParentNode.active = (false);
            this._curBeginTime = this._curBeginTime + this._respondTime;
            this._curEndTime = this._curBeginTime + this._awardTime;
        } else {
            this._countDownParentNode.active = (true);
            this._awardTimeLabel.node.active = (false);
            this._curEndTime = this._curBeginTime + this._respondTime;
        }
        var curTime = G_ServerTime.getTime();
        var action = UIActionHelper.createUpdateAction(function () {
            var curTime2 = G_ServerTime.getTime();
            var diffTime = this._curEndTime - curTime2;
            if (diffTime < 0) {
                diffTime = 0;
            }
            this._countDownTime.string = (diffTime);
            this._setLoadingBarProgress(curTime2);
            if (curTime2 >= this._curEndTime) {
                this._countDownTime.node.stopAllActions();
            }
        }.bind(this), 0.1);
        this._countDownTime.string = (this._curEndTime - curTime) + "";
        this._setLoadingBarProgress(curTime);
        this._countDownTime.node.runAction(action);
    }
    _addScorePromptTips(questionData, callback) {
        if (questionData) {
            if (questionData.getSelectOption() != 0) {
                if (questionData.isIs_right()) {
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
        this._isAwardTime = true;
        this._updateQuestionContent();
        this._curIndex = this._curIndex + 1;
        this._isAwardTime = false;
        if (!this._curIndex || this._curIndex > this._questions.length) {
            this._countDownTime.node.stopAllActions();
            if (this._countDownCallback) {
                this._countDownCallback();
            }
            G_UserData.getAuction().c2sGetAllAuctionInfo();
            return;
        }
        if (!this._isAwardTime) {
            this._curSelectAnswerOptionIndex = 0;
        }
        this._curQuestion = this._questions[this._curIndex-1];
        var awardTime = GuildAnswerHelper.getAwardTime();
       this.scheduleOnce( ()=> {
            this._startCountDown();
            this._updateQuestionContent();
        }, awardTime);

    }
    _onEventAnswerResult(id, message) {
        var question_no = message['question_no'];
        if (question_no) {
            var questionData = this._questions[question_no - 1];
            if (!questionData) {
                // assert(false, 'questionData == nil');
                return;
            }
            var answer_id = message['answer_id'];
            var awards = message['reward'] || [];
            if (answer_id) {
                questionData.setSelectOption(answer_id);
                this._curSelectAnswerOptionIndex = answer_id;
                this._addScorePromptTips(questionData, function () {
                    G_Prompt.showAwards(awards);
                });
                if (questionData.getQuestionNo() == this._curQuestion.getQuestionNo()) {
                    this._updateOptionByIndex(answer_id);
                    console.log("当前回答结果是------",answer_id,message);
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