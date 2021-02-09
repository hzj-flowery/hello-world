export class Attachment{
public name:any;

        constructor(name){
            if (name == null)
                throw new Error("name cannot be null.");
            this.name = name;
        }
       
    }
