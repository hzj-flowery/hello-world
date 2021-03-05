import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
export interface KarmaData {
    getHero_base_id(): any[]
    setHero_base_id(value: any[]): void
    getLastHero_base_id(): any[]
    getDestiny_id(): any[]
    setDestiny_id(value: any[]): void
    getLastDestiny_id(): any[]
}
let schema = {};
schema['hero_base_id'] = [
    'object',
    {}
];
schema['destiny_id'] = [
    'object',
    {}
];
export class KarmaData extends BaseData{
    public static schema = schema;
    constructor(){
        super();
        this._heroBaseIds = {};
        this._destinyIds = {};
        this._recvGetDestiny = G_NetworkManager.add(MessageIDConst.ID_S2C_GetDestiny, this._s2cGetDestiny.bind(this));
        this._recvHeroActiveDestiny = G_NetworkManager.add(MessageIDConst.ID_S2C_HeroActiveDestiny, this._s2cHeroActiveDestiny.bind(this));
    }
    private _heroBaseIds;
    private _destinyIds;
    private _recvGetDestiny;
    private _recvHeroActiveDestiny;

    public clear() {
        this._recvGetDestiny.remove();
        this._recvGetDestiny = null;
        this._recvHeroActiveDestiny.remove();
        this._recvHeroActiveDestiny = null;
    }
    public reset(){
        this._heroBaseIds = {};
        this._destinyIds = {};
    }
    public _s2cGetDestiny(id, message) {
        this._heroBaseIds = {};
        this._destinyIds = {};
        var heroBaseIds = message['hero_base_id'] || [];
        this.setHero_base_id(heroBaseIds);
        for (let i in heroBaseIds) {
            var baseId = heroBaseIds[i];
            this._heroBaseIds['k_' + (baseId)] = true;
        }
        var destinyIds = message['destiny_id'] || [];
        this.setDestiny_id(destinyIds);
        for (var i in destinyIds) {
            var destinyId = destinyIds[i];
            this._destinyIds['k_' + (destinyId)] = true;
        }
    }
    public insertData(data) {
        this._heroBaseIds['k_'+(data.base_id)] = true;
        var heroBaseIds = this.getHero_base_id();
        heroBaseIds.push(data.base_id)
        this.setHero_base_id(heroBaseIds);
    }
    public isActivated (id) {
        var is = this._destinyIds['k_' + (id)];
        if (is == null) {
            return false;
        }
        return is;
    }
    public isHaveHero(baseId) {
        var is = this._heroBaseIds['k_' + (baseId)];
        if (is == null) {
            return false;
        }
        return is;
    }
    public c2sHeroActiveDestiny(heroId, destinyId, heroUid) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_HeroActiveDestiny, {
            hero_uid: heroUid,
            hero_base_id: heroId,
            destiny_id: destinyId
        });
    }
    public _s2cHeroActiveDestiny(id, message) {
        if (message.ret == MessageErrorConst.RET_OK) {
            var destinyId = message.destiny_id;
            this._destinyIds['k_' + (destinyId)] = true;
            var destinyIds = this.getDestiny_id();
            destinyIds.push(destinyId)
            this.setDestiny_id(destinyIds);
            G_SignalManager.dispatch(SignalConst.EVENT_HERO_KARMA_ACTIVE_SUCCESS, destinyId);
        }
    }

}