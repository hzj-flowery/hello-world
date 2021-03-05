import { ExploreFacade } from "../scene/view/exploreMain/ExploreFacade";
import { G_UserData, G_SceneManager } from "../init";

export default class ExploreMapDebug{
    
    public static debug(): void {
        // ExploreFacade.showMain();
        G_SceneManager.showScene('exploreMain');
    }
}