const { ccclass, property } = cc._decorator;

import CommonStoryAvatar from '../../../ui/component/CommonStoryAvatar'
import ViewBase from '../../ViewBase';
import { Path } from '../../../utils/Path';
import { G_ServerTime } from '../../../init';
import UIActionHelper from '../../../utils/UIActionHelper';
import { GuildAnswerHelper } from './GuildAnswerHelper';

@ccclass
export default class AnswerClientEnd extends ViewBase {

    @property({
        type: CommonStoryAvatar,
        visible: true
    })
    _heroAvatar: CommonStoryAvatar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTimeDesc: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOverTime: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _alreadyOpenDesc: cc.Label = null;
    _callback: Function;
    _emptyQuestions: any;


    initData(callback, emptyQuestions) {
        this._callback = callback;
        this._emptyQuestions = emptyQuestions;
        var resource = { file: Path.getCSB('AnswerClientEnd', 'guildAnswer') };
    }
    onCreate() {
        this._heroAvatar.updateUI(429);
        this._heroAvatar.node.setScale(0.6);
        var currTime = G_ServerTime.getTime();
        var endTime = GuildAnswerHelper.getGuildAnswerStartTime();
        if (this._emptyQuestions && currTime >= endTime) {
            this._textTimeDesc.node.active = (false);
            this._textOverTime.node.active = (false);
            this._alreadyOpenDesc.node.active = (true);
        } else {
            this._textTimeDesc.node.active = (true);
            this._textOverTime.node.active = (true);
            this._alreadyOpenDesc.node.active = (false);
            if (GuildAnswerHelper.isTodayOpen()) {
                this._textOverTime.string = (G_ServerTime.getLeftSecondsString(GuildAnswerHelper.getGuildAnswerStartTime(), '00:00:00'));
            } else {
                this._textOverTime.string = ('00:00:00');
            }
            if (currTime < endTime && GuildAnswerHelper.isTodayOpen()) {
                var action = UIActionHelper.createUpdateAction(function () {
                    this._updateCountDown();
                }.bind(this), 0.5);
                this._textOverTime.node.runAction(action);
            }
        }
    }
    _updateCountDown() {
        var currTime = G_ServerTime.getTime();
        var endTime = GuildAnswerHelper.getGuildAnswerStartTime();
        this._textOverTime.string = (G_ServerTime.getLeftSecondsString(GuildAnswerHelper.getGuildAnswerStartTime(), '00:00:00'));
        if (currTime >= endTime) {
            this._textOverTime.node.stopAllActions();
            if (this._callback) {
                this._callback();
            }
        }
    }
    onEnter() {
    }
    onExit() {
    }

}