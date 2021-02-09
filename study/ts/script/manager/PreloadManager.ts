import { FakeProgress } from "../../../scripts/FakeProgress";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { G_ConfigLoader, G_ProgressBarManager, G_SceneManager, G_SpineManager } from "../init";
import ResourceLoader, { ResourceData } from "../utils/resource/ResourceLoader";

const { ccclass, property } = cc._decorator;

@ccclass
export class PreloadManager extends cc.Component {
    private static readonly LOAD_PERC = 0.7;
    private static startProgress = 0;
    private static tips = [
        {
            text: '正在加载CG动画',
            progress: PreloadManager.startProgress + 0.7
        }, {
            text: '正在生成战斗场景',
            progress: 1
        }]

    public preload(name: string, callback: () => void) {
        G_ProgressBarManager.showProgress()

        G_SceneManager.getRunningSceneRootNode().active = false;
        let total = newPlayer.length;
        ResourceLoader.loadResArrayWithType(newPlayer, (completeCount: number, totalCount: number, item) => {
            let progress = completeCount / Math.max(total, totalCount) * PreloadManager.LOAD_PERC;
            G_ProgressBarManager.updateProgress(progress, PreloadManager.tips);
        }, (err) => {
            // G_SceneManager.getRunningSceneRootNode().active = true;
            this.node.active = false;
            this.parseSpine(callback);
        }, "firstfight")
    }

    private parseSpine(callback: () => void) {
        let fake = new FakeProgress();
        let ready = PreloadManager.LOAD_PERC;
        let left = 1 - ready;
        fake.run(3, (progress: number) => {
            G_ProgressBarManager.updateProgress(ready + progress * left, PreloadManager.tips);
        });

        let spines = newPlayer.filter((value) => {
            if (value.type == cc.BufferAsset) {
                return true;
            }
        });

        let length = spines.length;
        let cnt = 0;
        spines.forEach((value) => {
            G_SpineManager.loadSpine(value.path, () => {
                cnt++;
                if (cnt == length) {
                    G_ProgressBarManager.updateProgress(1);
                    fake.cancel();
                    this.scheduleOnce(() => {
                        callback();
                    }, 0.1);
                }
            })
        })
    }

    public preLoadResById(ids, completeCallback?: ((error: Error, resource: any[]) => void)) {
        if (typeof (ids) == 'number') {
            ids = [ids];
        }
        var arrRes: ResourceData[] = [];
        for (var i in ids) {
            var id = ids[i];
            var cfg = G_ConfigLoader.getConfig(ConfigNameConst.RRE_RES + id);
            if (cfg) {
                arrRes = arrRes.concat(cfg.asset.filter((value) => {
                    if (value == null) {
                        return false;
                    }
                    return true;
                }).map((value) => {
                    {
                        return {
                            path: value.path,
                            type: cc.js.getClassByName(value.type)
                        }
                    }
                }));
            }
        }
        if (arrRes.length > 0) {
            ResourceLoader.loadResArrayWithType(arrRes, null, (err, arr) => {
                // this.preLoadSpine(arrRes, ()=> {
                completeCallback && completeCallback(err, arr);
                // })
            });
        } else {
            completeCallback && completeCallback(null, null);
        }
    }

    // preLoadSpine(arrRes:any[], finishCB:Function) {
    //     if(arrRes.length > 0) {
    //         var res = arrRes.shift();
    //         if (res.type == cc.BufferAsset) {
    //             G_SpineManager.loadSpine(res.path, ()=> {
    //                 this.preLoadSpine(arrRes, finishCB);
    //             });
    //         }else {
    //             this.preLoadSpine(arrRes, finishCB);
    //         }
    //     }else {
    //         finishCB && finishCB();
    //     }
    // }
}




const newPlayer = [
    {
        "path": "audio/ui/30clickpzh1",
        "type": cc.AudioClip
    },
    {
        "path": "audio/ui/263login",
        "type": cc.AudioClip
    },
    {
        "path": "prefab/firstfight/FirstFightView",
        "type": cc.Prefab
    },
    {
        "path": "ui3/common/img_com_line01",
        "type": cc.SpriteFrame
    },
    {
        "path": "fight/scene/1_back",
        "type": cc.SpriteFrame
    },
    {
        "path": "moving/moving_gongchengmenzhandou_back",
        "type": cc.JsonAsset
    },
    {
        "path": "fight/scene/1_front",
        "type": cc.SpriteFrame
    },
    {
        "path": "moving/moving_gongchengmenzhandou_middle",
        "type": cc.JsonAsset
    },
    {
        "path": "effect/effect_scene01_fire/effect_scene01_fire",
        "type": cc.JsonAsset
    },
    {
        "path": "effect/effect_scene01_fire/effect_scene01_fire",
        "type": cc.SpriteAtlas
    },
    {
        "path": "effect/effect_nanman_huoguang/effect_nanman_huoguang",
        "type": cc.JsonAsset
    },
    {
        "path": "effect/effect_nanman_huoguang/effect_nanman_huoguang",
        "type": cc.SpriteAtlas
    },
    {
        "path": "effect/effect_scene01_nongyan01/effect_scene01_nongyan01",
        "type": cc.JsonAsset
    },
    {
        "path": "effect/effect_scene01_nongyan01/effect_scene01_nongyan01",
        "type": cc.SpriteAtlas
    },
    {
        "path": "effect/effect_scene01_huoxing/effect_scene01_huoxing",
        "type": cc.JsonAsset
    },
    {
        "path": "effect/effect_scene01_huoxing/effect_scene01_huoxing",
        "type": cc.SpriteAtlas
    },
    {
        "path": "effect/effect_gongchengmenzhandou_huoqui/effect_gongchengmenzhandou_huoqui",
        "type": cc.JsonAsset
    },
    {
        "path": "effect/effect_gongchengmenzhandou_huoqui/effect_gongchengmenzhandou_huoqui",
        "type": cc.SpriteAtlas
    },
    {
        "path": "effect/effect_xuanjue_shanguang/effect_xuanjue_shanguang",
        "type": cc.JsonAsset
    },
    {
        "path": "effect/effect_xuanjue_shanguang/effect_xuanjue_shanguang",
        "type": cc.SpriteAtlas
    },
    {
        "path": "effect/effect_taohuayuan_shuibo_1/effect_taohuayuan_shuibo_1",
        "type": cc.JsonAsset
    },
    {
        "path": "effect/effect_taohuayuan_shuibo_1/effect_taohuayuan_shuibo_1",
        "type": cc.SpriteAtlas
    },
    {
        "path": "effect/spine/gongchengmenzhandouche1",
        "type": cc.Texture2D
    },
    {
        "path": "effect/effect_scene02_fengsha/effect_scene02_fengsha",
        "type": cc.JsonAsset
    },
    {
        "path": "effect/effect_scene02_fengsha/effect_scene02_fengsha",
        "type": cc.SpriteAtlas
    },
    {
        "path": "effect/effect_chengqiangzhandou_jianyu/effect_chengqiangzhandou_jianyu",
        "type": cc.JsonAsset
    },
    {
        "path": "effect/spine/gongchengmenzhandoucao",
        "type": cc.Texture2D
    },
    {
        "path": "effect/effect_chengqiangzhandou_xiaojianjian/effect_chengqiangzhandou_xiaojianjian",
        "type": cc.JsonAsset
    },
    {
        "path": "effect/effect_chengqiangzhandou_xiaojianjian/effect_chengqiangzhandou_xiaojianjian",
        "type": cc.SpriteAtlas
    },
    {
        "path": "effect/effect_scene02_saoluoye/effect_scene02_saoluoye",
        "type": cc.JsonAsset
    },
    {
        "path": "effect/effect_scene02_saoluoye/effect_scene02_saoluoye",
        "type": cc.SpriteAtlas
    },
    {
        "path": "fight/action/201003_attacker",
        "type": cc.JsonAsset
    },
    {
        "path": "fight/action/201003_scene",
        "type": cc.JsonAsset
    },
    {
        "path": "fight/action/201003_target",
        "type": cc.JsonAsset
    },
    {
        "path": "fight/action/403003_attacker",
        "type": cc.JsonAsset
    },
    {
        "path": "fight/action/403003_scene",
        "type": cc.JsonAsset
    },
    {
        "path": "fight/action/403003_target",
        "type": cc.JsonAsset
    },
    {
        "path": "fight/action/301003_attacker",
        "type": cc.JsonAsset
    },
    {
        "path": "fight/action/301003_scene",
        "type": cc.JsonAsset
    },
    {
        "path": "fight/action/301003_target",
        "type": cc.JsonAsset
    },
    {
        "path": "fight/action/401003_attacker",
        "type": cc.JsonAsset
    },
    {
        "path": "fight/action/401003_scene",
        "type": cc.JsonAsset
    },
    {
        "path": "fight/action/401003_target",
        "type": cc.JsonAsset
    },
    {
        "path": "fight/action/damage_target",
        "type": cc.JsonAsset
    },
    {
        "path": "fight/action/dying_target",
        "type": cc.JsonAsset
    },
    {
        "path": "fight/action/idle_target",
        "type": cc.JsonAsset
    },
    {
        "path": "spine/202",
        "type": cc.Texture2D
    },
    {
        "path": "spine/202_fore_effect",
        "type": cc.Texture2D
    },
    {
        "path": "spine/202_back_effect",
        "type": cc.Texture2D
    },
    {
        "path": "spine/301",
        "type": cc.Texture2D
    },
    {
        "path": "spine/301_fore_effect",
        "type": cc.Texture2D
    },
    {
        "path": "spine/301_back_effect",
        "type": cc.Texture2D
    },
    {
        "path": "spine/201",
        "type": cc.Texture2D
    },
    {
        "path": "spine/201_fore_effect",
        "type": cc.Texture2D
    },
    {
        "path": "spine/302",
        "type": cc.Texture2D
    },
    {
        "path": "spine/302_fore_effect",
        "type": cc.Texture2D
    },
    {
        "path": "spine/402",
        "type": cc.Texture2D
    },
    {
        "path": "spine/403",
        "type": cc.Texture2D
    },
    {
        "path": "spine/403_fore_effect",
        "type": cc.Texture2D
    },
    {
        "path": "spine/401",
        "type": cc.Texture2D
    },
    {
        "path": "spine/401_fore_effect",
        "type": cc.Texture2D
    },
    {
        "path": "spine/404",
        "type": cc.Texture2D
    },
    {
        "path": "spine/404_fore_effect",
        "type": cc.Texture2D
    },
    {
        "path": "fight/effect/sp_15nuqijia",
        "type": cc.Texture2D
    },
    {
        "path": "fight/effect/se2010031",
        "type": cc.Texture2D
    },
    {
        "path": "fight/effect/se2010033",
        "type": cc.Texture2D
    },
    {
        "path": "fight/effect/se2010032",
        "type": cc.Texture2D
    },
    {
        "path": "fight/effect/se4030031",
        "type": cc.Texture2D
    },
    {
        "path": "fight/effect/se3010031",
        "type": cc.Texture2D
    },
    {
        "path": "fight/effect/se4020032",
        "type": cc.Texture2D
    },
    {
        "path": "fight/effect/se4010031",
        "type": cc.Texture2D
    },
    {
        "path": "fight/effect/qu4010033",
        "type": cc.Texture2D
    },
    {
        "path": "ui3/text/battle/zhuangtai_teshu_b_01shanbi",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/text/battle/txt_battle_crit",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/text/battle/txt_battle_heal",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/text/battle/gedang",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/text/battle/zhuangtai_teshu_b_01wudi",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/text/battle/zhuangtai_teshu_b_01xishou",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/text/battle/zhuangtai_teshu_b_01xinsheng",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/text/battle/txt_taoyuanjieyi",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/text/battle/txt_fentan",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/text/buff/buff_01nuqi",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/text/battle/num_battle_crit",
        "type": cc.SpriteAtlas
    },
    {
        "path": "ui3/text/battle/num_battle_hit",
        "type": cc.SpriteAtlas
    },
    {
        "path": "ui3/text/battle/num_battle_heal",
        "type": cc.SpriteAtlas
    },
    {
        "path": "ui3/text/battle/buff_01shuzi_labelatlas",
        "type": cc.LabelAtlas
    },
    {
        "path": "ui3/text/battle/buff_02shuzi_labelatlas",
        "type": cc.LabelAtlas
    },
    {
        "path": "ui3/battle/img_battle_hpbg",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/battle/img_battle_hpshadow",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/battle/img_battle_hp",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/battle/img_battle_bar_angebg",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/battle/img_battle_bar_ange01",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/battle/img_battle_bar_ange02",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/battle/img_battle_bar_ange03",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/battle/img_battle_bar_ange04",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/battle/img_battle_angenumbg",
        "type": cc.SpriteFrame
    },
    {
        "path": "ui3/text/battle/img_battle_angenum_labelatlas",
        "type": cc.LabelAtlas
    },
    {
        "path": "moving/moving_nuqi",
        "type": cc.JsonAsset
    },
    {
        "path": "ui3/common/img_heroshadow",
        "type": cc.SpriteFrame
    },
    {
        "path": "effect/effect_nuqi_huoyan1/effect_nuqi_huoyan1",
        "type": cc.JsonAsset
    },
    {
        "path": "effect/effect_nuqi_huoyan1/effect_nuqi_huoyan1",
        "type": cc.SpriteAtlas
    },
    {
        "path": "effect/effect_nuqi_huoyan3/effect_nuqi_huoyan3",
        "type": cc.JsonAsset
    },
    {
        "path": "effect/effect_nuqi_huoyan3/effect_nuqi_huoyan3",
        "type": cc.SpriteAtlas
    },
    {
        "path": "effect/effect_nuqi_huoyan2/effect_nuqi_huoyan2",
        "type": cc.JsonAsset
    },
    {
        "path": "effect/effect_nuqi_huoyan2/effect_nuqi_huoyan2",
        "type": cc.SpriteAtlas
    },
    {
        "path": "prefab/storyChat/PopupStoryChat",
        "type": cc.Prefab
    },
    {
        "path": "storyspine/403_big",
        "type": cc.SpriteFrame
    },
    {
        "path": "storyspine/201_big",
        "type": cc.SpriteFrame
    },
    {
        "path": "effect/spine/gongchengmenzhandouche1",
        "type": cc.BufferAsset
    },
    {
        "path": "effect/spine/gongchengmenzhandoucao",
        "type": cc.BufferAsset
    },
    {
        "path": "spine/202",
        "type": cc.BufferAsset
    },
    {
        "path": "spine/202_fore_effect",
        "type": cc.BufferAsset
    },
    {
        "path": "spine/202_back_effect",
        "type": cc.BufferAsset
    },
    {
        "path": "spine/301",
        "type": cc.BufferAsset
    },
    {
        "path": "spine/301_fore_effect",
        "type": cc.BufferAsset
    },
    {
        "path": "spine/301_back_effect",
        "type": cc.BufferAsset
    },
    {
        "path": "spine/201",
        "type": cc.BufferAsset
    },
    {
        "path": "spine/201_fore_effect",
        "type": cc.BufferAsset
    },
    {
        "path": "spine/302",
        "type": cc.BufferAsset
    },
    {
        "path": "spine/302_fore_effect",
        "type": cc.BufferAsset
    },
    {
        "path": "spine/402",
        "type": cc.BufferAsset
    },
    {
        "path": "spine/403",
        "type": cc.BufferAsset
    },
    {
        "path": "spine/403_fore_effect",
        "type": cc.BufferAsset
    },
    {
        "path": "spine/401",
        "type": cc.BufferAsset
    },
    {
        "path": "spine/401_fore_effect",
        "type": cc.BufferAsset
    },
    {
        "path": "spine/404",
        "type": cc.BufferAsset
    },
    {
        "path": "spine/404_fore_effect",
        "type": cc.BufferAsset
    },
    {
        "path": "fight/effect/sp_15nuqijia",
        "type": cc.BufferAsset
    },
    {
        "path": "fight/effect/se2010031",
        "type": cc.BufferAsset
    },
    {
        "path": "fight/effect/se2010033",
        "type": cc.BufferAsset
    },
    {
        "path": "fight/effect/se2010032",
        "type": cc.BufferAsset
    },
    {
        "path": "fight/effect/se4030031",
        "type": cc.BufferAsset
    },
    {
        "path": "fight/effect/se3010031",
        "type": cc.BufferAsset
    },
    {
        "path": "fight/effect/se4020032",
        "type": cc.BufferAsset
    },
    {
        "path": "fight/effect/se4010031",
        "type": cc.BufferAsset
    },
    {
        "path": "fight/effect/qu4010033",
        "type": cc.BufferAsset
    },
    {
        "path": "audio/BGM_fight",
        "type": cc.AudioClip
    },
    {
        "path": "audio/ui/4lvburuc",
        "type": cc.AudioClip
    },
    {
        "path": "fonts/Font_W7S_Bitmap",
        "type": cc.BitmapFont
    },
    {
        "path": "fight/scene/img_skill3bg",
        "type": cc.SpriteFrame
    },
    {
        "path": "audio/voice/201_hj",
        "type": cc.AudioClip
    },
    {
        "path": "moving/moving_hejitiaozi_duang",
        "type": cc.JsonAsset
    },
    {
        "path": "effect/effect_hejitiaozi_duang/effect_hejitiaozi_duang",
        "type": cc.JsonAsset
    },
    {
        "path": "effect/effect_hejitiaozi_duang/effect_hejitiaozi_duang",
        "type": cc.SpriteAtlas
    },
    {
        "path": "audio/fight/fy_201_skill_3",
        "type": cc.AudioClip
    },
    {
        "path": "storyspine/404_big",
        "type": cc.SpriteFrame
    },
    {
        "path": "audio/voice/403_hj",
        "type": cc.AudioClip
    },
    {
        "path": "audio/fight/fy_403_hj",
        "type": cc.AudioClip
    },
    {
        "path": "storyspine/301_big",
        "type": cc.SpriteFrame
    },
    {
        "path": "storyspine/302_big",
        "type": cc.SpriteFrame
    },
    {
        "path": "audio/voice/301_hj",
        "type": cc.AudioClip
    },
    {
        "path": "audio/fight/fy_301_hj",
        "type": cc.AudioClip
    },
    {
        "path": "storyspine/401_big",
        "type": cc.SpriteFrame
    },
    {
        "path": "audio/voice/401_hj",
        "type": cc.AudioClip
    },
    {
        "path": "audio/fight/fy_401_hj",
        "type": cc.AudioClip
    },
    {
        "path": "prefab/common/PopupMovieText",
        "type": cc.Prefab
    }
]