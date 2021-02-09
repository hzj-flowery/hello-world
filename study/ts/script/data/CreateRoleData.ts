import { BaseData } from './BaseData';
import { G_StorageManager, G_UserData, G_ConfigLoader } from '../init';
import { ConfigNameConst } from '../const/ConfigNameConst';
let CACHE_FILENAME = 'activationcode';
export class CreateRoleData extends BaseData {


    constructor (properties?) {
        super(properties);
    }
    public saveActivationCode (code) {
        G_StorageManager.save(CACHE_FILENAME, { code: code });
    }
    public getActivationCodeConfig () {
        let data = G_StorageManager.load(CACHE_FILENAME) || {};
        if (!data.code || data.code == '') {
            return null;
        }
        G_UserData.getCreateRole().saveActivationCode('');
        let AccountCode = G_ConfigLoader.getConfig(ConfigNameConst.ACCOUNTCODE);
        let config = AccountCode.get(data.code);
        return config;
    }
}