// import ExploreData from "../data/ExploreData";
// import ExploreBaseData from "../data/ExploreBaseData";
// import { G_UserData } from "../init";
// import ExploreMainView from "../scene/view/explore/ExploreMainView";
// import { Explore } from "../config/Explore";

// const { ccclass, property } = cc._decorator;

// @ccclass
// export default class ExploreDebug extends cc.Component {

//     private static ResArr: string[] = [
//         'config/explore',
//         'prefab/exploreMain/ExploreMainView',
//         'prefab/exploreMain/ExploreNode'
//     ];

//     onLoad() {
//         for(var i:number=0; i<3; i++){
//             ExploreDebug.ResArr.push('ui3/stage/img_explore_map1___' + i);
//         }
//         for(var i:number=1; i<=8; i++){
//             ExploreDebug.ResArr.push('ui3/explore/city/img_city' + i);
//         }
//         ExploreDebug.ResArr.push('ui3/common/img_modian');
//         ExploreDebug.ResArr.push('ui3/common/img_com_lock03');
//         cc.resources.load(ExploreDebug.ResArr, this.onLoadRes.bind(this));
//     }

//     private onLoadRes(err, resource): void {
//         Explore.ins._init();
//         var exploreData: any = G_UserData.getExplore();
//         var exploreList = new Array();
//         for (var i: number = 0; i < 7; i++) {
//             var exploreBaseData = new ExploreBaseData();
//             var data: any = {
//                 "id": i + 1,
//                 "foot_index": 1,
//                 "pass_count": 0
//             };
//             exploreBaseData.setData(ExploreBaseData.ID, data.id);
//             exploreBaseData.setData(ExploreBaseData.FOOT_INDEX, data.foot_index);
//             exploreBaseData.setData(ExploreBaseData.PASS_COUNT, data.pass_count);
//             var cfg = Explore.ins.get(data.id);
//             exploreBaseData.setData(ExploreBaseData.MAP_ID, cfg.map);
//             exploreBaseData.setData(ExploreBaseData.CONFIG_DATA, cfg);
//             exploreList.push(exploreBaseData);
//         }
//         exploreData.setData(ExploreData.EXPLORES, exploreList);

//         var prefab = cc.resources.get('prefab/exploreMain/ExploreMainView');
//         var mainView: cc.Node = cc.instantiate(prefab);
//         this.node.addChild(mainView);
//     }
// }