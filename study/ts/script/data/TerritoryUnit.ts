import { ArraySort } from "../utils/handler";
import { G_UserData, G_ServiceManager, G_ServerTime, G_ConfigLoader } from "../init";
import { Lang } from "../lang/Lang";
import { TerritoryConst } from "../const/TerritoryConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { TerritoryHelper } from "../scene/view/territory/TerritoryHelper";


let EVENT_RIOT = 100;
let EVENT_RIOT_FINISH = 101;
function SortEvent(lE, rE) {
    return lE.time < rE.time;
}
export class TerritoryUnit {

    public _id: number;
    public _heroId;
    public _events;
    public _startTime: number;
    public _remainTime: number;
    public _award;
    public _open: boolean;
    public _patrolType;
    public _endTime: number;
    public _nextId: number;
    public _canFight: boolean;
    public _territoryCfg;
    public _territoryBubble;
    _limitLevel: any;
    _limitRedLevel: any;
    constructor(index, data) {
        if (data == null) {
            this._id = index;
            this._heroId = null;
            this._events = [];
            this._startTime = 0;
            this._remainTime = 0;
            this._award = null;
            this._open = false;
        } else {
            this._id = data.id;
            this._heroId = data.patrol_hero_base_id;
            this._patrolType = data.patrol_type;
            this._events = data.patrol_events;
            this._startTime = data.patrol_start;
            this._endTime = data.patrol_end;
            this._limitLevel = data.patrol_hero_limit_level;
            this._limitRedLevel = data.patrol_hero_limit_rtg;
            this._remainTime = Math.abs(this._startTime - data.patrol_end);
            this._open = true;
        }
        this._nextId = 0;
        this._canFight = false;
        let TerritoryInfo = G_ConfigLoader.getConfig(ConfigNameConst.TERRITORY_PERFORMANCE);
        this._territoryCfg = TerritoryInfo.get(this._id);
        this._territoryBubble = {};
        let bubblestring = this._territoryCfg.hero_bubble_id;
        if (typeof bubblestring == 'string') {
            let bubblelist = bubblestring.split('|');
            for (let i in bubblelist) {
                let bubbleId = bubblelist[i];
                this._territoryBubble.push(Number(bubbleId));
            }
        }
        ArraySort(this._events, SortEvent);
    }
    public setTerritoryData(data) {
        if (data == null) {
            this._heroId = null
            this._events = [];
            this._startTime = 0;
            this._remainTime = 0;
            this._award = null;
            this._open = false;
        } else {
            this._id = data.id;
            this._heroId = data.patrol_hero_base_id;
            this._patrolType = data.patrol_type;
            this._events = data.patrol_events;
            this._startTime = data.patrol_start;
            this._endTime = data.patrol_end;
            this._limitLevel = data.patrol_hero_limit_level;
            this._limitRedLevel = data.patrol_hero_limit_rtg;
            this._remainTime = Math.abs(this._startTime - data.patrol_end);
            this._open = true;
        }
        ArraySort(this._events, SortEvent);
    }
    public setNextId(nextId) {
        this._nextId = nextId || 0;
    }
    public getNextId() {
        return this._nextId;
    }
    public insertEvent(eventId) {
        let serverTime = G_ServerTime.getTime() - 10;
        let eventStruct = {
            id: eventId,
            time: serverTime,
            info_id: 2,
            is_riot: true,
            fname: G_UserData.getBase().getName()
        };
        for (let i in this._events) {
            let event = this._events[i];
            if (serverTime < event.time) {
                this._events.splice(i, 0, eventStruct);
                break;
            }
        }
    }
    public getTerritoryBubble(index) {
        if (this._territoryBubble[index] != null) {
            return this._territoryBubble[index];
        }
        return 0;
    }
    public getTerritoryId() {
        return this._id;
    }
    public getPreTerritoryId() {
        return this._territoryCfg.pre_id;
    }
    public getTerritoryName() {
        return this._territoryCfg.name;
    }
    public isCanFight() {
        let state = this.getTerritoryState();
        if (state == TerritoryConst.STATE_FIGHT) {
            if (G_UserData.getBase().getPower() >= this._territoryCfg.fight_value) {
                if (this.IsReady()) {
                    return true;
                }
            }
        }
        return false;
    }
    public getTerritoryCfg() {
        return this._territoryCfg;
    }
    public getHeroId() {
        return this._heroId || 0;
    }
    getLimitLevel() {
        return this._limitLevel || 0;
    }
    getLimitRedLevel() {
        return this._limitRedLevel || 0;
    }
    public getEvents() {
        return this._events;
    }
    public getTerritoryEventsTillNow() {
        let eventList = [];

        for (let i in this._events) {
            let event = this._events[i];
            if (event.time <= G_ServerTime.getTime()) {
                eventList.push(event);
            }
        }
        ArraySort(eventList, function (event1, event2) {
            return event1.time > event2.time;
        });
        return eventList;
    }
    public getNextEventTime() {
        for (let i in this._events) {
            let event = this._events[i];
            if (event.time > G_ServerTime.getTime()) {
                return event.time;
            }
        }
        return 0;
    }
    public getStartTime() {
        return this._startTime;
    }
    public getEndTime() {
        return this._remainTime + this._startTime;
    }
    public getHeroDrop() {
        return this._award;
    }
    public getIsOpen() {
        return this._open;
    }
    public setCanFight(canFight) {
        this._canFight = canFight || false;
    }
    public getCanFight() {
        return this._canFight;
    }
    public IsReady() {
        let openLv = this._territoryCfg.attack_lv;
        let playerLevel = G_UserData.getBase().getLevel();
        return playerLevel >= openLv;
    }
    public getTerritoryState() {
        if (this.getIsOpen()) {
            if (this.getHeroId() > 0) {
                if (this.getEndTime() < G_ServerTime.getTime()) {
                    return TerritoryConst.STATE_FINISH;
                }
                let [id] = this.getFirstRiotId();
                if (id > 0) {
                    return TerritoryConst.STATE_RIOT;
                }
                return TerritoryConst.STATE_COUNTDOWN;
            } else {
                return TerritoryConst.STATE_ADD;
            }
        } else if (this.getCanFight()) {
            return TerritoryConst.STATE_FIGHT;
        }
        return TerritoryConst.STATE_LOCK;
    }
    public getRiotEvents() {
        let riotEventList = [];
        for (let i in this._events) {
            let event = this._events[i];
            if (event.event_type == TerritoryConst.RIOT_TYPE_OPEN) {
                if (event.time < G_ServerTime.getTime()) {
                    riotEventList.push(event);
                }
            }
        }
        return riotEventList;
    }
    public setRiotEventState(eventId, eventState) {
        var getIndex = function (eventId) {
            for (let i in this._events) {
                let event = this._events[i];
                if (event.id == eventId) {
                    return i;
                }
            }
            return 0;
        }.bind(this);
        let event = this._events[getIndex(eventId)];
        if (event) {
            if (TerritoryConst.RIOT_HELPED == eventState) {
                event.for_help = true;
            }
            if (TerritoryConst.RIOT_TAKEN == eventState) {
                event.is_award = true;
            }
            if (TerritoryConst.RIOT_TAKE == eventState) {
                event.is_repress = true;
            }
        }
    }
    public getFirstRiotId() {
        let firstId = 0;
        let riotEvent = null;

        for (let i in this._events) {
            let event = this._events[i];
            let riotNeedTime = Number(TerritoryHelper.getTerritoryParameter('riot_continue_time'));
            let riotEndTime = event.time + riotNeedTime;
            if (event.time <= G_ServerTime.getTime()) {
                let riotState = TerritoryHelper.getRiotEventState(event);
                if (riotState != TerritoryConst.RIOT_OVERTIME) {
                    if (firstId == 0) {
                        let isRepress = event['is_repress'];
                        if (event.event_type == TerritoryConst.RIOT_TYPE_OPEN && isRepress == false) {
                            firstId = event.id;
                            riotEvent = event;
                            break;
                        }
                    }
                }
            }
        }
        return [
            firstId,
            riotEvent
        ];
    }
    public getLockMsg() {
        if (this.IsReady()) {
            let preName = G_UserData.getTerritory().getTerritoryName(this.getPreTerritoryId());
            return Lang.get('lang_territory_pre_limit', { name: preName });
        } else {
            return Lang.get('lang_territory_lv_limit', { level: this._territoryCfg.attack_lv });
        }
        return null;
    }
    public getTerritoryRiotInfo() {
        let [riotId, eventData] = this.getFirstRiotId();
        if (riotId > 0) {

            let TerritoryRiotInfo = G_ConfigLoader.getConfig(ConfigNameConst.TERRITORY_RIOT);
            let riotInfo = TerritoryRiotInfo.get(eventData.info_id);
            console.assert(riotInfo, 'eventInfo is nil with Id' + eventData.info_id);
            return [
                riotInfo,
                eventData
            ];
        }
        return null;
    }
    public reset() {
        this._heroId = null;
        this._events = [];
        this._startTime = 0;
        this._remainTime = 0;
        this._award = null;
        this._open = true;
    }
}
