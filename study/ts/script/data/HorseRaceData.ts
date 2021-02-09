import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";

export interface HorseRaceData {
    getHorseSoul(): number
    setHorseSoul(value: number): void
    getLastHorseSoul(): number
    getHorseBook(): number
    setHorseBook(value: number): void
    getLastHorseBook(): number
    getRaceCount(): number
    setRaceCount(value: number): void
    getLastRaceCount(): number
}
let schema = {};
schema['horseSoul'] = [
    'number',
    0
];
schema['horseBook'] = [
    'number',
    0
];
schema['raceCount'] = [
    'number',
    0
];
export class HorseRaceData extends BaseData {

    _token;
    _recvWarHorseRide;
    _recvWarHorseRideInfo;
    _recvWarHorseRideStart;
    public static schema = schema;

    constructor(properties?) {
        super(properties);
        this._token = 0;
        this._recvWarHorseRide = G_NetworkManager.add(MessageIDConst.ID_S2C_WarHorseRide, this._s2cWarHorseRide.bind(this));
        this._recvWarHorseRideInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_WarHorseRideInfo, this._s2cWarHorseRideInfo.bind(this));
        this._recvWarHorseRideStart = G_NetworkManager.add(MessageIDConst.ID_S2C_WarHorseRideStart, this._s2cWarHorseRideStart.bind(this));
    }
    public clear() {
        this._recvWarHorseRide.remove();
        this._recvWarHorseRide = null;
        this._recvWarHorseRideInfo.remove();
        this._recvWarHorseRideInfo = null;
        this._recvWarHorseRideStart.remove();
        this._recvWarHorseRideStart = null;
    }
    public reset() {
    }
    public c2sWarHorseRide(runDistance, point) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_WarHorseRide, {
            distance: runDistance,
            score: point,
            token: this._token
        });
    }
    public _s2cWarHorseRide(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setHorseSoul(message.ride_info.horse_soul);
        this.setHorseBook(message.ride_info.horse_book);
        this.setRaceCount(message.ride_info.num);
        G_SignalManager.dispatch(SignalConst.EVENT_HORSE_RACE_RIDE_END, message.awards);
    }
    public c2sWarHorseRideInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_WarHorseRideInfo, {});
    }
    public _s2cWarHorseRideInfo(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.resetTime();
        this.setHorseSoul(message.ride_info.horse_soul);
        this.setHorseBook(message.ride_info.horse_book);
        this.setRaceCount(message.ride_info.num);
        G_SignalManager.dispatch(SignalConst.EVENT_HORSE_RACE_RIDE_INFO);
    }
    public c2sWarHorseRideStart() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_WarHorseRideStart, {});
    }
    public _s2cWarHorseRideStart(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._token = message.token;
        // cc.log('1112233 token = ', this._token);
        G_SignalManager.dispatch(SignalConst.EVENT_HORSE_RACE_TOKEN);
    }
}
