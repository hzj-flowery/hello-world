import { HeroDataHelper } from "./data/HeroDataHelper";
import { assert } from "./GlobleFunc";
import { stringUtil } from "./StringUtil";
import { G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { Path } from "./Path";

export namespace HeroAudioHelper {
    export function getVoiceResNames(id) {
        var heroInfo = HeroDataHelper.getHeroConfig(id);
        var resId = heroInfo.res_id;
        var names = HeroAudioHelper.getVoiceResNamesWithResId(resId);
        return names;
    };
    export function getVoiceResNamesWithResId(resId) {
        var resInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES).get(resId);
      //assert((resInfo, ('hero_res config can not find id = %d').format(resId));
        var names = [];
        var voice = resInfo.voice;
        if (voice != '' && voice != '0') {
            names = stringUtil.split(voice, '|');
        }
        return names;
    };
    export function getRandomVoiceName(id) {
        var names = HeroAudioHelper.getVoiceResNames(id);
        var index = Math.floor(Math.random() * names.length);
        return names[index];
    };
    export function getVoiceRes(id) {
        var res = null;
        var name = HeroAudioHelper.getRandomVoiceName(id);
        if (name) {
            res = Path.getHeroVoice(name);
        }
        return res;
    };
}