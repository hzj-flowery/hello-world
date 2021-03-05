import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { ExploreConst } from "../../../const/ExploreConst";
import { ResourceData } from "../../../utils/resource/ResourceLoader";

export class ExploreResCfg {

    static MainCfg: string[] = [
        ConfigNameConst.EXPLORE,
        ConfigNameConst.EXPLORE_DISCOVER,
        ConfigNameConst.STORY_STAGE,
        ConfigNameConst.STORY_CHAPTER,
        ConfigNameConst.STORY_GENERAL_PLAN
    ];

    // static mainResArr: string[] = ExploreResCfg.getMainResArr();

    static getMainResArr(): ResourceData[] {
        var arr: ResourceData[] = [
            // 'fonts/Font_W7S',
            { path:'prefab/exploreMain/ExploreMainView', type: cc.Prefab},
            {path: 'prefab/exploreMain/ExploreNode', type: cc.Prefab},
            {path: 'ui3/common/img_modian', type: cc.SpriteFrame},
            {path: 'ui3/common/img_com_lock03', type: cc.SpriteFrame},
            {path: 'moving/moving_shuangjian', type: cc.JsonAsset},
            {path: 'ui3/stage/img_explore_map1', type: cc.JsonAsset}
        ];
        for (var i: number = 1; i <= 8; i++) {
            arr.push({
                path: 'ui3/explore/city/img_city' + i,
                type: cc.SpriteFrame,
            });
        }
        return arr;
    }

    static MapCfg: string[] = [
        ConfigNameConst.EXPLORE,
        ConfigNameConst.EXPLORE_DISCOVER,
        ConfigNameConst.EXPLORE_MAP,
        ConfigNameConst.TYPE_MANAGE,
        ConfigNameConst.ITEM,
        ConfigNameConst.HERO,
        ConfigNameConst.HERO_RES,
        ConfigNameConst.AVATAR,
        ConfigNameConst.ROLE,
        ConfigNameConst.STORY_STAGE,
        ConfigNameConst.STORY_CHAPTER,
        ConfigNameConst.STORY_GENERAL_PLAN,
        ConfigNameConst.FUNCTION_LEVEL
    ];

    static MapResArr: ResourceData[] = [
        {path: 'prefab/common/CommonHeroAvatar', type: cc.Prefab},
        {path: 'prefab/exploreMap/PopupEventBase', type: cc.Prefab},
        {path: 'prefab/exploreMap/ExploreGainNode', type: cc.Prefab},
        {path: 'prefab/exploreMap/ExploreMapViewEventIcon', type: cc.Prefab},
        {path: 'prefab/exploreMap/ExploreMapView', type: cc.Prefab},
        {path: 'prefab/exploreMap/ExploreEventCell', type: cc.Prefab},
        {path: 'icon/explore/sjxt_icon', type: cc.SpriteFrame},
        {path: 'icon/explore/bjwz_icon', type: cc.SpriteFrame},
        {path: 'icon/explore/lyzl_icon', type: cc.SpriteFrame},
        {path: 'icon/explore/mmel_icon', type: cc.SpriteFrame},
        {path: 'icon/explore/dzzl_icon', type: cc.SpriteFrame},
        {path: 'ui3/text/explore/txt_bjwz', type: cc.SpriteFrame},
        {path: 'ui3/text/explore/txt_dzzl', type: cc.SpriteFrame},
        {path: 'ui3/text/explore/txt_lyzl', type: cc.SpriteFrame},
        {path: 'ui3/text/explore/txt_mmel', type: cc.SpriteFrame},
        {path: 'ui3/text/explore/txt_sjxt', type: cc.SpriteFrame},
        {path: 'ui3/text/explore/txt_stbx', type: cc.SpriteFrame},
        {path: 'ui3/text/explore/txt_tgbx', type: cc.SpriteFrame},
        {path: 'ui3/explore/img_road', type: cc.SpriteFrame},
        {path: 'ui3/explore/img_road2', type: cc.SpriteFrame},
        {path: 'ui3/explore/img_road3', type: cc.SpriteFrame},
        {path: 'ui3/explore/img_road4', type: cc.SpriteFrame},
        {path: 'ui3/explore/img_road5', type: cc.SpriteFrame},
        {path: 'ui3/explore/img_road6', type: cc.SpriteFrame},
        {path: 'ui3/explore/img_sjxt', type: cc.SpriteFrame},
        {path: 'ui3/explore/img_bjwz', type: cc.SpriteFrame},
        {path: 'ui3/explore/img_dzzl', type: cc.SpriteFrame},
        {path: 'ui3/explore/img_mmel', type: cc.SpriteFrame},
        {path: 'ui3/explore/img_smbx', type: cc.SpriteFrame},
        {path: 'ui3/explore/img_lyzl', type: cc.SpriteFrame},
        {path: 'ui3/explore/discover/img_baoxiang01', type: cc.SpriteFrame},
        {path: 'ui3/explore/txt_youli_tingzhi01', type: cc.SpriteFrame},
        {path: 'ui3/explore/txt_youli_kaishi01', type: cc.SpriteFrame},
        {path: 'effect/spine/ui101', type: cc.Texture2D},
        {path: 'moving/moving_youli_txt', type: cc.JsonAsset},
        {path: 'moving/moving_youli_baoji', type: cc.SpriteFrame},
        {path: 'moving/moving_chufaqiyu', type: cc.SpriteFrame},
        {path: 'moving/moving_youli_baozha', type: cc.SpriteFrame},
        {path: 'ui3/text/system/txt_sys_tongguanbaoxiang', type: cc.SpriteFrame},
        {path: 'ui3/text/system/txt_sys_shoutongbaoxiang', type: cc.SpriteFrame},
        {path: 'ui3/explore/img_txt_erbei', type: cc.SpriteFrame},
        {path: 'ui3/explore/img_txt_sibei', type: cc.SpriteFrame},
        {path: 'ui3/explore/img_txt_babei', type: cc.SpriteFrame},
    ];

    static EventCfg: string[] = [
        ConfigNameConst.EXPLORE,
        ConfigNameConst.EXPLORE_DISCOVER,
        ConfigNameConst.EXPLORE_ANSWER,
        ConfigNameConst.TYPE_MANAGE,
        ConfigNameConst.ITEM,
        ConfigNameConst.HERO,
        ConfigNameConst.HERO_RES,
        ConfigNameConst.EXPLORE_HERO,
        ConfigNameConst.SHOP_RANDOM_ITEMS,
        ConfigNameConst.FRAGMENT,
        ConfigNameConst.EXPLORE_REBEL
    ];

    private static AnswerEventResArr: ResourceData[] = [
        {path: 'prefab/exploreMap/EventAnswerCell', type: cc.Prefab},
        {path: 'prefab/exploreMap/EventAnswerNode', type: cc.Prefab},
        {path: 'icon/resourcemini/1', type: cc.SpriteFrame}
    ];
    private static HeroEventResArr: ResourceData[] = [
        {path: 'prefab/exploreMap/EventHeroNode', type: cc.Prefab},
        {path: 'ui3/text/signet/img_com_camp03', type: cc.SpriteFrame}
    ];
    private static HalfPriceEventResArr: ResourceData[] = [
        {path: 'prefab/exploreMap/EventHalfPriceNode', type: cc.Prefab},
        {path: 'prefab/exploreMap/EventHalfPriceCell', type: cc.Prefab}
    ];
    private static RebelEventResArr: ResourceData[] = [
        {path: 'prefab/exploreMap/EventRebelNode', type: cc.Prefab}
    ];
    private static RebelBossEventResArr: ResourceData[] = [
        {path: 'prefab/exploreMap/EventRebelBossNode', type: cc.Prefab}
    ];
    private static _EventResArrs;
    public static getEventResArrs() {
        if (!this._EventResArrs) {
            this._EventResArrs = {};
            this._EventResArrs[ExploreConst.EVENT_TYPE_ANSWER] = this.AnswerEventResArr;
            this._EventResArrs[ExploreConst.EVENT_TYPE_HERO] = this.HeroEventResArr;
            this._EventResArrs[ExploreConst.EVENT_TYPE_HALP_PRICE] = this.HalfPriceEventResArr;
            this._EventResArrs[ExploreConst.EVENT_TYPE_REBEL] = this.RebelEventResArr;
            this._EventResArrs[ExploreConst.EVENT_TYPE_REBEL_BOSS] = this.RebelBossEventResArr;
        }
        return this._EventResArrs;
    }
}