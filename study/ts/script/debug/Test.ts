import { init, G_UserData, G_SceneManager } from "../init";
import { ReportParser } from "../fight/report/ReportParser";
import { BattleDataHelper } from "../utils/data/BattleDataHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Test extends cc.Component {

  start() {
    cc.game.addPersistRootNode(this.node);

    init(this.run, this);
  }

  private run() {
    this._enterFightView();
  }

  private _enterFightView() {
    // let message: any = this.testExecuteStageMessage;
    // let isFirstPass: any = false;
    // let stageId: any = this.testExecuteStageMessage.stage_id;

    // let stageData = G_UserData.getStage().getStageById(stageId)
    // let stageInfo = stageData.getConfigData();

    // let reportData = ReportParser.parse(this.testReport)

    // let battleData = BattleDataHelper.parseNormalDungeonData(message, stageInfo, false, isFirstPass)
    // G_SceneManager.showScene('fight', reportData, battleData);

    // this.saveForWebBrowser(this.testReport, "report-"+ new Date().toLocaleString());
    let reportData = ReportParser.parse(this.testReport)
    // let battleData = BattleDataHelper.parseSeasonSportData(this.testReport, false)
    let battleData = BattleDataHelper.parseSeasonSportData(this.testReport, false)
    G_SceneManager.showScene('fight', reportData, battleData);
  }

  private saveForWebBrowser(json: any, FileName: string) {
    let JsonString = JSON.stringify(json, null, 1);
    if (cc.sys.isBrowser) {
      let textFileAsBlob = new Blob([JsonString]);
      let downloadLink = document.createElement("a");
      downloadLink.download = FileName;
      downloadLink.innerHTML = "Download File";
      if (window.URL != null) {
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
      }
      else {
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = () => {
          document.body.removeChild(downloadLink);
        };
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
      }
      downloadLink.click();
    }
  }


  private testReport = {
    "attack_base_id": 1,
    "attack_hurt": 158625,
    "attack_name": "勇武方杰",
    "attack_officer_level": 0,
    "attack_power": 4516171,
    "defense_base_id": 0,
    "defense_name": "",
    "defense_officer_level": 0,
    "defense_power": 0,
    "first_order": 1,
    "is_win": true,
    "max_round_num": 10,
    "pk_type": 1,
    "skill_ids": [
     1080010,
     2050030,
     10010,
     2060020,
     20600109,
     2020020,
     1080020,
     10800109,
     2060010,
     10022,
     2030020,
     7100060,
     2030010
    ],
    "version": 20105,
    "waves": [
     {
      "members": [
       {
        "pos": 2,
        "knight_id": 1,
        "monster_id": 0,
        "max_hp": "122665",
        "hp": "122665",
        "anger": 2,
        "rank_lv": 0,
        "instrument_id": 0,
        "instrument_rank": 0,
        "camp": 1,
        "is_user": true,
        "is_leader": true,
        "limit_lv": 0
       },
       {
        "pos": 3,
        "knight_id": 203,
        "monster_id": 0,
        "max_hp": "134400",
        "hp": "134400",
        "anger": 2,
        "rank_lv": 0,
        "instrument_id": 0,
        "instrument_rank": 0,
        "camp": 1,
        "is_user": true,
        "is_leader": false,
        "limit_lv": 0
       },
       {
        "pos": 1,
        "knight_id": 108,
        "monster_id": 0,
        "max_hp": "109650",
        "hp": "109650",
        "anger": 2,
        "rank_lv": 0,
        "instrument_id": 0,
        "instrument_rank": 0,
        "camp": 1,
        "is_user": true,
        "is_leader": false,
        "limit_lv": 0
       },
       {
        "pos": 1,
        "knight_id": 205,
        "monster_id": 11012091,
        "max_hp": "62338",
        "hp": "62338",
        "anger": 4,
        "rank_lv": 2,
        "instrument_id": 0,
        "instrument_rank": 0,
        "camp": 2,
        "is_user": false,
        "is_leader": false,
        "limit_lv": 0
       },
       {
        "pos": 3,
        "knight_id": 206,
        "monster_id": 11012093,
        "max_hp": "62338",
        "hp": "62338",
        "anger": 4,
        "rank_lv": 2,
        "instrument_id": 0,
        "instrument_rank": 0,
        "camp": 2,
        "is_user": false,
        "is_leader": false,
        "limit_lv": 0
       },
       {
        "pos": 5,
        "knight_id": 202,
        "monster_id": 11012095,
        "max_hp": "68571",
        "hp": "68571",
        "anger": 4,
        "rank_lv": 2,
        "instrument_id": 0,
        "instrument_rank": 0,
        "camp": 2,
        "is_user": false,
        "is_leader": false,
        "limit_lv": 0
       }
      ],
      "members_final": [
       {
        "pos": 2,
        "knight_id": 1,
        "monster_id": 0,
        "max_hp": "122665",
        "hp": "115155",
        "anger": 0,
        "rank_lv": 0,
        "instrument_id": 0,
        "instrument_rank": 0,
        "camp": 1,
        "is_user": true,
        "is_leader": true,
        "limit_lv": 0
       },
       {
        "pos": 3,
        "knight_id": 203,
        "monster_id": 0,
        "max_hp": "134400",
        "hp": "112266",
        "anger": 0,
        "rank_lv": 0,
        "instrument_id": 0,
        "instrument_rank": 0,
        "camp": 1,
        "is_user": true,
        "is_leader": false,
        "limit_lv": 0
       },
       {
        "pos": 1,
        "knight_id": 108,
        "monster_id": 0,
        "max_hp": "109650",
        "hp": "72011",
        "anger": 0,
        "rank_lv": 0,
        "instrument_id": 0,
        "instrument_rank": 0,
        "camp": 1,
        "is_user": true,
        "is_leader": false,
        "limit_lv": 0
       }
      ],
      "rounds": [
       {
        "round_index": 1,
        "attacks": [
         {
          "attack_pos": {
           "order_pos": 65536,
           "member_info": 65546
          },
          "type": 0,
          "skill_id": 7100060,
          "attack_infos": [
           {
            "defense_member": {
             "order_pos": 131073,
             "member_info": 205
            },
            "type": 1,
            "value": 0,
            "is_live": true,
            "actual_value": 0
           },
           {
            "defense_member": {
             "order_pos": 131075,
             "member_info": 206
            },
            "type": 1,
            "value": 0,
            "is_live": true,
            "actual_value": 0
           },
           {
            "defense_member": {
             "order_pos": 131077,
             "member_info": 202
            },
            "type": 1,
            "value": 0,
            "is_live": true,
            "actual_value": 0
           }
          ],
          "add_buffs": [
           {
            "new_id_and_remove_id": 65536,
            "member": {
             "order_pos": 131073,
             "member_info": 205
            },
            "buff_id": 2376,
            "show_type": 3,
            "add_member": {
             "order_pos": 65536,
             "member_info": 65546
            },
            "skill_id": 7100060,
            "round": 99,
            "pet_id": 10
           },
           {
            "new_id_and_remove_id": 131072,
            "member": {
             "order_pos": 131075,
             "member_info": 206
            },
            "buff_id": 2376,
            "show_type": 3,
            "add_member": {
             "order_pos": 65536,
             "member_info": 65546
            },
            "skill_id": 7100060,
            "round": 99,
            "pet_id": 10
           },
           {
            "new_id_and_remove_id": 196608,
            "member": {
             "order_pos": 131077,
             "member_info": 202
            },
            "buff_id": 2376,
            "show_type": 3,
            "add_member": {
             "order_pos": 65536,
             "member_info": 65546
            },
            "skill_id": 7100060,
            "round": 99,
            "pet_id": 10
           }
          ],
          "is_live": true,
          "attack_hero_info": 16842762
         },
         {
          "attack_pos": {
           "order_pos": 65537,
           "member_info": 108
          },
          "type": 0,
          "skill_id": 1080010,
          "attack_infos": [
           {
            "defense_member": {
             "order_pos": 131073,
             "member_info": 205
            },
            "type": 1,
            "value": 13526,
            "is_live": true,
            "actual_value": 13526
           }
          ],
          "angers": [
           {
            "member": {
             "order_pos": 65537,
             "member_info": 108
            },
            "stype_and_show_type": 999,
            "buff_id": 2101,
            "type": 2,
            "value": 2
           }
          ],
          "is_live": true,
          "attack_hero_info": 65644
         },
         {
          "attack_pos": {
           "order_pos": 131073,
           "member_info": 205
          },
          "type": 0,
          "skill_id": 2050030,
          "attack_infos": [
           {
            "defense_member": {
             "order_pos": 65537,
             "member_info": 108
            },
            "type": 1,
            "value": 27153,
            "hurt_infos": [
             {
              "id": 2,
              "value": 0
             }
            ],
            "is_live": true,
            "actual_value": 27153
           }
          ],
          "angers": [
           {
            "member": {
             "order_pos": 131073,
             "member_info": 205
            },
            "stype_and_show_type": 999,
            "buff_id": 2102,
            "type": 1,
            "value": 4
           },
           {
            "member": {
             "order_pos": 131073,
             "member_info": 205
            },
            "stype_and_show_type": 65538,
            "buff_id": 2108,
            "type": 2,
            "value": 1
           }
          ],
          "is_live": true,
          "attack_hero_info": 131277
         },
         {
          "attack_pos": {
           "order_pos": 65538,
           "member_info": 1
          },
          "type": 0,
          "skill_id": 10010,
          "attack_infos": [
           {
            "defense_member": {
             "order_pos": 131073,
             "member_info": 205
            },
            "type": 1,
            "value": 15788,
            "is_live": true,
            "actual_value": 15788
           }
          ],
          "angers": [
           {
            "member": {
             "order_pos": 65538,
             "member_info": 1
            },
            "stype_and_show_type": 999,
            "buff_id": 2101,
            "type": 2,
            "value": 2
           }
          ],
          "is_live": true,
          "attack_hero_info": 65537
         },
         {
          "attack_pos": {
           "order_pos": 131075,
           "member_info": 206
          },
          "type": 0,
          "skill_id": 2060020,
          "attack_infos": [
           {
            "defense_member": {
             "order_pos": 65537,
             "member_info": 108
            },
            "type": 1,
            "value": 10486,
            "is_live": true,
            "actual_value": 10486
           },
           {
            "defense_member": {
             "order_pos": 65538,
             "member_info": 1
            },
            "type": 1,
            "value": 7510,
            "is_live": true,
            "actual_value": 7510
           },
           {
            "defense_member": {
             "order_pos": 65539,
             "member_info": 203
            },
            "type": 1,
            "value": 10038,
            "is_live": true,
            "actual_value": 10038
           }
          ],
          "angers": [
           {
            "member": {
             "order_pos": 131075,
             "member_info": 206
            },
            "stype_and_show_type": 999,
            "buff_id": 2102,
            "type": 1,
            "value": 4
           }
          ],
          "is_live": true,
          "attack_hero_info": 131278
         },
         {
          "attack_pos": {
           "order_pos": 131075,
           "member_info": 206
          },
          "type": 2,
          "skill_id": 20600109,
          "battle_effects": [
           {
            "member": {
             "order_pos": 131075,
             "member_info": 206
            },
            "attack_member": {
             "order_pos": 131075,
             "member_info": 206
            },
            "buff_id": 2307,
            "skill_id": 20600109,
            "pet_id": 206,
            "is_live": true
           }
          ],
          "attack_infos": [
           {
            "defense_member": {
             "order_pos": 65539,
             "member_info": 203
            },
            "type": 1,
            "value": 5898,
            "is_live": true,
            "actual_value": 5898
           }
          ],
          "is_live": true,
          "attack_hero_info": 131278
         },
         {
          "attack_pos": {
           "order_pos": 65539,
           "member_info": 203
          },
          "type": 0,
          "skill_id": 2030010,
          "attack_infos": [
           {
            "defense_member": {
             "order_pos": 131077,
             "member_info": 202
            },
            "type": 1,
            "value": 10200,
            "hurt_infos": [
             {
              "id": 2,
              "value": 0
             }
            ],
            "is_live": true,
            "actual_value": 10200
           }
          ],
          "angers": [
           {
            "member": {
             "order_pos": 65539,
             "member_info": 203
            },
            "stype_and_show_type": 999,
            "buff_id": 2101,
            "type": 2,
            "value": 2
           }
          ],
          "is_live": true,
          "attack_hero_info": 65739
         },
         {
          "attack_pos": {
           "order_pos": 131077,
           "member_info": 202
          },
          "type": 0,
          "skill_id": 2020020,
          "attack_infos": [
           {
            "defense_member": {
             "order_pos": 131073,
             "member_info": 205
            },
            "type": 2,
            "value": 3105,
            "is_live": true,
            "actual_value": 3105
           },
           {
            "defense_member": {
             "order_pos": 131075,
             "member_info": 206
            },
            "type": 2,
            "value": 3192,
            "is_live": true,
            "actual_value": 0
           },
           {
            "defense_member": {
             "order_pos": 131077,
             "member_info": 202
            },
            "type": 2,
            "value": 3352,
            "is_live": true,
            "actual_value": 3352
           }
          ],
          "angers": [
           {
            "member": {
             "order_pos": 131077,
             "member_info": 202
            },
            "stype_and_show_type": 999,
            "buff_id": 2102,
            "type": 1,
            "value": 4
           }
          ],
          "is_live": true,
          "attack_hero_info": 131274
         }
        ],
        "wave_index": 1
       },
       {
        "round_index": 2,
        "attacks": [
         {
          "attack_pos": {
           "order_pos": 65537,
           "member_info": 108
          },
          "type": 0,
          "skill_id": 1080020,
          "attack_infos": [
           {
            "defense_member": {
             "order_pos": 131073,
             "member_info": 205
            },
            "type": 1,
            "value": 23389,
            "is_live": true,
            "actual_value": 23389
           },
           {
            "defense_member": {
             "order_pos": 131075,
             "member_info": 206
            },
            "type": 1,
            "value": 0,
            "hurt_infos": [
             {
              "id": 1,
              "value": 0
             }
            ],
            "is_live": true,
            "actual_value": 0
           }
          ],
          "angers": [
           {
            "member": {
             "order_pos": 65537,
             "member_info": 108
            },
            "stype_and_show_type": 999,
            "buff_id": 2102,
            "type": 1,
            "value": 4
           }
          ],
          "is_live": true,
          "attack_hero_info": 65644
         },
         {
          "attack_pos": {
           "order_pos": 65537,
           "member_info": 108
          },
          "type": 2,
          "skill_id": 10800109,
          "battle_effects": [
           {
            "member": {
             "order_pos": 65537,
             "member_info": 108
            },
            "attack_member": {
             "order_pos": 65537,
             "member_info": 108
            },
            "buff_id": 2307,
            "skill_id": 10800109,
            "pet_id": 108,
            "is_live": true
           }
          ],
          "attack_infos": [
           {
            "defense_member": {
             "order_pos": 131073,
             "member_info": 205
            },
            "type": 1,
            "value": 13013,
            "is_live": false,
            "actual_value": 12740
           }
          ],
          "is_live": true,
          "attack_hero_info": 65644
         },
         {
          "attack_pos": {
           "order_pos": 131075,
           "member_info": 206
          },
          "type": 0,
          "skill_id": 2060010,
          "attack_infos": [
           {
            "defense_member": {
             "order_pos": 65539,
             "member_info": 203
            },
            "type": 1,
            "value": 6198,
            "is_live": true,
            "actual_value": 6198
           }
          ],
          "angers": [
           {
            "member": {
             "order_pos": 131075,
             "member_info": 206
            },
            "stype_and_show_type": 999,
            "buff_id": 2101,
            "type": 2,
            "value": 2
           }
          ],
          "is_live": true,
          "attack_hero_info": 131278
         },
         {
          "attack_pos": {
           "order_pos": 65538,
           "member_info": 1
          },
          "type": 0,
          "skill_id": 10022,
          "attack_infos": [
           {
            "defense_member": {
             "order_pos": 131075,
             "member_info": 206
            },
            "type": 1,
            "value": 55428,
            "is_live": true,
            "actual_value": 55428
           }
          ],
          "angers": [
           {
            "member": {
             "order_pos": 65538,
             "member_info": 1
            },
            "stype_and_show_type": 999,
            "buff_id": 2102,
            "type": 1,
            "value": 4
           }
          ],
          "is_live": true,
          "attack_hero_info": 65537
         },
         {
          "attack_pos": {
           "order_pos": 131077,
           "member_info": 202
          },
          "type": 0,
          "buff_effects": [
           {
            "id": 3,
            "type": 1,
            "value": 122665,
            "actual_value": 61723
           }
          ],
          "is_live": false,
          "attack_hero_info": 131274
         },
         {
          "attack_pos": {
           "order_pos": 65539,
           "member_info": 203
          },
          "type": 0,
          "skill_id": 2030020,
          "attack_infos": [
           {
            "defense_member": {
             "order_pos": 131075,
             "member_info": 206
            },
            "type": 1,
            "value": 27281,
            "is_live": false,
            "actual_value": 6910
           }
          ],
          "angers": [
           {
            "member": {
             "order_pos": 65539,
             "member_info": 203
            },
            "stype_and_show_type": 999,
            "buff_id": 2102,
            "type": 1,
            "value": 4
           }
          ],
          "is_live": true,
          "attack_hero_info": 65739
         }
        ],
        "wave_index": 1
       }
      ],
      "init_buff": [],
      "first_order": 1,
      "pets": [
       {
        "camp": 1,
        "pet_base_id": 10,
        "pet_star": 5
       }
      ]
     }
    ]
   }
}
