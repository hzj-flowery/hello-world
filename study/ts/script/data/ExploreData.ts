import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_ServerTime, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { handler } from "../utils/handler";
import { ExploreConst } from "../const/ExploreConst";
import { ExploreBaseData } from "./ExploreBaseData";
import { ExploreEventData } from "./ExploreEventData";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { BaseConfig } from "../config/BaseConfig";

let schema = {};
schema['explores'] = [
    'object',
    {}
];

schema['events'] = [
    'object',
    {}
];

schema['autoExplore'] = [
    'number',
    0
];

schema['firstPassCity'] = [
    'number',
    0
];
export interface ExploreData {
    getExplores(): ExploreBaseData[]
    setExplores(value: ExploreBaseData[]): void
    getLastExplores(): ExploreBaseData[]
    getEvents(): ExploreEventData[]
    setEvents(value: ExploreEventData[]): void
    getLastEvents(): ExploreEventData[]
    getAutoExplore(): number
    setAutoExplore(value: number): void
    getLastAutoExplore(): number
    getFirstPassCity(): number
    setFirstPassCity(value: number): void
    getLastFirstPassCity(): number
}
export class ExploreData extends BaseData {
    public static schema = schema;

    private _listernerExploreData;
    private _listenerEnterExplore;
    private _listenerRollExplore;
    private _listenerDoEvent;
    private _listenerGetReward;

    constructor() {
        super()
        this._createEmptyData();
        this._listernerExploreData = G_NetworkManager.add(MessageIDConst.ID_S2C_GetExplore, this._s2cGetExplore.bind(this));
        this._listenerEnterExplore = G_NetworkManager.add(MessageIDConst.ID_S2C_EnterExplore, this._s2cEnterExplore.bind(this));
        this._listenerRollExplore = G_NetworkManager.add(MessageIDConst.ID_S2C_RollExplore, this._s2cRollExplore.bind(this));
        this._listenerDoEvent = G_NetworkManager.add(MessageIDConst.ID_S2C_ExploreDoEvent, this._s2cExploreDoEvent.bind(this));
        this._listenerGetReward = G_NetworkManager.add(MessageIDConst.ID_S2C_ExploreGetReward, this._s2cExploreGetReward.bind(this));
    }

    clear() {
        this._listernerExploreData.remove();
        this._listernerExploreData = null;
        this._listenerEnterExplore.remove();
        this._listenerEnterExplore = null;
        this._listenerRollExplore.remove();
        this._listenerRollExplore = null;
        this._listenerDoEvent.remove();
        this._listenerDoEvent = null;
        this._listenerGetReward.remove();
        this._listenerGetReward = null;
    }
    reset() {
    }
    getUnFinishEvents(): ExploreEventData[] {
        var events = this.getEvents();
        var eventList = [];
        var curTime = G_ServerTime.getTime();
        for (var i in events) {
            var v: ExploreEventData = events[i];
            if (v.getParam() == 0) {
                var endTime = v.getEndTime();
                var leftTime = endTime - curTime;
                if (endTime != 0) {
                    if (leftTime > 0) {
                        eventList.push(v);
                    }
                } else {
                    eventList.push(v);
                }
            }
        }
        return eventList;
    }
    setEventParamById(eventId, param) {
        var events = this.getEvents();
        for (var i in events) {
            var v: ExploreEventData = events[i];
            if (v.getEvent_id() == eventId) {
                v.setParam(param);
                break;
            }
        }
    }
    getUnFinishEventCountByType(type) {
        var events = this.getEvents();
        var count = 0;
        var curTime = G_ServerTime.getTime();
        for (var i in events) {
            var v: ExploreEventData = events[i];
            var curType = v.getEvent_type();
            if (curType == type && v.getParam() == 0) {
                var endTime = v.getEndTime();
                if (endTime != 0) {
                    var leftTime = endTime - curTime;
                    if (leftTime > 0) {
                        count++;
                    }
                } else {
                    count++;
                }
            }
        }
        return count;
    }
    updateData(data) {
    }
    _createEmptyData() {
        var exploreList = [];
        var explore = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE)
        var length = explore.getLength();
        var data = explore.get(length);
        while (data) {
            var exploreBaseData = new ExploreBaseData();
            exploreBaseData.setId(data.id);
            exploreBaseData.setConfigData(data);
            exploreList.unshift(exploreBaseData);
            data = explore.get(data.ago_chapter);
        }
        this.setExplores(exploreList);
    }
    getExploreById(exploreId) {
        var exploreList = this.getExplores();
        for (var i in exploreList) {
            var v: ExploreBaseData = exploreList[i];
            if (v.getId() == exploreId) return v;
        }
    }
    getExplorePassCount() {
        var exploreList = this.getExplores();
        var count = 0;
        for (var key in exploreList) {
            var v: ExploreBaseData = exploreList[key];
            if (v.getPass_count() > 1) {
                count = count + 1;
            }
        }
        return count;
    }
    isLastPass(exploreId, n) {
        var lastTwoIndex = 0;
        var exploreList = this.getExplores();
        for (var i in exploreList) {
            var v: ExploreBaseData = exploreList[i];
            if (v.getId() == exploreId) {
                lastTwoIndex = parseInt(i) - n + 1;
                break;
            }
        }
        if (lastTwoIndex <= 0) {
            return true;
        } else {
            var ed: ExploreBaseData = exploreList[lastTwoIndex - 1];
            var passCount: number = ed.getPass_count();
            return passCount > 1;
        }
    }
    c2sGetExplore() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetExplore, {});
    }
    _s2cGetExplore(id, message) {
        if (message.ret != 1) {
            return;
        }
        var isBegin = message['is_begin'];
        var isEnd = message['is_end'];
        if (message.hasOwnProperty('explores')) {
            for (var key in message.explores) {
                var data = message.explores[key];
                this.updateSingleData(data);
            }
        }
        if (isBegin) {
            this.setEvents([]);
        }
        if (message.hasOwnProperty('event_to_do')) {
            for (var key in message.event_to_do) {
                var data = message.event_to_do[key];
                var exploreEventData = new ExploreEventData();
                exploreEventData.updateData(data);
                var eventList = this.getEvents();
                eventList[exploreEventData.getEvent_id()] = exploreEventData;
                this.setEvents(eventList);
            }
        }
    }
    getPassCount(exploreId) {
        if (exploreId == 0) {
            return 0;
        }
        var singleExplore: ExploreBaseData = this.getExploreById(exploreId);
        if (!singleExplore) console.error('wrong exploreId ' + exploreId);
        var passCount = singleExplore.getPass_count();
        return passCount;
    }
    isExplorePass(exploreId) {
        if (exploreId == 0) {
            return true;
        }
        var singleExplore: ExploreBaseData = this.getExploreById(exploreId);
        if (!singleExplore) console.error('wrong exploreId ' + exploreId);
        var passCount = singleExplore.getPass_count();
        return passCount > 1;
    }
    isCanRunFirstExploreTutorial() {
        var isFind = false;
        var events = this.getEvents();
        for (var i in events) {
            var v: ExploreEventData = events[i];
            if (v.getEvent_id() == ExploreConst.EVENT_TYPE_ANSWER && v.getParam() == 0) {
                isFind = true;
                break;
            }
        }
        var isFirstNotPass = false;
        var footIndex = 0;
        var singleExplore: ExploreBaseData = this.getExploreById(1);
        if (singleExplore) {
            var passCount = singleExplore.getPass_count();
            if (passCount <= 1) isFirstNotPass = true;
            footIndex = singleExplore.getFoot_index();
        }
        if (isFirstNotPass) {
            if (footIndex == 0 && !isFind) {
                return true;
            } else if (footIndex == 3 && isFind) {
                return true;
            }
        }
        return false;
    }
    updateSingleData(data) {
        var singleData = this.getExploreById(data.id);
        singleData.updateData(data);
    }
    getEventById(eventId) {
        var eventList = this.getEvents();
        return eventList[eventId];
    }
    updateEvent(data) {
        var eventData = this.getEventById(data.event_id);
        if (eventData) {
            eventData.updateData(data);
        } else {
            var eventList = this.getEvents();
            var exploreEventData = new ExploreEventData();
            exploreEventData.updateData(data);
            eventList[exploreEventData.getEvent_id()] = exploreEventData;
        }
    }
    checkUnfinishedEvent() {
        var count = 0;
        var eventList = this.getEvents();
        for (var i in eventList) {
            var v: ExploreEventData = eventList[i];
            if (v.getParam() == 0) {
                count = count + 1;
            }
        }
        return count;
    }
    c2sEnterExplore(exploreId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_EnterExplore, { id: exploreId });
    }
    _s2cEnterExplore(id, message) {
        if (message.ret != 1) {
            return;
        }
        if (message.hasOwnProperty('explore')) {
            this.updateSingleData(message.explore);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_EXPLORE_ENTER, message.explore.id);
    }
    // debugC2sRollExplore(exploreId, rollNum: number, eventType: number = 0) {
    //     // test code ---
    //     console.log(">>>>> eventid: ", exploreId);
    //     var message: any = {};
    //     message.ret = 1;
    //     message.num = rollNum;
    //     if (eventType && eventType != 0) {
    //         var ed: ExploreEventData = ExploreFacade.getDebugEventData(eventType);
    //         var event: any = {
    //             event_id: ed.getEvent_id(),
    //             event_type: ed.getEvent_type(),
    //             value1: ed.getValue1(),
    //             value2: ed.getValue2(),
    //             value3: ed.getValue3(),
    //             value4: ed.getValue4(),
    //             value5: ed.getValue5(),
    //             value6: ed.getValue6(),
    //             value7: ed.getValue7(),
    //             value8: ed.getValue8(),
    //             event_time: ed.getEvent_time()
    //         };
    //         message['event'] = event;
    //     }
    //     var base_award0: any = {
    //         'type': 1,
    //         'value': 1,
    //         'size': 0
    //     };
    //     message['base_award'] = [base_award0];
    //     message['crit'] = 1;
    //     this._s2cRollExplore(exploreId, message);
    // }
    c2sRollExplore(exploreId) {
        console.log('c2sRollExplore: ', exploreId);
        G_NetworkManager.send(MessageIDConst.ID_C2S_RollExplore, { id: exploreId });
    }
    _s2cRollExplore(id, message) {
        // console.log('exploredata._s2cRollExplore: ', id, message);
        if (message.ret != 1) {
            return;
        }
        if (message.hasOwnProperty('explore')) {
            this.updateSingleData(message.explore);
        }
        if (message.hasOwnProperty('event')) {
            this.updateEvent(message.event);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_EXPLORE_ROLL, message);
    }
    c2sExploreDoEvent(eventId, value = null) {

        G_NetworkManager.send(MessageIDConst.ID_C2S_ExploreDoEvent, {
            id: eventId,
            value1: value
        });

        // console.log('c2sExploreDoEvent: ', eventId);
        // var message: any = {};
        // message.ret = 1;
        // message.id = eventId;
        // var awards: any[] = [];
        // awards.push({
        //     type: 1,
        //     value: 1,
        //     size: 0
        // });
        // awards.push({
        //     type: 2,
        //     value: 2,
        //     size: 0
        // });
        // message['awards'] = awards;
        // message['battle_report'] = 'test_battle_report'; var eventData: ExploreEventData = this.getEventById(eventId);
        // message['value1'] = eventData.getValue1();
        // message['value2'] = eventData.getValue2();
        // message['value3'] = eventData.getValue3();
        // message['value4'] = eventData.getValue4();
        // message['value5'] = eventData.getValue5();
        // message['value6'] = eventData.getValue6();
        // message['value7'] = eventData.getValue7();
        // message['value8'] = eventData.getValue8();
        // if (eventData.getEvent_type() != ExploreConst.EVENT_TYPE_HALP_PRICE) eventData.setParam(1);
        // this._s2cExploreDoEvent(eventId, message);
    }
    _s2cExploreDoEvent(id, message) {
        if (message.ret != 1) return;
        var eventData: ExploreEventData = this.getEventById(message.id);
        eventData.updateDataByMessage(message);
        G_SignalManager.dispatch(SignalConst.EVENT_EXPLORE_DO_EVENT, message);
    }
    c2sExploreGetReward(exploreId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ExploreGetReward, { id: exploreId });

        // var message: any = {};
        // message['ret'] = 1;
        // var explore: any = {};
        // explore['id'] = exploreId;
        // explore['foot_index'] = 0;
        // explore['map_id'] = 1;
        // explore['pass_count'] = 1;
        // message['explore'] = explore;
        // this._s2cExploreGetReward(exploreId, message);
    }
    _s2cExploreGetReward(id, message) {
        if (message.ret != 1) return;
        this.updateSingleData(message.explore);
        G_SignalManager.dispatch(SignalConst.EVENT_EXPLORE_GET_REWARD, message.explore);
    }
}
