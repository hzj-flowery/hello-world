import { BaseService } from "./BaseService";
import { G_SceneManager, G_UserData } from "../init";
import { FunctionConst } from "../const/FunctionConst";
import { LogicCheckHelper } from "../utils/LogicCheckHelper";
import { UserDataHelper } from "../utils/data/UserDataHelper";

export class MailDeleteService extends BaseService {
    
    constructor() {
        super();
        this.start();
    }
    public tick() {
        let runningSceneName = G_SceneManager.getRunningScene().getName();
        if (runningSceneName != 'main') {
            return;
        }
        let isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_MAIL)[0];
        if (!isOpen) {
            return;
        }
        let deleteMailIds = UserDataHelper.getExpiredMailIds();
        if (deleteMailIds.length > 0) {
            G_UserData.getMails().c2sDelAllMail(deleteMailIds);
        }
    }
}
