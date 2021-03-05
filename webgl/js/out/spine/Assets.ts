export class Assets{

        constructor(clientId){
            this.toLoad = new Array();
            this.assets = {};
            this.clientId = clientId;
        }
        public loaded() {
            var i = 0;
            for (var v in this.assets)
                i++;
            return i;
        };
        return Assets;
    }