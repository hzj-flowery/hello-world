import { BaseService } from "./BaseService";
import { G_UserData } from "../init";

export class MineDataService extends BaseService {
    constructor() {
        super();
        this.start();
    }
    public tick() {
        G_UserData.getMineCraftData().checkTimeLimit();
    }
}
