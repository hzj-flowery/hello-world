import { ArraySort } from "../utils/handler";
import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { GuildAnswerRankUnitData } from "./GuildAnswerRankUnitData";
import { GuildAnswerMyGuildRankUnitData } from "./GuildAnswerMyGuildRankUnitData";
import { GuildAnswerQuestionUnitData } from "./GuildAnswerQuestionUnitData";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";

export interface GuildAnswerData {
    getRandomAward(): Object
    setRandomAward(value: Object): void
    getLastRandomAward(): Object
    getStartTime(): number
    setStartTime(value: number): void
    getLastStartTime(): number
    getAnswerData(): Object
    setAnswerData(value: Object): void
    getLastAnswerData(): Object
}
let schema = {};
schema['randomAward'] = [
    'object',
    null
];
schema['startTime'] = [
    'number',
    0
];
schema['answerData'] = [
    'object',
    {}
];
export class GuildAnswerData extends BaseData {

    public static schema = schema;

    _signalRecvEnterGuildAnswer;
    _signalRecvAnswerGuildQuestion;
    _signalRecvSetGuildAnswerTime;
    _signalRecvGuildAnswerPublic;
    _signalRandomAward;
    constructor(properties?) {
        super(properties);
        this._signalRecvEnterGuildAnswer = G_NetworkManager.add(MessageIDConst.ID_S2C_EnterGuildAnswer, this._s2cEnterGuildAnswer.bind(this));
        this._signalRecvAnswerGuildQuestion = G_NetworkManager.add(MessageIDConst.ID_S2C_AnswerGuildQuestion, this._s2cAnswerGuildQuestion.bind(this));
        this._signalRecvSetGuildAnswerTime = G_NetworkManager.add(MessageIDConst.ID_S2C_SetGuildAnswerTime, this._s2cSetGuildAnswerTime.bind(this));
        this._signalRecvGuildAnswerPublic = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildAnswerPublic, this._s2cGuildAnswerPublic.bind(this));
        this._signalRandomAward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGuildAnswer, this._s2cGetGuildAnswer.bind(this));
    }
    public clear() {
        this._signalRecvEnterGuildAnswer.remove();
        this._signalRecvEnterGuildAnswer = null;
        this._signalRecvAnswerGuildQuestion.remove();
        this._signalRecvAnswerGuildQuestion = null;
        this._signalRecvSetGuildAnswerTime.remove();
        this._signalRecvSetGuildAnswerTime = null;
        this._signalRecvGuildAnswerPublic.remove();
        this._signalRecvGuildAnswerPublic = null;
        this._signalRandomAward.remove();
        this._signalRandomAward = null;
    }
    public reset() {
    }
    public _handleRankData(message) {
        // let GuildAnswerRankUnitData = require('GuildAnswerRankUnitData');
        // let GuildAnswerMyGuildRankUnitData = require('GuildAnswerMyGuildRankUnitData');
        let answer_rank = message['answer_rank'] || {};
        let ranks: any = {};
        ranks.guild = [];
        for (let _ in answer_rank) {
            let v = answer_rank[_];
            let signalData = new GuildAnswerRankUnitData();
            signalData.setProperties(v);
            ranks.guild.push(signalData);
        }
        ArraySort(ranks.guild, function (a, b) {
            if (a.getPoint() == b.getPoint()) {
                return a.getGuild_id() < b.getGuild_id();
            } else {
                return a.getPoint() > b.getPoint();
            }
        });
        let member_point = message['member_point'] || {};
        ranks.person = [];
        for (let _ in member_point) {
            let v = member_point[_];
            let signalData = new GuildAnswerMyGuildRankUnitData();
            signalData.setName(v.user_name);
            signalData.setUser_id(v.user_id);
            signalData.setPoint(v.point);
            ranks.person.push(signalData);
        }
        ArraySort(ranks.person, function (a, b) {
            if (a.getPoint() == b.getPoint()) {
                return a.getUser_id() < b.getUser_id();
            } else {
                return a.getPoint() > b.getPoint();
            }
        });
        for (let k in ranks.person) {
            let v = ranks.person[k];
            v.setRank(parseInt(k) + 1);
        }
        return ranks;
    }
    public _handleStartTime(message) {
        let start_time = message['start_time'];
        if (start_time) {
            this.setStartTime(start_time);
        }
    }
    public c2sEnterGuildAnswer() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_EnterGuildAnswer, {});
    }
    public _s2cEnterGuildAnswer(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let answerData: any = {};
        let questions = message['questions'] || {};
        let answers = message['answers'] || {};
        let answersMap = {};
        for (let _ in answers) {
            let v = answers[_];
            answersMap[v.Key] = v.Value;
        }
        answerData.questions = [];
        for (let k in questions) {
            let v = questions[k];
            let signalData = new GuildAnswerQuestionUnitData();
            signalData.updateData(v.question_no, v.question_id, v.questions, v.right_answer, answersMap[v.question_no], null, v.wrong_param);
            answerData.questions[v.question_no-1] = signalData;
        }
        ArraySort(answerData.questions, function (a, b) {
            return a.getQuestionNo() < b.getQuestionNo();
        });
        answerData.ranks = this._handleRankData(message);
        let endScore = 0;
        let endRank = 0;
        let endExp = 0;
        let end_notice = message['end_notice'];
        if (end_notice) {
            for (let _ in end_notice.sys_notice) {
                let v = end_notice.sys_notice[_];
                if (v.key == 'integral') {
                    endScore = Number(v.value) || 0;
                } else if (v.key == 'rank') {
                    endRank = Number(v.value) || 0;
                } else if (v.key == 'exp') {
                    endExp = Number(v.value) || 0;
                }
            }
        }
        answerData.endScore = endScore;
        answerData.endRank = endRank;
        answerData.endExp = endExp;
        let now_rand_item = message['now_rand_item'];
        if (now_rand_item) {
            this.setRandomAward(now_rand_item);
        }
        this._handleStartTime(message);
        this.setAnswerData(answerData);
        G_SignalManager.dispatch(SignalConst.EVENT_ENTER_GUILD_ANSWER_SUCCESS);
    }
    public c2sAnswerGuildQuestion(question_no, answer_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_AnswerGuildQuestion, {
            question_no: question_no,
            answer_id: answer_id
        });
    }
    public _s2cAnswerGuildQuestion(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (message['question_no']) {
            var answerData:any = this.getAnswerData();
            var question = answerData.questions[message.question_no-1];
            if (question) {
                question.setIs_right(message['is_right'] || false);
            }
            this.setAnswerData(answerData);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_ANSWER_GUILD_QUESTION_SUCCESS, message);
    }
    public c2sSetGuildAnswerTime(time_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_SetGuildAnswerTime, { time_id: time_id });
    }
    public _s2cSetGuildAnswerTime(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let ranks = this._handleRankData(message);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_ANSWER_PUBLIC_SUCCESS, ranks);
        G_SignalManager.dispatch(SignalConst.EVENT_SET_GUILD_ANSWER_TIME_SUCCESS);
    }
    public _s2cGuildAnswerPublic(id, message) {
        var ranks = this._handleRankData(message);
        var answerData:any = this.getAnswerData();
        if (message['question_no'] && answerData.questions) {
            var question = answerData.questions[message.question_no-1];
            if (question) {
                question.setRightAnswer(message.right_answer);
            } else {
                console.log('question is null');
            }
            this.setAnswerData(answerData);
        } else {
            console.log('null');
        }
        console.log(message);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_ANSWER_PUBLIC_SUCCESS, ranks);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_ANSWER_ONE_QUESTION_DONE);
    }
    public _s2cGetGuildAnswer(id, message) {
        let now_rand_item = message['now_rand_item'];
        if (now_rand_item) {
            this.setRandomAward(now_rand_item);
        }
        this._handleStartTime(message);
    }
}
