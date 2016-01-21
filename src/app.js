
cc.Node.prototype.runActionAsync = function(action, stream){
    stream.runActionWrapper(this,action);    
};

var AsyncStream = function(){
    
    this.streamID = AsyncStream.prototype.streamID++;
    this.actionlist = [];
    this.actionCnt = 0;
    this.idle = true;
    
    var check  = new cc.CallFunc(function(){
        this.idle = false;
        this.actionCnt--;
        cc.log("done action in streamID =", this.streamID, ", size =", this.actionCnt);
        if(this.actionCnt>0){
            var next = this.actionlist.shift();
            switch(next.label){
                case "runAction":
                    next.target.runAction(next.action);
                    break;
                default:
                    cc.log("Invalid event lavel");
                    break;
            }
        }else{
            this.idle = true;
        }
    }, this);
    
    this.runActionWrapper = function(target,action){
        
        var wrapperAction = new cc.Sequence([action,check]);
        
        this.actionlist.push({ label : "runAction", target : target, action : wrapperAction });
        this.actionCnt++;
        cc.log("Add action to streamID =", this.streamID, ", size =", this.actionCnt);
        
        if(this.idle){ 
            // todo:
            this.actionCnt++;
            cc.log("Add action to streamID =", this.streamID, ", size =", this.actionCnt);
            check.execute();
        }
    };
};

AsyncStream.prototype.streamID=0;

var HelloWorldLayer = cc.LayerColor.extend({
    sprite:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super(cc.color(128,128, 128,128));

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        var helloLabel = new cc.LabelTTF("Hello World", "Arial", 38);
        // position the label on the center of the screen
        helloLabel.x = size.width / 2;
        helloLabel.y = size.height / 2 + 200;
        // add the label as a child to this layer
        this.addChild(helloLabel, 5);

        // add "HelloWorld" splash screen"
        this.sprite = new cc.Sprite(res.HelloWorld_png);
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2
        });
        this.addChild(this.sprite, 0);
        
        

        var koma_b = new cc.Sprite(res.koma_blk);
        koma_b.attr({
            x: 50,
            y: 50,
            scaleX : 50 / koma_b.width,
            scaleY : 50 / koma_b.height
        });
        this.addChild(koma_b ,0);
        
        var koma_r = new cc.Sprite(res.koma_red);
        koma_r.attr({
            x: 200,
            y: 100,
            scaleX : 50 / koma_b.width,
            scaleY : 50 / koma_b.height
        });
        this.addChild(koma_r ,0);
        
        // stream
        var strm1 = new AsyncStream();
        var strm2 = new AsyncStream();
        
        var mov = new cc.MoveTo(1, cc.p(200,30));
        koma_r.runActionAsync(mov, strm1);
        
        var mov2 = new cc.MoveTo(1, cc.p(100,150));
        koma_b.runActionAsync(mov2, strm1);
        
        var mov3 = new cc.MoveTo(1, cc.p(300,150));
        koma_r.runActionAsync(mov3, strm1);
        
        var mov4 = new cc.MoveTo(0.5, cc.p(400,200));
        koma_b.runActionAsync(mov3,strm2);
        
        return true;
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

