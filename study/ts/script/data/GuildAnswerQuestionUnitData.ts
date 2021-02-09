import { BaseData } from "./BaseData";
import { G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { mathRandom } from "../utils/math";
import UIHelper from "../utils/UIHelper";

export interface GuildAnswerQuestionUnitData {
    getQuestionNo():number
 setQuestionNo(data:number):void
 getQuestionId():number
 setQuestionId(data:number):void
 getRightAnswer():number
 setRightAnswer(data:number):void
 isIs_right():boolean
 setIs_right(data:boolean):void
 getOptions():object
 setOptions(data:object):void
 getWrongParam():object
 setWrongParam(data:object):void
 getQuestionDes():string
 setQuestionDes(data:string):void
 getSelectOption():number
 setSelectOption(data:number):void
}
let schema = {};
schema['questionNo'] = [
    'number',
    0
];
schema['questionId'] = [
    'number',
    0
];
schema['rightAnswer'] = [
    'number',
    -1
];
schema['is_right'] = [
    'boolean',
    false
];
schema['options'] = [
    'object',
    {}
];
schema['wrongParam'] = [
    'object',
    {}
];
schema['questionDes'] = [
    'string',
    ''
];
schema['selectOption'] = [
    'number',
    0
];
export class GuildAnswerQuestionUnitData extends BaseData {
    public static schema = schema;

    _flag: number;

    constructor(properties?, flag?) {
        super(properties)
        this._flag = flag || 0;
    }
    public clear() {
    }
    public reset() {
    }
    public updateData (question_no, question_id, options, right_answer, selectOption, question_param, wrongAnswers) {
        this.setQuestionNo(question_no);
        this.setQuestionId(question_id);
        this.setRightAnswer(right_answer);
        this.setSelectOption(selectOption || 0);
        var wrongAnswerArray = {};
        if (wrongAnswers) {
            for (let k in wrongAnswers) {
                var v = wrongAnswers[k];
                wrongAnswerArray[v] = 1;
            }
        }
        this.setWrongParam(wrongAnswerArray);
        var config = null;
        if (this._flag == 1) {
            
            config = G_ConfigLoader.getConfig(ConfigNameConst.NEW_ANSWER).get(question_id);
        } else {
            config = G_ConfigLoader.getConfig(ConfigNameConst.ANSWER).get(question_id);
        }
        if (config) {

            var reg = new RegExp("#param#", "g")
            var des = (config.description as string).replace(reg, question_param || '');
            var result = des;
            // var randomLength = Math.floor(Math.random()*7);
            // if(randomLength<2)randomLength=2;
            // var randomIndex = Math.floor(Math.random()*randomLength);
            // if(randomIndex<1)randomIndex = 1;
            // result = randomIndex+'';
            // for (var i = 1; i <= randomLength; i++) {
            //     var randomPart = Math.floor(Math.random()*9999999);
            //     if(randomPart<1)randomPart = 1;
            //     if (i == randomIndex) {
            //         result = result + ('_' + des);
            //     } else {
            //         result = result + ('_' + randomPart);
            //     }
            // }
            console.log('result ' + result);
            this.setQuestionDes(result);
        } else {
            ('error id ' + question_id);
            this.setQuestionDes('');
        }
        var ops = {};
        for (var i = 0; i < options.length; i++) {
            ops[i] = options[i] || '';
        }
        this.setOptions(ops);
    }
}
