const decodeUuid = require('./decode-uuid');
const fs = require('fs');
const path = require('path');
const Meta = require('./metas/meta');
const texture2d = require('./metas/texture2d');

class Bundle {
    constructor(name, md5, project, remote) {
        this.project = project;
        this.name = name;
        this.md5 = md5;
        this.remote = remote;
        this.filesContent = {};

        this.parseSettings();
    }

    parseSettings() {
        this.config = require(this.getConfigPath());

        this.parseVersions();
        this.parsePaths();
        this.parsePacks();
    }

    parseVersions() {
        this.versions = {};
        let versions = this.config.versions;
        let uuids = this.config.uuids;

        let uuid;
        for (let key in versions) {
            let md5Entries = versions[key];
            let md5Infoes = this.versions[key] = {};
            for (let i = 0; i < md5Entries.length; i += 2) {
                if (typeof md5Entries[i] == 'number') {
                    uuid = uuids[md5Entries[i]];
                } else {
                    uuid = md5Entries[i];
                }
                uuid = decodeUuid(uuid);
                md5Infoes[uuid] = md5Entries[i + 1];
            }
        }
    }

    parsePaths() {
        this.decodedUuidsMap = {};
        this.assetInfoes = {};
        let paths = this.config.paths;
        let types = this.config.types;
        let uuids = this.config.uuids;

        for (let id in paths) {
            let asset = paths[id];
            let url = asset[0];
            let type = (types && types[asset[1]]) || asset[1];
            let isSubAsset = !!asset[2];
            let enUuid = uuids && uuids[id] || id;
            let uuid = decodeUuid(enUuid);
            this.decodedUuidsMap[uuid] = enUuid;
            this.assetInfoes[uuid] = {
                url: url,
                type: type,
                isSubAsset: isSubAsset,
                uuid: uuid
            }
        }
    }

    parsePacks() {
        let packs = this.config.packs;
        let uuids = this.config.uuids;
        this.packInfoes = {};

        for (let k in packs) {
            let assets = packs[k];
            for (let i = 0; i < assets.length; i++) {
                let v = assets[i]
                let uuid
                if (typeof v == "number") {
                    uuid = uuids[v];
                } else {
                    uuid = v
                }
                uuid = decodeUuid(uuid);
                this.packInfoes[uuid] = {
                    file: k,
                    index: i
                }
            }
        }
    }

    getAssetInfo(uuid) {
        return this.assetInfoes[uuid]
    }

    getAssetMeta(uuid) {
        let inPackage = false;
        let name, index;
        let pack = this.packInfoes[uuid];
        if (pack) {
            inPackage = true;
            name = pack.file;
            index = pack.index;
        } else {
            name = uuid;
        }


        let fileName = this.getImportFile(name);

        let meta = this.filesContent[name];
        if (!meta) {
            let content = JSON.parse(fs.readFileSync(fileName));
            if (!(content instanceof Array) && content.type == 'cc.Texture2D') {
                meta = new texture2d(content);
            } else {
                meta = new Meta(content);
            }

            this.filesContent[name] = meta;
        }

        if (inPackage) {
            return meta.getMetaByIndex(index);
        } else {
            return meta.content;
        }
    }

    flush() {
        for (let name in this.filesContent) {
            let meta = this.filesContent[name];

            let fileName = this.getImportFile(name);
            let dir = path.dirname(fileName);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(fileName, meta.toString());
        }
    }

    getAssetUrl(uuid) {
        return (this.assetInfoes[uuid] && this.assetInfoes[uuid].url) || uuid;
    }

    getFileName(name) {

    }

    getDecodedUuidsMap() {
        return this.decodedUuidsMap;
    }

    getBundleDir() {
        if (this.remote) {
            return path.join(this.project, 'remote', this.name);
        } 
        return path.join(this.project, 'assets', this.name);
    }

    getConfigPath() {
        return path.join(this.getBundleDir(), `config.${this.md5}.json`);
    }

    getImportFile(name) {
        let md5 = this.versions.import[name];
        let fileName;
        if (!md5) {
            // throw new Error('can not find asset meta file:' + uuid + ' fileName:' + name);
            fileName = `${name}.json`
        } else {
            fileName = `${name}.${md5}.json`;
        }
        return path.join(this.getBundleDir(), 'import', fileName.substr(0, 2), fileName)
    }
}

module.exports = Bundle;