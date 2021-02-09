import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_ServerTime } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { GuildAnswerQuestionUnitData } from "./GuildAnswerQuestionUnitData";
import { ArraySort } from "../utils/handler";
import { GuildAnswerRankUnitData } from "./GuildAnswerRankUnitData";
import { GuildAnswerMyGuildRankUnitData } from "./GuildAnswerMyGuildRankUnitData";
import { GuildServerAnswerPlayerUnitData } from "./GuildServerAnswerPlayerUnitData";
import { SignalConst } from "../const/SignalConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { FunctionConst } from "../const/FunctionConst";

export interface GuildServerAnswerData {
    getNewStartTime(): number
    setNewStartTime(value: number): void
    getLastNewStartTime(): number
    getAnswerState(): string
    setAnswerState(value: string): void
    getLastAnswerState(): string
    getStateEndTime(): number
    setStateEndTime(value: number): void
    getLastStateEndTime(): number
    getCurQuestion(): Object
    setCurQuestion(value: Object): void
    getLastCurQuestion(): Object
    getReadySucess(): number
    setReadySucess(value: number): void
    getLastReadySucess(): number
    getRanks(): Object
    setRanks(value: Object): void
    getLastRanks(): Object
    getRandomAward(): Object
    setRandomAward(value: Object): void
    getLastRandomAward(): Object
}
let schema = {};
schema['newStartTime'] = [
    'number',
    0
];
schema['answerState'] = [
    'string',
    ''
];
schema['stateEndTime'] = [
    'number',
    0
];
schema['curQuestion'] = [
    'object',
    {}
];
schema['readySucess'] = [
    'number',
    0
];
schema['ranks'] = [
    'object',
    {}
];
schema['randomAward'] = [
    'object',
    {}
];
export class GuildServerAnswerData extends BaseData {
    public static schema = schema;

    _answerPlayers = [];
    _signalRecvGuildAnswerPublic;
    _signalRecvEnterNewAnswer;
    _signalGuildAnswerSysNotify;
    _signalGuildAnswerChangeNotify;
    _signalGuildAnswerChange;
    _signalGetGuildNewAnswer;
    constructor(properties?) {
        super(properties);
        this._answerPlayers = [];
        this._signalRecvGuildAnswerPublic = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildNewAnswerPublic, this._s2cGuildAnswerPublic.bind(this));
        this._signalRecvEnterNewAnswer = G_NetworkManager.add(MessageIDConst.ID_S2C_EnterNewAnswer, this._s2cEnterNewGuildAnswer.bind(this));
        this._signalGuildAnswerSysNotify = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildAnswerSysNotify, this._s2cGuildAnswerSysNotify.bind(this));
        this._signalGuildAnswerChangeNotify = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildAnswerChangeNotify, this._s2cGuildAnswerChangeNotify.bind(this));
        this._signalGuildAnswerChange = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildAnswerChange, this._s2cGuildAnswerChange.bind(this));
        this._signalGetGuildNewAnswer = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGuildNewAnswer, this._s2cGetGuildNewAnswer.bind(this));
        this._resetData();
    }
    public _resetData() {
        this.setCurQuestion(new GuildAnswerQuestionUnitData());
    }
    public clear() {
        this._signalGuildAnswerSysNotify.remove();
        this._signalGuildAnswerSysNotify = null;
        this._signalGuildAnswerChangeNotify.remove();
        this._signalGuildAnswerChangeNotify = null;
        this._signalGuildAnswerChange.remove();
        this._signalGuildAnswerChange = null;
        this._signalRecvEnterNewAnswer.remove();
        this._signalRecvEnterNewAnswer = null;
        this._signalGetGuildNewAnswer.remove();
        this._signalGetGuildNewAnswer = null;
        this._signalRecvGuildAnswerPublic.remove();
        this._signalRecvGuildAnswerPublic = null;
        this._resetData();
    }
    public reset() {
        this._resetData();
    }
    public _handleRankData(message) {
        let answer_rank = message['answer_rank'] || [];
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
        let member_point = message['member_point'] || [];
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
            v.setRank(k);
        }
        return ranks;
    }
    public _handlePlayerData(message) {
        let listPlayer = message['cur_player'] || message['update_player'] || {};
        this._answerPlayers = this._answerPlayers || [];
        for (let k in listPlayer) {
            let v = listPlayer[k];
            this._updatePlayerDataEx(v);
        }
    }

    _updateCurrPlayerData(message) {
        var listPlayer = message['update_player'] || {};
        this._answerPlayers = this._answerPlayers || [];
        for (let k in listPlayer) {
            var v = listPlayer[k];
            var unitData = this._findPlayerById(v.user_id);
            if (unitData) {
                unitData.updateData(v);
            }
        }
    }
    public _delPlayerData(dels) {
        for (let i in dels) {
            let user_id = dels[i];
            this._removePlayerById(user_id);
        }
    }
    public _updatePlayerDataEx(data) {
        if (!data) {
            return;
        }
        let status = 0;
        let unitData = this._findPlayerById(data.user_id);
        if (!unitData) {
            unitData = new GuildServerAnswerPlayerUnitData();
            this._answerPlayers.push(unitData);
            status = 1;
        }
        unitData.updateData(data);
        return status;
    }
    public _findPlayerById(user_id) {
        for (let i in this._answerPlayers) {
            let unit = this._answerPlayers[i];
            if (unit.getUser_id() == user_id) {
                return unit;
            }
        }
    }
    public _removePlayerById(user_id) {
        for (let i in this._answerPlayers) {
            let unit = this._answerPlayers[i];
            if (unit.getUser_id() == user_id && !unit.isSelf()) {
                this._answerPlayers.splice(parseInt(i), 1);
                return;
            }
        }
    }

    public getGuildServerAnswerPlayerDatas() {
        return this._answerPlayers;
    }
    public _handleCurAnswerData(message) {
        let answerState = message['state'];
        let stateEndTime = message['stateEndTime'] || 0;
        if (stateEndTime == 0) {
            stateEndTime = this.getNewStartTime();
        }
        let curQuestion = message['curQuestion'] || message['question'];
        if (curQuestion) {
            let signalData = new GuildAnswerQuestionUnitData(null, 1);
            signalData.updateData(curQuestion.question_no || 0, curQuestion.question_id || 0, curQuestion.questions || {}, curQuestion.right_answer || 0, null, curQuestion.question_param || '');
            this.setCurQuestion(signalData);
        }
        if (answerState == 1) {
            console.log("全服答题：空闲");
            this.setAnswerState('ANSWER_STATE_IDLE');
        }
        else if (answerState == 2) {
            console.log("全服答题：准备");
            this.setAnswerState('ANSWER_STATE_READY');
        }
        else if (answerState == 3) {
            console.log("全服答题：正在答题");
            this.setAnswerState('ANSWER_STATE_PLAYING');
        }
        else if (answerState == 4) {
            console.log("全服答题：休息中");
            this.setAnswerState('ANSWER_STATE_RESTING');
        }
        else if (answerState == 0) {
            console.log("全服答题：初始化");
            this.setAnswerState('ANSWER_STATE_INIT');
        }
        this.setStateEndTime(stateEndTime);
    }
    public _handleEnd(message) {
        let state = message['state'];
        let stateEndTime = message['stateEndTime'];
        if ((state == 'ANSWER_STATE_INIT' || state == 'ANSWER_STATE_IDLE') && stateEndTime == 0) {
            this.setNewStartTime(0);
            G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_GUILD_SERVER_ANSWER);
        }
    }
    public _handleNewStartTime(message) {
        let start_time = message['start_time'];
        let curTime = G_ServerTime.getTime();
        if (start_time < curTime && (this.getAnswerState() == 'ANSWER_STATE_INIT' || this.getAnswerState() == 'ANSWER_STATE_IDLE')) {
            start_time = 0;
        }
        if (start_time) {
            this.setNewStartTime(start_time);
        }
    }
    public c2sEnterNewGuildAnswer() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_EnterNewAnswer, {});
    }
    public _s2cEnterNewGuildAnswer(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let ranks = [];
        ranks = this._handleRankData(message);
        this._answerPlayers = [];
        this._handleCurAnswerData(message);
        this._handlePlayerData(message);
        this._handleNewStartTime(message);
        this.setRanks(ranks);
        if (this.getAnswerState() == 'ANSWER_STATE_INIT') {
            this.setReadySucess(0);
        } else {
            this.setReadySucess(1);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_ENTER_NEW_ANSWER);
    }
    public _s2cGetGuildNewAnswer(id, message) {
        let now_rand_item = message['now_rand_item'];
        if (now_rand_item) {
            this.setRandomAward(now_rand_item);
        }
        this._handleNewStartTime(message);
    }
    public _s2cGuildAnswerSysNotify(id, message) {
        this._handleCurAnswerData(message);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_SERVER_ANSWER_UPDATE_STATE);
        if (this.getAnswerState() == 'ANSWER_STATE_RESTING') {
            console.log("发送玩家更新消息：flag= 0");
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_SERVER_ANSWER_PLAYER_UPDATE, { flag: 0 });
        } else {
            if (this.getAnswerState() != 'ANSWER_STATE_READY') {
                G_SignalManager.dispatch(SignalConst.EVENT_GUILD_SERVER_ANSWER_PLAYER_UPDATE, { flag: 1 });
            }
        }
        this._handleEnd(message);
    }
    public _s2cGuildAnswerChangeNotify(id, message) {
        console.log("删除玩家消息")
        let dels = message['del_player'] || {};
        if (dels.length > 0) {
            this._delPlayerData(dels);
            this._handlePlayerData(message);
        } else {
            let utype = message['utype'];
            if (utype) {
                if (utype == 1) {
                    let update_player = message['update_player'] || {};
                    this._updatePlayerDataEx(update_player[0]);
                } else {
                    this._answerPlayers = [];
                    this._handlePlayerData(message);
                }
            } else {
                this._handlePlayerData(message);
            }
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_SERVER_ANSWER_PLAYER_UPDATE, { flag: 1 });
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_NEW_ANSWER_UPDATE_PLAYER_NUMS);
    }
    public c2sGuildAnswerChange(answer) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildAnswerChange, { answer: answer });
    }
    public _s2cGuildAnswerChange(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_SERVER_ANSWER_CHANGE_ANSWER_SUCESS);
    }
    public _s2cGuildAnswerPublic(id, message) {
        let ranks = this._handleRankData(message);
        this.setRanks(ranks);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_NEW_ANSWER_UPDATE_RANK, ranks);
    }
}
