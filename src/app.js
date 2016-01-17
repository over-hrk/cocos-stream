

var AsyncManeger = function(){
    
    this.actionlist = [];
    this.actionCnt = 0;
    
    var check  = new cc.CallFunc(function(){
        cc.log("checkCallback");
        this.actionlist.shift();
        this.actionCnt--;
        cc.log("queue size=", this.actionCnt);
        if(this.actionCnt>0){
            var next = this.actionlist[0];
            next.target.runAction(next.action);
        }
    }, this);
    
    this.runActionWrapper = function(target,action){
        cc.log("runActionWrapper");
        
        var wrapperAction = new cc.Sequence([action,check]);
        
        var immediate = this.actionCnt==0 ? true :false;
        
        this.actionlist.push({
            target : target,
            action : wrapperAction
        });
        this.actionCnt++;
        
        if(immediate){
            target.runAction(wrapperAction);
        }
    };
    
};


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
        
        var mng = new AsyncManeger();
        
        var mov = new cc.MoveTo(1, cc.p(200,30));
        // koma_r.runAction(mov);
        
        mng.runActionWrapper(koma_r, mov);
        
        var mov2 = new cc.MoveTo(1, cc.p(100,150));
        //koma_b.runAction(mov2);
        mng.runActionWrapper(koma_b, mov2);
        
        var mov3 = new cc.MoveTo(1, cc.p(300,150));
        mng.runActionWrapper(koma_b, mov3);
        
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

