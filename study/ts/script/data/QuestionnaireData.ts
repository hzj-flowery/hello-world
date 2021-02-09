import { BaseData } from "./BaseData";
import { QuestionnaireUnitData } from "./QuestionnaireUnitData";
import { G_NetworkManager, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
import { FunctionConst } from "../const/FunctionConst";

export class QuestionnaireData extends BaseData {
    private _questionnaireUnitDatas: { [key: string]: QuestionnaireUnitData };
    private _sendedQidCache: number;
    private _s2cGetQuestionnaireInfoListener;
    private _s2cQuestionnaireListener;
    private _s2cUpdateQuestionnaireInfoListener;
    constructor() {
        super()
        this._questionnaireUnitDatas = {};
        this._sendedQidCache = 0;
        this._s2cGetQuestionnaireInfoListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetQuestionnaireInfo, this._s2cGetQuestionnaireInfo.bind(this));
        this._s2cQuestionnaireListener = G_NetworkManager.add(MessageIDConst.ID_S2C_Questionnaire, this._s2cQuestionnaire.bind(this));
        this._s2cUpdateQuestionnaireInfoListener = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateQuestionnaireInfo, this._s2cUpdateQuestionnaireInfo.bind(this));
    }

    public clear() {
        this._s2cGetQuestionnaireInfoListener.remove();
        this._s2cGetQuestionnaireInfoListener = null;
        this._s2cQuestionnaireListener.remove();
        this._s2cQuestionnaireListener = null;
        this._s2cUpdateQuestionnaireInfoListener.remove();
        this._s2cUpdateQuestionnaireInfoListener = null;
    }

    public reset() {
        this._questionnaireUnitDatas = {};
    }

    public _s2cGetQuestionnaireInfo(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._questionnaireUnitDatas = {};
        var questionnaires = message.questionnaires || [];

        for (let k = 0; k < questionnaires.length; k++) {
            var v = questionnaires[k];
            this._addQuestionnaire(v);

        }
        var questionIds = message.question_ids || [];

        for (let k = 0; k < questionIds.length; k++) {
            var v = questionIds[k];
            var unitData = this._getQuestionnaire(v);
            if (unitData) {
                unitData.setApply(true);
            }
        }

        G_SignalManager.dispatch(SignalConst.EVENT_QUESTIONNAIRE_INGO_CHANGE);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_QUESTION);
    }

    public _s2cUpdateQuestionnaireInfo(id, message) {
        this._addQuestionnaire(message.questionnaire);
        G_SignalManager.dispatch(SignalConst.EVENT_QUESTIONNAIRE_INGO_CHANGE);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_QUESTION);
    }

    public _s2cQuestionnaire(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var unitData = this._getQuestionnaire(this._sendedQidCache);
        if (unitData) {
            unitData.setApply(true);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_QUESTIONNAIRE_INGO_CHANGE);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_QUESTION);
    }

    public _addQuestionnaire(data) {
        var questionnaireUnitData = new QuestionnaireUnitData(data);
        this._questionnaireUnitDatas['k_' + (questionnaireUnitData.getId())] = questionnaireUnitData;
    }

    public _deleteQuestionnaire(id) {
        this._questionnaireUnitDatas['k_' + (id)] = null;
    }

    public _getQuestionnaire(id) {
        return this._questionnaireUnitDatas['k_' + (id)];
    }

    public c2sQuestionnaire(qid) {
        this._sendedQidCache = qid;
        G_NetworkManager.send(MessageIDConst.ID_C2S_Questionnaire, { qid: qid });
    }

    public hasRedPoint() {
        return true;
    }

    public getQuestionList(): QuestionnaireUnitData[] {
        var queList: QuestionnaireUnitData[] = [];
        for (const k in this._questionnaireUnitDatas) {
            var v = this._questionnaireUnitDatas[k];
            if (v.canShow()) {
                queList.push(v);
            }
        }
        queList.sort(function (obj1, obj2) {
            return obj1.getId() - obj2.getId();
        });
        return queList;
    }
}