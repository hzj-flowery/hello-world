export class Assets{
public toLoad:Array<any>;
public assets:any;
public clientId:any;

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
       
    }
