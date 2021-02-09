import { ReportParser } from "../../../fight/report/ReportParser";
import ResourceLoader from "../../../utils/resource/ResourceLoader";

const {ccclass, property} = cc._decorator;

@ccclass
export class LoadLogger extends cc. Component {
    private running: boolean;

    @property(cc.Label)
    public buttonLabel: cc.Label = null;
    public resources: {[key: string]: any}
    public uuidTables: {[key: string]: {path: string, type: string}};

    onLoad() {
        this.running = false;
        this.buttonLabel.string = '开始';
        if (true || !CC_DEBUG || !cc.sys.isBrowser) {
            this.node.active = false;
            return;
        }

        this.uuidTables = {};
        //统计下载的资源
        // let assetTables = (cc.loader as any)._assetTables['assets']
        // let pathToUuid = assetTables._pathToUuid;
        // for (let k in pathToUuid) {
        //     let uuids = pathToUuid[k];
        //     if (Array.isArray(uuids)) {
        //         uuids.forEach((u) => {
        //             this.uuidTables[u.uuid] = {path: k, type: u.type.name};
        //         })
        //     } else {
        //         this.uuidTables[uuids.uuid] = {path :k, type: uuids.type.name};
        //     }
        // }

        ResourceLoader.loadLog = this;
    }

    public logResources(resources) {
        if (!this.running) {
            return;
        }
        if (Array.isArray(resources)) {
            resources.forEach((r) => {
                let uuid = r.uuid;
                if (uuid) {
                    this.resources[uuid] = this.uuidTables[uuid];
                }
            })
        } else if (typeof resources == 'object') {
            let uuid = resources.uuid;
            if (uuid) {
                this.resources[uuid] = this.uuidTables[uuid];
            }
        }
    }


    public onClickLogger() {
        if (this.running) {
            this.stop();
        } else {
            this.startLog();
        }
    }

    private startLog() {
        this.running = true;
        this.resources = {};
        this.buttonLabel.string = '停止';
    }

    private stop() {
        this.running = false;
        let resources = []
        for (let k in this.resources) {
            resources.push(this.resources[k])
        }
        ReportParser.saveForWebBrowser(resources, 'resources-' + new Date().toLocaleString() + '.json')
        this.resources = null;
        this.buttonLabel.string = '开始';
    }

    onDestroy() {
        this.stop();
    }
}