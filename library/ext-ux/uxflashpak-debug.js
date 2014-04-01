/*
 * ux.Media.Flash 2.1
 * Copyright(c) 2008-2009, Active Group, Inc.
 * licensing@theactivegroup.com
 * 
 * http://licensing.theactivegroup.com
 */


Ext.namespace('Ext.ux.plugin');



Ext.onReady(function(){
  var CSS = Ext.util.CSS;

    if(!Ext.isIE && this.fixMaximizedWindow !== false){
        //Prevent overflow:hidden (reflow) transitions when an Ext.Window is maximize.
        CSS.updateRule ( '.x-window-maximized-ct', 'overflow', '');
    }


    

    
    CSS.createStyleSheet('.x-hide-nosize, .x-hide-nosize * {height:0px!important;width:0px!important;border:none!important;}');
    CSS.refreshCache();
    
});


Ext.ux.plugin.VisibilityMode = function(opt) {

    Ext.apply(this, opt||{});

    

    //Apply the necessary overrides to Ext.Element once.
    if(!Ext.Element.prototype.setVisible.patched){

          Ext.override(Ext.Element, {
              setVisible : function(visible, animate){

                if(!animate || !Ext.lib.Anim){
                    if(this.visibilityMode === Ext.Element.DISPLAY){
                        this.setDisplayed(visible);
                    }else if(this.visibilityMode === Ext.Element.VISIBILITY){
                        this.fixDisplay();
                        this.dom.style.visibility = visible ? "visible" : "hidden";
                    }else {
                        this[visible?'removeClass':'addClass'](String(this.visibilityMode));
                    }

                }else{
                    // closure for composites
                    var dom = this.dom;
                    var visMode = this.visibilityMode;

                    if(visible){
                        this.setOpacity(.01);
                        this.setVisible(true);
                    }
                    this.anim({opacity: { to: (visible?1:0) }},
                          this.preanim(arguments, 1),
                          null, .35, 'easeIn', function(){

                             if(!visible){
                                 if(visMode === Ext.Element.DISPLAY){
                                     dom.style.display = "none";
                                 }else if(visMode === Ext.Element.VISIBILITY){
                                     dom.style.visibility = "hidden";
                                 }else {
                                     Ext.get(dom).addClass(String(visMode));
                                 }
                                 Ext.get(dom).setOpacity(1);
                             }
                         });
                }

                return this;
            },

            
            isVisible : function(deep) {
                var vis = !( this.getStyle("visibility") === "hidden" || this.getStyle("display") === "none" || this.hasClass(this.visibilityMode));
                if(deep !== true || !vis){
                    return vis;
                }
                var p = this.dom.parentNode;
                while(p && p.tagName.toLowerCase() !== "body"){
                    if(!Ext.fly(p, '_isVisible').isVisible()){
                        return false;
                    }
                    p = p.parentNode;
                }
                return true;
            }
        });
        Ext.Element.prototype.setVisible.patched = true;
    }
   };


  Ext.ux.plugin.VisibilityMode.prototype = {


       
      bubble              :  true,

      
      fixMaximizedWindow  :  true,

      

      elements       :  null,

      

      visibilityCls   : 'x-hide-nosize',

      
      hideMode  :   'nosize' ,

     
     init : function(c) {

        var El = Ext.Element;

        var hideMode = this.hideMode || c.hideMode;
        var visMode = c.visibilityCls || this.visibilityCls || El[hideMode.toUpperCase()] || El.VISIBILITY;
        var plugin = this;

        var changeVis = function(){

            var els = [this.collapseEl, this.floating? null: this.actionMode ].concat(plugin.elements||[]);

            Ext.each(els, function(el){
            var e = el ? this[el] : el;
            if(e && e.setVisibilityMode){
                e.setVisibilityMode(visMode);
            }
            },this);

            var cfg = {
            animCollapse : false,
            hideMode  : hideMode,
            animFloat : false,
            visibilityCls  : visMode,
            defaults  : this.defaults || {}
            };

            cfg.defaults.hideMode = hideMode;
            cfg.defaults.visibilityCls = visMode;

            Ext.apply(this, cfg);
            Ext.apply(this.initialConfig || {}, cfg);

         };

         var bubble = Ext.Container.prototype.bubble;


         c.on('render', function(){

            // Bubble up the layout and set the new
            // visibility mode on parent containers
            // which might also cause DOM reflow when
            // hidden or collapsed.
            if(plugin.bubble !== false && this.ownerCt){

               bubble.call(this.ownerCt, function(){

               if(this.hideMode !== hideMode){
                  this.hideMode = hideMode ;

                  this.on('afterlayout', changeVis, this, {single:true} );
                }

              });
             }

             changeVis.call(this);

          }, c, {single:true});


     }

  };





Ext.removeNode =  Ext.isIE ? function(n){
            var d = document.createElement('div'); //the original closure held a reference till reload as well.
            if(n && n.tagName != 'BODY'){
                    var d = document.createElement('div');
                    d.appendChild(n);
                    //d.innerHTML = '';  //either works equally well
                    d.removeChild(n);
                    delete Ext.Element.cache[n.id];  //clear out any Ext reference from the Elcache
                    d = null;  //just dump the scratch DIV reference here.
            }

        } :
        function(n){
            if(n && n.parentNode && n.tagName != 'BODY'){
                n.parentNode.removeChild(n);
                delete Ext.Element.cache[n.id];
            }
        };


(function(){

    //remove null and undefined members from an object
    var compactObj =  function(obj){
            var out = {};
            for (var member in obj){
               (obj[member] === null || obj[member] === undefined) || (out[member] = obj[member]);
            }
            return out;
        };

   

    Ext.ux.Media = function(config){
         this.toString = this.asMarkup;  //Inline rendering support for this and all subclasses
         Ext.apply(this,config||{});
         this.initMedia();
    };
    var ux = Ext.ux.Media;
    var stateRE = /4$/i;

    if(parseFloat(Ext.version) < 2.1){ throw "Ext.ux.Media and sub-classes are not License-Compatible with your Ext release.";}

    Ext.ux.Media.prototype = {

         
         mediaObject     : null,

         
         mediaCfg        : null,
         mediaVersion    : null,
         requiredVersion : null,

         
         unsupportedText : null,

         

         hideMode      : !Ext.isIE?'nosize':'display',

         animCollapse  :  Ext.enableFx && Ext.isIE,

         animFloat     :  Ext.enableFx && Ext.isIE,

         autoScroll    : true,

         bodyStyle     : {position: 'relative'},

         visibilityCls : !Ext.isIE ?'x-hide-nosize':null,

        
         initMedia      : function(){ },

         
         disableCaching  : false,

         _maxPoll        : 200,

         
         getMediaType: function(type){
             return ux.mediaTypes[type];
         },

         
         assert : function(v,def){
              v= typeof v === 'function'?v.call(v.scope||null):v;
              return Ext.value(v ,def);
         },

        
         assertId : function(id, def){
             id || (id = def || Ext.id());
             return id;
         },

        
         prepareURL : function(url, disableCaching){
            var parts = url ? url.split('#') : [''];
            if(!!url && (disableCaching = disableCaching === undefined ? this.disableCaching : disableCaching) ){
                var u = parts[0];
                if( !(/_dc=/i).test(u) ){
                    var append = "_dc=" + (new Date().getTime());
                    if(u.indexOf("&") !== -1){
                        u += "&" + append;
                    }else{
                        u += "?" + append;
                    }
                    parts[0] = u;
                }
            }
            return parts.length > 1 ? parts.join('#') : parts[0];
         },

          
         prepareMedia : function(mediaCfg, width, height, ct){

             mediaCfg = mediaCfg ||this.mediaCfg;

             if(!mediaCfg){return '';}

             var m= Ext.apply({url:false,autoSize:false}, mediaCfg); //make a copy

             m.url = this.prepareURL(this.assert(m.url,false),m.disableCaching);

             if( m.mediaType){

                 var value,p, El = Ext.Element.prototype;

                 var media = Ext.apply({}, this.getMediaType(this.assert(m.mediaType,false)) || false );

                 var params = compactObj(Ext.apply(media.params||{},m.params || {}));

                 for(var key in params){

                    if(params.hasOwnProperty(key)){
                      m.children || (m.children = []);
                      p = this.assert(params[key],null);
                      m.children.push({tag:'param'
                         ,name:key
                         ,value: typeof p === 'object'?Ext.urlEncode(compactObj(p)):encodeURI(p)
                         });

                    }
                 }
                 delete   media.params;

                 //childNode Text if plugin/object is not installed.
                 var unsup = this.assert(m.unsupportedText|| this.unsupportedText || media.unsupportedText,null);
                 if(unsup){
                     m.children || (m.children = []);
                     m.children.push(unsup);
                 }

                 if(m.style && typeof m.style != "object") { throw 'Style must be JSON formatted'; }

                 m.style = this.assert(Ext.apply(media.style || {}, m.style || {}) , {});
                 delete media.style;

                 m.height = this.assert(height || m.height || media.height || m.style.height, null);
                 m.width  = this.assert(width  || m.width  || media.width || m.style.width ,null);

                 m = Ext.apply({tag:'object'},m,media);

                 //Convert element height and width to inline style to avoid issues with display:none;
                 if(m.height || m.autoSize)
                 {
                    Ext.apply(m.style, {
                        //Ext 2 & 3 compatibility -- Use the defaultUnit from the Component's el for default
                      height:(Ext.Element.addUnits || El.addUnits).call(this.mediaEl, m.autoSize ? '100%' : m.height ,El.defaultUnit||'px')});
                 }
                 if(m.width || m.autoSize)
                 {
                    Ext.apply(m.style, {
                        //Ext 2 & 3 compatibility -- Use the defaultUnit from the Component's el for default
                      width :(Ext.Element.addUnits || El.addUnits).call(this.mediaEl, m.autoSize ? '100%' : m.width ,El.defaultUnit||'px')});
                 }

                 m.id   = this.assertId(m.id);
                 m.name = this.assertId(m.name, m.id);

                 m._macros= {
                   url       : m.url || ''
                  ,height    : (/%$/.test(m.height)) ? m.height : parseInt(m.height,10)||null
                  ,width     : (/%$/.test(m.width)) ? m.width : parseInt(m.width,10)||null
                  ,scripting : this.assert(m.scripting,false)
                  ,controls  : this.assert(m.controls,false)
                  ,scale     : this.assert(m.scale,1)
                  ,status    : this.assert(m.status,false)
                  ,start     : this.assert(m.start, false)
                  ,loop      : this.assert(m.loop, false)
                  ,volume    : this.assert(m.volume, 20)
                  ,id        : m.id
                 };

                 delete   m.url;
                 delete   m.mediaType;
                 delete   m.controls;
                 delete   m.status;
                 delete   m.start;
                 delete   m.loop;
                 delete   m.scale;
                 delete   m.scripting;
                 delete   m.volume;
                 delete   m.autoSize;
                 delete   m.params;
                 delete   m.unsupportedText;
                 delete   m.renderOnResize;
                 delete   m.disableCaching;
                 delete   m.listeners;
                 delete   m.height;
                 delete   m.width;
                 return m;
              }else{
                 var unsup = this.assert(m.unsupportedText|| this.unsupportedText || media.unsupportedText,null);
                 unsup = unsup ? Ext.DomHelper.markup(unsup): null;
                 return String.format(unsup || 'Media Configuration/Plugin Error',' ',' ');
             }
           },

           
         asMarkup  : function(mediaCfg){
              return this.mediaMarkup(this.prepareMedia(mediaCfg));
         },

          
         mediaMarkup : function(mediaCfg){
            mediaCfg = mediaCfg || this.mediaCfg;
            if(mediaCfg){
                 var _macros = mediaCfg._macros;
                 delete mediaCfg._macros;
                 var m = Ext.DomHelper.markup(mediaCfg);
                 if(_macros){
                   var _m, n;
                    for ( n in _macros){
                      _m = _macros[n];
                      if(_m !== null){
                           m = m.replace(new RegExp('((%40|@)'+n+')','g'),_m+'');
                      }
                    }
                  }
                  return m;
            }
         },

         
         setMask  : function(el) {
             var mm;
             if((mm = this.mediaMask)){
                    mm.el || (mm = this.mediaMask = new Ext.ux.IntelliMask(el,mm));
                    mm.el.addClass('x-media-mask');
             }

         },
         
          refreshMedia  : function(target){
                 if(this.mediaCfg) {this.renderMedia(null,target);}
                 return this;
          },

          
          renderMedia : function(mediaCfg, ct, domPosition , w , h){
              if(!Ext.isReady){
                  Ext.onReady(this.renderMedia.createDelegate(this,Array.prototype.slice.call(arguments,0)));
                  return;
              }
              var mc = (this.mediaCfg = mediaCfg || this.mediaCfg) ;
              ct = Ext.get(this.lastCt || ct || (this.mediaObject?this.mediaObject.dom.parentNode:null));
              this.onBeforeMedia.call(this, mc, ct, domPosition , w , h);
              if(ct){
                  this.lastCt = ct;
                  if(mc && (mc = this.prepareMedia(mc, w, h, ct))){
                     this.setMask(ct);
                     this.mediaMask && this.autoMask && this.mediaMask.show();
                     this.clearMedia().writeMedia(mc, ct, domPosition || 'afterbegin');
                  }
              }
              this.onAfterMedia(ct);
          },

          
          writeMedia : function(mediaCfg, container, domPosition ){
              var ct = Ext.get(container);
              if(ct){
                domPosition ? Ext.DomHelper.insertHtml(domPosition,ct.dom,this.mediaMarkup(mediaCfg))
                  :ct.update(this.mediaMarkup(mediaCfg));
              }
          },

          
          clearMedia : function(){
            var mo;
            if(Ext.isReady && (mo = this.mediaObject)){
                mo.remove(true,true);
            }
            this.mediaObject = null;
            return this;
          },

           
          resizeMedia   : function(comp, w, h){
              var mc = this.mediaCfg;
              if(mc && this.boxReady && mc.renderOnResize && (!!w || !!h)){
                  // Ext.Window.resizer fires this event a second time
                  if(arguments.length > 3 && (!this.mediaObject || mc.renderOnResize )){
                      this.refreshMedia(this[this.mediaEl]);
                  }
              }

          },

          
          onBeforeMedia  : function(mediaCfg, ct, domPosition, width, height){

            var m = mediaCfg || this.mediaCfg, mt;

            if( m && (mt = this.getMediaType(m.mediaType)) ){
                m.autoSize = m.autoSize || mt.autoSize===true;
                var autoSizeEl;
                //Calculate parent container size for macros (if available)
                if(m.autoSize && (autoSizeEl = Ext.isReady?
                    //Are we in a layout ? autoSize to the container el.
                     Ext.get(this[this.mediaEl] || this.lastCt || ct) :null)
                 ){
                  m.height = this.autoHeight ? null : autoSizeEl.getHeight(true);
                  m.width  = this.autoWidth ? null : autoSizeEl.getWidth(true);
                }

             }
             this.assert(m.height,height);
             this.assert(m.width ,width);
             mediaCfg = m;

          },

          
          onMediaLoad : function(e){
               if(e && e.type == 'load'){
                  this.fireEvent('mediaload',this, this.mediaObject );

                  if(this.mediaMask && this.autoMask){ this.mediaMask.hide(); }

               }
          },
          
          onAfterMedia   : function(ct){
               var mo;
               if(this.mediaCfg && ct && (mo = this.mediaObject =
                       new (this.elementClass || Ext.ux.Media.Element)(ct.child('.x-media', true) ))){
                   mo.ownerCt = this;

                   var L; //Reattach any DOM Listeners after rendering.
                   if(L = this.mediaCfg.listeners ||null){
                      mo.on(L);  //set any DOM listeners
                    }
                   this.fireEvent('mediarender',this, this.mediaObject );

                    //Load detection for non-<object> media (iframe, img)
                   if(mo.dom.tagName !== 'OBJECT'){
                      mo.on({
                       load  :this.onMediaLoad
                      ,scope:this
                      ,single:true
                     });
                   } else {
                       //IE, Opera possibly others, support a readyState on <object>s
                       this._countPoll = 0;
                       this.pollReadyState( this.onMediaLoad.createDelegate(this,[{type:'load'}],0));
                   }

               }
              if(this.autoWidth || this.autoHeight){
                this.syncSize();
              }
          },

          
         pollReadyState : function( cb, readyRE){

            var media = this.getInterface();
            if(media && typeof media.readyState != 'undefined'){
                (readyRE || stateRE).test(media.readyState) ? cb() : arguments.callee.defer(10,this,arguments);
            }
         },

          
          getInterface  : function(){
              return this.mediaObject?this.mediaObject.dom||null:null;
          },

         detectVersion  : Ext.emptyFn,

         

         autoMask   : false
    };

    Ext.ns('Ext.ux.plugin');

    var componentAdapter = {

        init         : function(){

            this.getId = function(){
                return this.id || (this.id = "media-comp" + (++Ext.Component.AUTO_ID));
            };

            this.html = this.contentEl = this.items = null;

            //Attach the Visibility Fix (if available) to the current class Component
            if(this.hideMode == 'nosize' && Ext.ux.plugin.VisibilityMode){

               new Ext.ux.plugin.VisibilityMode({
                 visibilityCls   : 'x-hide-nosize',
                 hideMode        : 'nosize'
                }).init(this);
            }

            this.initMedia();

            //Inline rendering support for this and all subclasses
            this.toString = this.asMarkup;

            this.addEvents(

              
                'mediarender',
               

                'mediaload');

            if(this.mediaCfg.renderOnResize ){
                this.on('resize', this.resizeMedia, this);
            }


        },
        afterRender  : function(ct){

            //set the mediaMask
            this.setMask(this[this.mediaEl] || ct);

            if(!this.mediaCfg.renderOnResize ){
                this.renderMedia(this.mediaCfg,this[this.mediaEl] || ct);
            }

        },
        
        beforeDestroy  :  function(){
            this.clearMedia();
            Ext.destroy(this.mediaMask, this.loadMask);
            this.lastCt = this.mediaObject = this.renderTo = this.applyTo = this.mediaMask = this.loadMask = null;

        }
    };

    

    Ext.ux.Media.Component= Ext.extend ( Ext.BoxComponent, {

        ctype         : "Ext.ux.Media.Component",

        
        mediaEl         : 'el',

        autoEl  : {tag:'div',style : { overflow: 'hidden', display:'block',position: 'relative'}},

        cls     : "x-media-comp",

        mediaClass    : Ext.ux.Media,
        constructor   : function(){
         //Inherit the ux.Media class
          Ext.apply(this , this.mediaClass.prototype );
          ux.Component.superclass.constructor.apply(this, arguments);
        },
        
        initComponent   : function(){
            ux.Component.superclass.initComponent.apply(this,arguments);
            componentAdapter.init.apply(this,arguments);
        },
        
        afterRender  : function(ct){
            ux.Component.superclass.afterRender.apply(this,arguments);
            componentAdapter.afterRender.apply(this,arguments);
         },
         
        beforeDestroy   : function(){
            componentAdapter.beforeDestroy.apply(this,arguments);
            ux.Component.superclass.beforeDestroy.apply(this,arguments);
         },
        doAutoLoad : Ext.emptyFn,
         
        setAutoScroll   : function(){
            if(this.rendered && this.autoScroll){
                this.getEl().setOverflow('auto');
            }
        }

    });

    Ext.reg('uxmedia', Ext.ux.Media.Component);
    Ext.reg('media', Ext.ux.Media.Component);

    

    Ext.ux.Media.Panel = Ext.extend( Ext.Panel,  {

         cls           : "x-media-panel",

         ctype         : "Ext.ux.Media.Panel",

          
         mediaEl       : 'body',

         mediaClass    : Ext.ux.Media,

         constructor   : function(){

         //Inherit the ux.Media class
          Ext.apply(this , this.mediaClass.prototype );

          ux.Panel.superclass.constructor.apply(this, arguments);

        },

        
        initComponent   : function(){
            ux.Panel.superclass.initComponent.apply(this,arguments);
            componentAdapter.init.apply(this,arguments);
        },
        
        afterRender  : function(ct){
            ux.Panel.superclass.afterRender.apply(this,arguments);
            componentAdapter.afterRender.apply(this,arguments);
         },
         
        beforeDestroy  : function(){
            componentAdapter.beforeDestroy.apply(this,arguments);
            ux.Panel.superclass.beforeDestroy.apply(this,arguments);
         },
        doAutoLoad : Ext.emptyFn
    });


    Ext.reg('mediapanel', Ext.ux.Media.Panel);
    

    Ext.ux.Media.Portlet = Ext.extend ( Ext.ux.Media.Panel , {
       anchor       : '100%',
       frame        : true,
       collapseEl   : 'bwrap',
       collapsible  : true,
       draggable    : true,
       autoWidth    : true,
       ctype        : "Ext.ux.Media.Portlet",
       cls          : 'x-portlet x-media-portlet'

    });

    Ext.reg('mediaportlet', Ext.ux.Media.Portlet);

   

    Ext.ux.Media.Window = Ext.extend( Ext.Window ,{

        
        constructor   : function(config){

          Ext.apply(this , this.mediaClass.prototype );

          ux.Window.superclass.constructor.apply(this, arguments);

        },

         cls           : "x-media-window",

         ctype         : "Ext.ux.Media.Window",

         mediaClass    : Ext.ux.Media,

          
         mediaEl       : 'body',

        
        initComponent   : function(){
            ux.Window.superclass.initComponent.apply(this,arguments);
            componentAdapter.init.apply(this,arguments);
        },

        
        afterRender  : function(){
            ux.Window.superclass.afterRender.apply(this,arguments);  //wait for sizing
            componentAdapter.afterRender.apply(this,arguments);
         },
         
        beforeDestroy   : function(){
            componentAdapter.beforeDestroy.apply(this,arguments);
            ux.Window.superclass.beforeDestroy.apply(this,arguments);
         },

        doAutoLoad : Ext.emptyFn

    });

    Ext.reg('mediawindow', ux.Window);



    Ext.onReady(function(){
        //Generate CSS Rules if not defined in markup
        var CSS = Ext.util.CSS, rules=[];

        CSS.getRule('.x-media', true) || (rules.push('.x-media{width:100%;height:100%;outline:none;overflow:hidden;}'));
        CSS.getRule('.x-media-mask') || (rules.push('.x-media-mask{width:100%;height:100%;overflow:hidden;position:relative;zoom:1;}'));

        //default Rule for IMG:  h/w: auto;
        CSS.getRule('.x-media-img') || (rules.push('.x-media-img{background-color:transparent;width:auto;height:auto;position:relative;}'));

        // Add the new masking rule if not present.
        CSS.getRule('.x-masked-relative') || (rules.push('.x-masked-relative{position:relative!important;}'));

        if(!!rules.length){
             CSS.createStyleSheet(rules.join(''));
             CSS.refreshCache();
        }

    });



    Ext.override(Ext.Element, {

         
         mask : function(msg, msgCls){

              if(this.getStyle("position") == "static"){
                  this.addClass("x-masked-relative");
              }

             this._mask ||
                 (this._mask = Ext.DomHelper.append(this.dom, {cls:"ext-el-mask"}, true));


             if(!this.select('iframe,frame,object,embed').elements.length){
                 this.addClass("x-masked");  //causes element re-init after reflow (overflow:hidden)
             }

             //may have been hidden previously (and not removed)
             this._mask.setDisplayed(true)//.removeClass("x-hide-offsets");

             if(typeof msg == 'string'){
                  this._maskMsg || (this._maskMsg = Ext.DomHelper.append(this.dom, {style:"visibility:hidden",cls:"ext-el-mask-msg", cn:{tag:'div'}}, true));
                  var mm = this._maskMsg;
                  mm.dom.className = msgCls ? "ext-el-mask-msg " + msgCls : "ext-el-mask-msg";
                  mm.dom.firstChild.innerHTML = msg;
                  mm.center(this).setVisible(true);
             }

             //Adjust Mask Height for IE strict
             if(Ext.isIE && !(Ext.isIE7 && Ext.isStrict) && this.getStyle('height') == 'auto'){ // ie will not expand full height automatically
                  //see: http://www.extjs.com/forum/showthread.php?p=252925#post252925
                  this._mask.setHeight(this.getHeight());
             }
             return this._mask;
         },

         
         unmask : function(remove){

            if(this._maskMsg ){

                this._maskMsg.setVisible(false);
                if(remove){
                    this._maskMsg.remove(true);
                    delete this._maskMsg;
                 }
            }

            if(this._mask ) {

                 this._mask.setDisplayed(false)//.addClass("x-hide-offsets");
                 if(remove){
                     this._mask.remove(true);
                     delete this._mask;
                 }
             }

             this.removeClass(["x-masked", "x-masked-relative"]);

         },

        

        remove : function(cleanse, deep){
              if(this.dom){
                this.removeAllListeners();    //remove any Ext-defined DOM listeners
                if(cleanse){ this.cleanse(true, deep); }
                Ext.removeNode(this.dom);
                this.maskEl = null;
                this.dom = null;  //clear ANY DOM references

              }
         },

        
        cleanse : function(forceReclean, deep){
            if(this.isCleansed && forceReclean !== true){
                return this;
            }

            var d = this.dom, n = d.firstChild, nx;
             while(d && n){
                 nx = n.nextSibling;
                 if(deep){
                         Ext.fly(n, '_cleanser').cleanse(forceReclean, deep);
                         }
                 Ext.removeNode(n);
                 n = nx;
             }
             this.isCleansed = true;
             return this;
         }
    });

    
    Ext.ux.Media.Element = Ext.extend ( Ext.Element , {

        visibilityMode  : 'x-hide-nosize',
        
        constructor   : function( element ) {

            if(!element ){ return null; }

            var dom = typeof element == "string" ? d.getElementById(element) : element.dom || element ;

            if(!dom ){ return null; }

            
            this.dom = dom;
            
            this.id = dom.id || Ext.id(dom);

            Ext.Element.cache[this.id] = this;

        },

        
        mask : function(msg, msgCls){

            this.maskEl || (this.maskEl = this.parent('.x-media-mask') || this.parent());

            return this.maskEl.mask.apply(this.maskEl, arguments);

        },
        unmask : function(remove){

            if(this.maskEl){
                this.maskEl.unmask(remove);
                this.maskEl = null;
            }
        }


    });

    Ext.ux.Media.prototype.elementClass  =  Ext.ux.Media.Element;

    
    Ext.ux.IntelliMask = function(el, config){

        Ext.apply(this, config);
        this.el = Ext.get(el);

    };

    Ext.ux.IntelliMask.prototype = {

        

         removeMask  : false,

        
        msg : 'Loading Media...',
        
        msgCls : 'x-mask-loading',


        
        zIndex : null,

        
        disabled: false,

        
        active: false,

        
        autoHide: false,

        
        disable : function(){
           this.disabled = true;
        },

        
        enable : function(){
            this.disabled = false;
        },

        
        show: function(msg, msgCls, fn, fnDelay ){

            var opt={}, autoHide = this.autoHide;
            fnDelay = parseInt(fnDelay,10) || 20; //ms delay to allow mask to quiesce if fn specified

            if(typeof msg == 'object'){
                opt = msg;
                msg = opt.msg;
                msgCls = opt.msgCls;
                fn = opt.fn;
                autoHide = typeof opt.autoHide != 'undefined' ?  opt.autoHide : autoHide;
                fnDelay = opt.fnDelay || fnDelay ;
            }
            if(!this.active && !this.disabled && this.el){
                var mask = this.el.mask(msg || this.msg, msgCls || this.msgCls);

                this.active = !!this.el._mask;
                if(this.active){
                    if(this.zIndex){
                        this.el._mask.setStyle("z-index", this.zIndex);
                        if(this.el._maskMsg){
                            this.el._maskMsg.setStyle("z-index", this.zIndex+1);
                        }
                    }
                }
            } else {fnDelay = 0;}

            //passed function is called regardless of the mask state.
            if(typeof fn === 'function'){
                fn.defer(fnDelay ,opt.scope || null);
            } else { fnDelay = 0; }

            if(autoHide && (autoHide = parseInt(autoHide , 10)||2000)){
                this.hide.defer(autoHide+(fnDelay ||0),this );
            }

            return this.active? {mask: this.el._mask , maskMsg: this.el._maskMsg} : null;
        },

        
        hide: function(remove){
            if(this.el){
                this.el.unmask(remove || this.removeMask);
            }
            this.active = false;
            return this;
        },

        // private
        destroy : function(){this.hide(true); this.el = null; }
     };




Ext.ux.Media.mediaTypes =
     {
        

       PDF : Ext.apply({  //Acrobat plugin thru release 8.0 all crash FF3
                tag     : 'object'
               ,cls     : 'x-media x-media-pdf'
               ,type    : "application/pdf"
               ,data    : "@url"
               ,autoSize:true
               ,params  : { src : "@url" }

               },Ext.isIE?{
                   classid :"CLSID:CA8A9780-280D-11CF-A24D-444553540000"
                   }:false),


      
      PDFFRAME  : {
                  tag      : 'iframe'
                 ,cls      : 'x-media x-media-pdf-frame'
                 ,frameBorder : 0
                 ,style    : { 'z-index' : 2}
                 ,src      : "@url"
                 ,autoSize :true
        },

       


      WMV : Ext.apply(
              {tag      :'object'
              ,cls      : 'x-media x-media-wmv'
              ,type     : 'application/x-mplayer2'
              ,data     : "@url"
              ,autoSize : true
              ,params  : {

                  filename     : "@url"
                 ,displaysize  : 0
                 ,autostart    : "@start"
                 ,showControls : "@controls"
                 ,showStatusBar: "@status"
                 ,showaudiocontrols : true
                 ,stretchToFit  : true
                 ,Volume        :"@volume"
                 ,PlayCount     : 1

               }
               },Ext.isIE?{
                   classid :"CLSID:22d6f312-b0f6-11d0-94ab-0080c74c7e95" //default for WMP installed w/Windows
                   ,codebase:"http" + ((Ext.isSecure) ? 's' : '') + "http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=5,1,52,701"
                   ,type:'application/x-oleobject'
                   }:
                   {src:"@url"}),

     


       SWF   :  Ext.apply({
                  tag      :'object'
                 ,cls      : 'x-media x-media-swf'
                 ,type     : 'application/x-shockwave-flash'
                 ,scripting: 'sameDomain'
                 ,standby  : 'Loading..'
                 ,loop     :  true
                 ,start    :  false
                 ,unsupportedText : {cn:['The Adobe Flash Player is required.',{tag:'br'},{tag:'a',cn:[{tag:'img',src:'http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif'}],href:'http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash',target:'_flash'}]}
                 ,params   : {
                      movie     : "@url"
                     ,menu      : "@controls"
                     ,play      : "@start"
                     ,quality   : "high"
                     ,allowscriptaccess : "@scripting"
                     ,allownetworking : 'all'
                     ,allowfullScreen : false
                     ,bgcolor   : "#FFFFFF"
                     ,wmode     : "opaque"
                     ,loop      : "@loop"
                    }

                },Ext.isIE?
                    {classid :"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
                     codebase:"http" + ((Ext.isSecure) ? 's' : '') + "://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0"
                    }:
                    {data     : "@url"}),
      

        JWP :  Ext.apply({
              tag      :'object'
             ,cls      : 'x-media x-media-swf x-media-flv'
             ,type     : 'application/x-shockwave-flash'
             ,data     : "@url"
             ,loop     :  false
             ,start    :  false
             //ExternalInterface bindings
             ,boundExternals : ['sendEvent' , 'addModelListener', 'addControllerListener', 'addViewListener', 'getConfig', 'getPlaylist']
             ,params   : {
                 movie     : "@url"
                ,flashVars : {
                               autostart:'@start'
                              ,repeat   :'@loop'
                              ,height   :'@height'
                              ,width    :'@width'
                              ,id       :'@id'
                              }
                }

        },Ext.isIE?{
             classid :"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
            ,codebase:"http" + ((Ext.isSecure) ? 's' : '') + "://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0"
            }:false),


        
        QT : Ext.apply({
                       tag      : 'object'
                      ,cls      : 'x-media x-media-quicktime'
                      ,type     : "video/quicktime"
                      ,style    : {position:'relative',"z-index":1 ,behavior:'url(#qt_event_source)'}
                      ,scale    : 'aspect'  // ( .5, 1, 2 , ToFit, Aspect )
                      ,unsupportedText : '<a href="http://www.apple.com/quicktime/download/">Get QuickTime</a>'
                      ,scripting : true
                      ,volume   : '50%'
                      ,data     : '@url'
                      ,params   : {
                           src          : Ext.isIE?'@url': null
                          ,href        : "http://quicktime.com"
                          ,target      : "_blank"
                          ,autoplay     : "@start"
                          ,targetcache  : true
                          ,cache        : true
                          ,wmode        : 'transparent'
                          ,controller   : "@controls"
                      ,enablejavascript : "@scripting"
                          ,loop         : '@loop'
                          ,scale        : '@scale'
                          ,volume       : '@volume'
                          ,QTSRC        : '@url'

                       }

                     },Ext.isIE?
                          { classid      :'clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B'
                           ,codebase     :"http" + ((Ext.isSecure) ? 's' : '') + '://www.apple.com/qtactivex/qtplugin.cab#version=7,2,1,0'

                       }:
                       {
                         PLUGINSPAGE  : "http://www.apple.com/quicktime/download/"

                    }),

        


        QTEVENTS : {
                   tag      : 'object'
                  ,id       : 'qt_event_source'
                  ,cls      : 'x-media x-media-qtevents'
                  ,type     : "video/quicktime"
                  ,params   : {}
                  ,classid      :'clsid:CB927D12-4FF7-4a9e-A169-56E4B8A75598'
                  ,codebase     :"http" + ((Ext.isSecure) ? 's' : '') + '://www.apple.com/qtactivex/qtplugin.cab#version=7,2,1,0'
                 },

        

        WPMP3 : Ext.apply({
                       tag      : 'object'
                      ,cls      : 'x-media x-media-audio x-media-wordpress'
                      ,type     : 'application/x-shockwave-flash'
                      ,data     : '@url'
                      ,start    : true
                      ,loop     : false
                      ,boundExternals : ['open','close','setVolume','load']
                      ,params   : {
                           movie        : "@url"
                          ,width        :'@width'  //required
                          ,flashVars : {
                               autostart    : "@start"
                              ,controller   : "@controls"
                              ,enablejavascript : "@scripting"
                              ,loop         :'@loop'
                              ,scale        :'@scale'
                              ,initialvolume:'@volume'
                              ,width        :'@width'  //required
                              ,encode       : 'no'  //mp3 urls will be encoded
                              ,soundFile    : ''   //required
                          }
                       }
                    },Ext.isIE?{classid :"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"}:false),

        

        REAL : Ext.apply({
                tag     :'object'
               ,cls     : 'x-media x-media-real'
               ,type    : "audio/x-pn-realaudio"
               ,data    : "@url"
               ,controls: 'imagewindow,all'
               ,start   : false
               ,standby : "Loading Real Media Player components..."
               ,params   : {
                          src        : "@url"
                         ,autostart  : "@start"
                         ,center     : false
                         ,maintainaspect : true
                         ,controller : "@controls"
                         ,controls   : "@controls"
                         ,volume     :'@volume'
                         ,loop       : "@loop"
                         ,console    : "_master"
                         ,backgroundcolor : '#000000'
                         }

                },Ext.isIE?{classid :"clsid:CFCDAA03-8BE4-11CF-B84B-0020AFBBCCFA"}:false),

        

        SVG : {
                  tag      : 'object'
                 ,cls      : 'x-media x-media-img x-media-svg'
                 ,type     : "image/svg+xml"
                 ,data     : "@url"
                 ,params   : { src : "@url"}

        },

        

        GIF : {
                  tag      : 'img'
                 ,cls      : 'x-media x-media-img x-media-gif'
                 ,src     : "@url"
        },

        

        TIFF : {
                  tag      : 'object'
                 ,type     : "image/tiff"
                 ,cls      : 'x-media x-media-img x-media-tiff'
                 ,data     : "@url"
        },
        

        JPEG : {
                  tag      : 'img'
                 ,cls      : 'x-media x-media-img x-media-jpeg'
                 //,style    : {overflow:'hidden', display:'inline'}
                 ,src     : "@url"
        },
        

        JP2 :{
                  tag      : 'object'
                 ,cls      : 'x-media x-media-img x-media-jp2'
                 ,type     : Ext.isIE ? "image/jpeg2000-image" : "image/jp2"
                 ,data     : "@url"
                },
        
        PNG : {
                  tag      : 'img'
                 ,cls      : 'x-media x-media-img x-media-png'
                 ,src     : "@url"
        },
        

        HTM : {
                  tag      : 'iframe'
                 ,cls      : 'x-media x-media-html'
                 ,frameBorder : 0
                 ,autoSize : true
                 ,style    : {overflow:'auto', 'z-index' : 2}
                 ,src     : "@url"
        },
        

        TXT : {
                  tag      : 'object'
                 ,cls      : 'x-media x-media-text'
                 ,type     : "text/plain"
                 ,style    : {overflow:'auto',width:'100%',height:'100%'}
                 ,data     : "@url"
        },

        

        RTF : {
                  tag      : 'object'
                 ,cls      : 'x-media x-media-rtf'
                 ,type     : "application/rtf"
                 ,style    : {overflow:'auto',width:'100%',height:'100%'}
                 ,data     : "@url"
        },
        

        JS : {
                  tag      : 'object'
                 ,cls      : 'x-media x-media-js'
                 ,type     : "text/javascript"
                 ,style    : {overflow:'auto',width:'100%',height:'100%'}
                 ,data     : "@url"
        },
        

        CSS : {
                  tag      : 'object'
                 ,cls      : 'x-media x-media-css'
                 ,type     : "text/css"
                 ,style    : {overflow:'auto',width:'100%',height:'100%'}
                 ,data     : "@url"
        },
        

        SILVERLIGHT : {
              tag      : 'object'
             ,cls      : 'x-media x-media-silverlight'
             ,type      :"application/ag-plugin"
             ,data     : "@url"
             ,params  : { MinRuntimeVersion: "1.0" , source : "@url" }
        },
        

        SILVERLIGHT2 : {
              tag      : 'object'
             ,cls      : 'x-media x-media-silverlight'
             ,type      :"application/x-silverlight-2-b2"
             ,data     : "data:application/x-silverlight-2-b2,"
             ,params  : { MinRuntimeVersion: "2.0" }
             ,unsupportedText: '<a href="http://go2.microsoft.com/fwlink/?LinkID=114576&v=2.0"><img style="border-width: 0pt;" alt="Get Microsoft Silverlight" src="http://go2.microsoft.com/fwlink/?LinkID=108181"/></a>'
        },
        

        DATAVIEW : {
              tag      : 'object'
             ,cls      : 'x-media x-media-dataview'
             ,classid  : 'CLSID:0ECD9B64-23AA-11D0-B351-00A0C9055D8E'
             ,type     : 'application/x-oleobject'
             ,unsupportedText: 'MS Dataview Control is not installed'

        },
        

        "OWCXLS" : Ext.apply({     //experimental IE only
              tag      : 'object'
             ,cls      : 'x-media x-media-xls'
             ,type      :"application/vnd.ms-excel"
             ,controltype: "excel"
             ,params  : { DataType : "CSVURL"
                        ,CSVURL : '@url'
                        ,DisplayTitleBar : true
                        ,AutoFit         : true
                     }
             },Ext.isIE?{
                   codebase: "file:msowc.cab"
                  ,classid :"CLSID:0002E510-0000-0000-C000-000000000046" //owc9
                 //classid :"CLSID:0002E550-0000-0000-C000-000000000046" //owc10
                 //classid :"CLSID:0002E559-0000-0000-C000-000000000046" //owc11

                 }:false),

        

        "OWCCHART" : Ext.apply({     //experimental
              tag      : 'object'
             ,cls      : 'x-media x-media-xls'
             ,type      :"application/vnd.ms-excel"
             ,data     : "@url"
             ,params  : { DataType : "CSVURL" }
             },Ext.isIE?{
                    classid :"CLSID:0002E500-0000-0000-C000-000000000046" //owc9
                  //classid :"CLSID:0002E556-0000-0000-C000-000000000046" //owc10
                  //classid :"CLSID:0002E55D-0000-0000-C000-000000000046" //owc11
                 }:false),

        

        OFFICE : {
              tag      : 'object'
             ,cls      : 'x-media x-media-office'
             ,type      :"application/x-msoffice"
             ,data     : "@url"
        },
        

        POWERPOINT : Ext.apply({     //experimental
                      tag      : 'object'
                     ,cls      : 'x-media x-media-ppt'
                     ,type     :"application/vnd.ms-powerpoint"
                     ,file     : "@url"
                     },Ext.isIE?{classid :"CLSID:EFBD14F0-6BFB-11CF-9177-00805F8813FF"}:false),
        

        XML : {
              tag      : 'iframe'
             ,cls      : 'x-media x-media-xml'
             ,style    : {overflow:'auto'}
             ,src     : "@url"
        },

        

        //VLC ActiveX Player -- Suffers the same fate as the Acrobat ActiveX Plugin
        VLC : Ext.apply({
              tag      : 'object'
             ,cls      : 'x-media x-media-vlc'
             ,type     : "application/x-vlc-plugin"
             ,version  : "VideoLAN.VLCPlugin.2"
             ,pluginspage:"http://www.videolan.org"
             ,events   : true
             ,start    : false
             ,params   : {
                   Src        : "@url"
                  ,MRL        : "@url"
                  ,autoplay  :  "@start"
                  ,ShowDisplay: "@controls"
                  ,Volume     : '@volume'
                  ,Autoloop   : "@loop"

                }

             },Ext.isIE?{
                  classid :"clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921"
                 ,CODEBASE :"http://downloads.videolan.org/pub/videolan/vlc/latest/win32/axvlc.cab"
             }:false),
        

         RDP : Ext.apply({
              tag      : 'object'
             ,cls      : 'x-media x-media-rdp'
             ,type     : "application/rds"
             ,unsupportedText: "Remote Desktop Web Connection ActiveX control is required. <a target=\"_msd\" href=\"http://go.microsoft.com/fwlink/?linkid=44333\">Download it here</a>."
             ,params:{
                  Server         : '@url'
                 ,Fullscreen     : false
                 ,StartConnected : false
                 ,DesktopWidth   : '@width'
                 ,DesktopHeight  : '@height'
             }

         },Ext.isIE?{
             classid :"CLSID:9059f30f-4eb1-4bd2-9fdc-36f43a218f4a"
            ,CODEBASE :"msrdp.cab#version=5,2,3790,0"


         }:false)

    };





if (Ext.provide) {
    Ext.provide('uxmedia');
}

Ext.applyIf(Array.prototype, {

    
    map : function(fun, scope) {
        var len = this.length;
        if (typeof fun != "function") {
            throw new TypeError();
        }
        var res = new Array(len);

        for (var i = 0; i < len; i++) {
            if (i in this) {
                res[i] = fun.call(scope || this, this[i], i, this);
            }
        }
        return res;
    }
});





Ext.ux.MediaComponent = Ext.ux.Media.Component;
Ext.ux.MediaPanel     = Ext.ux.Media.Panel;
Ext.ux.MediaPortlet   = Ext.ux.Media.Portlet;
Ext.ux.MediaWindow    = Ext.ux.Media.Window;

})();



(function(){

   var ux = Ext.ux.Media;
    

    Ext.ux.Media.Flash = Ext.extend( Ext.ux.Media, {

        varsName       :'flashVars',

       
        externalsNamespace :  null,

        
        mediaType: Ext.apply({
              tag      : 'object'
             ,cls      : 'x-media x-media-swf'
             ,type     : 'application/x-shockwave-flash'
             ,loop     : null
             ,scripting: "sameDomain"
             ,start    : true
             ,unsupportedText : {cn:['The Adobe Flash Player{0}is required.',{tag:'br'},{tag:'a',cn:[{tag:'img',src:'http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif'}],href:'http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash',target:'_flash'}]}
             ,params   : {
                  movie     : "@url"
                 ,play      : "@start"
                 ,loop      : "@loop"
                 ,menu      : "@controls"
                 ,quality   : "high"
                 ,bgcolor   : "#FFFFFF"
                 ,wmode     : "opaque"
                 ,allowscriptaccess : "@scripting"
                 ,allowfullscreen : false
                 ,allownetworking : 'all'
                }
             },Ext.isIE?
                    {classid :"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
                     codebase:"http" + ((Ext.isSecure) ? 's' : '') + "://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0"
                    }:
                    {data     : "@url"}),

        
        getMediaType: function(){
             return this.mediaType;
        },

        
        assertId : function(id, def){
             id || (id = def || Ext.id());
             return id.replace(/\+|-|\\|\/|\*/g,'');
         },

        
        initMedia : function(){

            ux.Flash.superclass.initMedia.call(this);

            var mc = Ext.apply({}, this.mediaCfg||{});
            var requiredVersion = (this.requiredVersion = mc.requiredVersion || this.requiredVersion|| false ) ;
            var hasFlash  = !!(this.playerVersion = this.detectFlashVersion());
            var hasRequired = hasFlash && (requiredVersion?this.assertVersion(requiredVersion):true);

            var unsupportedText = this.assert(mc.unsupportedText || this.unsupportedText || (this.getMediaType()||{}).unsupportedText,null);
            if(unsupportedText){
                 unsupportedText = Ext.DomHelper.markup(unsupportedText);
                 unsupportedText = mc.unsupportedText = String.format(unsupportedText,
                     (requiredVersion?' '+requiredVersion+' ':' '),
                     (this.playerVersion?' '+this.playerVersion+' ':' Not installed.'));
            }
            mc.mediaType = "SWF";

            if(!hasRequired ){
                this.autoMask = false;

                //Version check for the Flash Player that has the ability to start Player Product Install (6.0r65)
                var canInstall = hasFlash && this.assertVersion('6.0.65');
                if(canInstall && mc.installUrl){

                       mc =  mc.installDescriptor || {
                           mediaType  : 'SWF'
                            ,tag      : 'object'
                            ,cls      : 'x-media x-media-swf x-media-swfinstaller'
                            ,id       : 'SWFInstaller'
                            ,type     : 'application/x-shockwave-flash'
                            ,data     : "@url"
                            ,url              : this.prepareURL(mc.installUrl)
                            //The dimensions of playerProductInstall.swf must be at least 310 x 138 pixels,
                            ,width            : (/%$/.test(mc.width)) ? mc.width : ((parseInt(mc.width,10) || 0) < 310 ? 310 :mc.width)
                            ,height           : (/%$/.test(mc.height))? mc.height :((parseInt(mc.height,10) || 0) < 138 ? 138 :mc.height)
                            ,loop             : false
                            ,start            : true
                            ,unsupportedText  : unsupportedText
                            ,params:{
                                      quality          : "high"
                                     ,movie            : '@url'
                                     ,allowscriptacess : "always"
                                     ,wmode            : "opaque"
                                     ,align            : "middle"
                                     ,bgcolor          : "#3A6EA5"
                                     ,pluginspage      : mc.pluginsPage || this.pluginsPage || "http://www.adobe.com/go/getflashplayer"
                                   }
                        };
                        mc.params[this.varsName] = "MMredirectURL="+( mc.installRedirect || window.location)+
                                            "&MMplayerType="+(Ext.isIE?"ActiveX":"Plugin")+
                                            "&MMdoctitle="+(document.title = document.title.slice(0, 47) + " - Flash Player Installation");
                } else {
                    //Let superclass handle with unsupportedText property
                    mc.mediaType=null;
                }
            }

            

            if(mc.eventSynch){
                mc.params || (mc.params = {});
                var vars = mc.params[this.varsName] || (mc.params[this.varsName] = {});
                if(typeof vars === 'string'){ vars = Ext.urlDecode(vars,true); }
                var eventVars = (mc.eventSynch === true ? {
                         allowedDomain  : vars.allowedDomain || document.location.hostname
                        ,elementID      : mc.id || (mc.id = Ext.id())
                        ,eventHandler   : 'Ext.ux.Media.Flash.eventSynch'
                        }: mc.eventSynch );

                Ext.apply(mc.params,{
                     allowscriptaccess  : 'always'
                })[this.varsName] = Ext.applyIf(vars,eventVars);
            }

            this.bindExternals(mc.boundExternals);

            delete mc.requiredVersion;
            delete mc.installUrl;
            delete mc.installRedirect;
            delete mc.installDescriptor;
            delete mc.eventSynch;
            delete mc.boundExternals;

            this.mediaCfg = mc;


        },


        
        assertVersion : function(versionMap){

            var compare;
            versionMap || (versionMap = []);

            if(Ext.isArray(versionMap)){
                compare = versionMap;
            } else {
                compare = String(versionMap).split('.');
            }
            compare = (compare.concat([0,0,0,0])).slice(0,3); //normalize

            var tpv;
            if(!(tpv = this.playerVersion || (this.playerVersion = this.detectFlashVersion()) )){ return false; }

            if (tpv.major > parseFloat(compare[0])) {
                        return true;
            } else if (tpv.major == parseFloat(compare[0])) {
                   if (tpv.minor > parseFloat(compare[1]))
                            {return true;}
                   else if (tpv.minor == parseFloat(compare[1])) {
                        if (tpv.rev >= parseFloat(compare[2])) { return true;}
                        }
                   }
            return false;
        },

       
        detectFlashVersion : function(){
            if(ux.Flash.prototype.flashVersion ){
                return this.playerVersion = ux.Flash.prototype.flashVersion;
            }
            var version=false;
            var formatVersion = function(version){
              return version && !!version.length?
                {major:version[0] !== null? parseInt(version[0],10): 0
                ,minor:version[1] !== null? parseInt(version[1],10): 0
                ,rev  :version[2] !== null? parseInt(version[2],10): 0
                ,toString : function(){return this.major+'.'+this.minor+'.'+this.rev;}
                }:false;
            };
            var sfo= null;
            if(Ext.isIE){

                try{
                    sfo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
                }catch(e){
                    try {
                        sfo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
                        version = [6,0,21];
                        // error if player version < 6.0.47 (thanks to Michael Williams @ Adobe for this solution)
                        sfo.allowscriptaccess = "always";
                    } catch(ex) {
                        if(version && version[0] === 6)
                            {return formatVersion(version); }
                        }
                    try {
                        sfo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                    } catch(ex1) {}
                }
                if (sfo) {
                    version = sfo.GetVariable("$version").split(" ")[1].split(",");
                }
             }else if(navigator.plugins && navigator.mimeTypes.length){
                sfo = navigator.plugins["Shockwave Flash"];
                if(sfo && sfo.description) {
                    version = sfo.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split(".");
                }
            }
            return (this.playerVersion = ux.Flash.prototype.flashVersion = formatVersion(version));

        }

        
        ,onAfterMedia : function(ct){

              ux.Flash.superclass.onAfterMedia.apply(this,arguments);
              var mo;
              if(mo = this.mediaObject){

                  var id = mo.id;
                  if(Ext.isIE ){

                    //fscommand bindings
                    //implement a fsCommand event interface since its not supported on IE when writing innerHTML

                    if(!(Ext.query('script[for='+id+']').length)){
                      writeScript('var c;if(c=Ext.getCmp("'+this.id+'")){c.onfsCommand.apply(c,arguments);}',
                                  {event:"FSCommand", htmlFor:id});
                    }
                  }else{
                      window[id+'_DoFSCommand'] || (window[id+'_DoFSCommand']= this.onfsCommand.createDelegate(this));
                  }
              }
         },

        
        clearMedia  : function(){

           //de-register fscommand hooks
           if(this.mediaObject){
               var id = this.mediaObject.id;
               if(Ext.isIE){
                    Ext.select('script[for='+id+']',true).remove();
               } else {
                    window[id+'_DoFSCommand']= null;
                    delete window[id+'_DoFSCommand'];
               }
           }

           return ux.Flash.superclass.clearMedia.call(this) || this;

        },

        
        getSWFObject : function() {
            return this.getInterface();
        },


        

        onfsCommand : function( command, args){

            if(this.events){
                this.fireEvent('fscommand', this, command ,args );
            }

        },

        

        setVariable : function(varName, value){
            var fo = this.getInterface();
            if(fo && 'SetVariable' in fo){
                fo.SetVariable(varName,value);
                return true;
            }
            fo = null;
            return false;

        },

       
        getVariable : function(varName ){
            var fo = this.getInterface();
            if(fo && 'GetVariable' in fo){
                return fo.GetVariable(varName );
            }
            fo = null;
            return undefined;

        },

        
        bindExternals : function(methods){

            if(methods && this.playerVersion.major >= 8){
                methods = new Array().concat(methods);
            }else{
                return;
            }

            var nameSpace = (typeof this.externalsNamespace == 'string' ?
                  this[this.externalsNamespace] || (this[this.externalsNamespace] = {} )
                     : this );

            Ext.each(methods,function(method){

               var m = method.name || method;
               var returnType = method.returnType || 'javascript';

                //Do not overwrite existing function with the same name.
               nameSpace[m] || (nameSpace[m] = function(){
                      return this.invoke.apply(this,[m, returnType].concat(Array.prototype.slice.call(arguments,0)));
               }.createDelegate(this));

            },this);
        },

        
        invoke   : function(method , returnType  ){

            var obj,r;

            if(method && (obj = this.getInterface()) && 'CallFunction' in obj ){
                var c = [
                    String.format('<invoke name="{0}" returntype="{1}">',method, returnType),
                    '<arguments>',
                    (Array.prototype.slice.call(arguments,2)).map(this._toXML, this).join(''),
                    '</arguments>',
                    '</invoke>'].join('');
                
                r = obj.CallFunction(c);

                typeof r === 'string' && returnType ==='javascript' && (r= Ext.decode(r));

            }
            return r;

        },

        
        onFlashInit  :  function(){

            if(this.mediaMask && this.autoMask){this.mediaMask.hide();}
            this.fireEvent.defer(300,this,['flashinit',this, this.getInterface()]);


        },

        
        pollReadyState : function(cb, readyRE){
            var media;

            if(media= this.getInterface()){
                if(typeof media.PercentLoaded != 'undefined'){
                   var perc = media.PercentLoaded() ;

                   this.fireEvent( 'progress' ,this , this.getInterface(), perc) ;
                   if( perc = 100 ) { cb(); return; }
                }

                this._countPoll++ > this._maxPoll || arguments.callee.defer(10,this,arguments);

            }

         },

        
        _handleSWFEvent: function(event)
        {
            var type = event.type||event||false;
            if(type){
                 if(this.events && !this.events[String(type)])
                     { this.addEvents(String(type));}

                 return this.fireEvent.apply(this, [String(type), this].concat(Array.prototype.slice.call(arguments,0)));
            }
        },


       _toXML    : function(value){

           var format = Ext.util.Format;
           var type = typeof value;
           if (type == "string") {
               return "<string>" + format.xmlEncode(value) + "</string>";}
           else if (type == "undefined")
              {return "<undefined/>";}
           else if (type == "number")
              {return "<number>" + value + "</number>";}
           else if (value == null)
              {return "<null/>";}
           else if (type == "boolean")
              {return value ? "<true/>" : "<false/>";}
           else if (value instanceof Date)
              {return "<date>" + value.getTime() + "</date>";}
           else if (Ext.isArray(value))
              {return this._arrayToXML(value);}
           else if (type == "object")
              {return this._objectToXML(value);}
           else {return "<null/>";}
         },

        _arrayToXML  : function(arrObj){

            var s = "<array>";
            for (var i = 0,l = arrObj.length ; i < l; i++) {
                s += "<property id=\"" + i + "\">" + this._toXML(arrObj[i]) + "</property>";
            }
            return s + "</array>";
        },

        _objectToXML  : function(obj){

            var s = "<object>";
            for (var prop in obj) {
                if(obj.hasOwnProperty(prop)){
                   s += "<property id=\"" + prop + "\">" + this._toXML(obj[prop]) + "</property>";
                }
              }
            return s + "</object>";

        }

    });

    
    Ext.ux.Media.Flash.eventSynch = function(elementID, event  ){
            var SWF = Ext.get(elementID), inst;
            if(SWF && (inst = SWF.ownerCt)){
                return inst._handleSWFEvent.apply(inst, Array.prototype.slice.call(arguments,1));
            }
        };


    var componentAdapter = {
       init         : function(){

          //Must do this or Flash ExternalInterface methods are disabled!
          this.hideMode    = 'nosize';

          this.visibilityCls = 'x-hide-nosize';

          this.getId = function(){
              return this.id || (this.id = "flash-comp" + (++Ext.Component.AUTO_ID));
          };

          this.addEvents(

             
              'flashinit',

             
              'fscommand',

             
             'progress' );

        }

    };


     
   Ext.ux.Media.Flash.Component = Ext.extend(Ext.ux.Media.Component, {
         
         ctype         : "Ext.ux.Media.Flash.Component",


        
         cls    : "x-media-flash-comp",

         
         autoEl  : {tag:'div',style : { overflow: 'hidden', display:'block'}},

        
         mediaClass    : Ext.ux.Media.Flash,

        
         initComponent   : function(){

            componentAdapter.init.apply(this,arguments);
            Ext.ux.Media.Flash.Component.superclass.initComponent.apply(this,arguments);

         }



   });

   Ext.reg('uxflash', Ext.ux.Media.Flash.Component);

   ux.Flash.prototype.detectFlashVersion();

   

   Ext.ux.Media.Flash.Panel = Ext.extend(Ext.ux.Media.Panel,{

        ctype         : "Ext.ux.Media.Flash.Panel",

        mediaClass    : Ext.ux.Media.Flash,

        autoScroll    : false,

        
        shadow        : false,


        
        initComponent   : function(){
            componentAdapter.init.apply(this,arguments);
            Ext.ux.Media.Flash.Panel.superclass.initComponent.apply(this,arguments);

       }

   });

   Ext.reg('flashpanel', ux.Flash.Panel);
   Ext.reg('uxflashpanel', ux.Flash.Panel);

   

   Ext.ux.Media.Flash.Portlet = Ext.extend(Ext.ux.Media.Portlet,{
       ctype         : "Ext.ux.Media.Flash.Portlet",
       anchor       : '100%',
       frame        : true,
       collapseEl   : 'bwrap',
       collapsible  : true,
       draggable    : true,
       autoScroll    : false,
       autoWidth    : true,
       cls          : 'x-portlet x-flash-portlet',
       mediaClass    : Ext.ux.Media.Flash,
       
       initComponent   : function(){
           componentAdapter.init.apply(this,arguments);
           Ext.ux.Media.Flash.Panel.superclass.initComponent.apply(this,arguments);

       }

   });

   Ext.reg('flashportlet', ux.Flash.Portlet);
   Ext.reg('uxflashportlet', ux.Flash.Portlet);

   

   Ext.ux.Media.Flash.Window  = Ext.extend( Ext.ux.Media.Window , {

        ctype         : "Ext.ux.Media.Flash.Window",
        mediaClass    : Ext.ux.Media.Flash,

        autoScroll    : false,

        
        shadow        : false,


        
        initComponent   : function(){
            componentAdapter.init.apply(this,arguments);
            Ext.ux.Media.Flash.Window.superclass.initComponent.apply(this,arguments);

       }

   });

   Ext.reg('flashwindow', ux.Flash.Window);

   


   Ext.ux.Media.Flash.Element = Ext.extend ( Ext.ux.Media.Element , {

        

       remove : function(){

             var d ;
             // Fix streaming media troubles for IE
             // IE has issues with loose references when removing an <object>
             // before the onload event fires (all <object>s should have readyState == 4 after browsers onload)

             // Advice: do not attempt to remove the Component before onload has fired on IE/Win.

            if(Ext.isIE && Ext.isWindows && (d = this.dom)){

                this.removeAllListeners();
                d.style.display = 'none'; //hide it regardless of state
                if(d.readyState == 4){
                    for (var x in d) {
                        if (x.toLowerCase() != 'flashvars' && typeof d[x] == 'function') {
                            d[x] = null;
                        }
                    }
                }

             }

             Ext.ux.Media.Flash.Element.superclass.remove.apply(this, arguments);

         }

   });

   Ext.ux.Media.Flash.prototype.elementClass  =  Ext.ux.Media.Flash.Element;

   var writeScript = function(block, attributes) {
        attributes = Ext.apply({},attributes||{},{type :"text/javascript",text:block});

         try{
            var head,script, doc= document;
            if(doc && doc.getElementsByTagName){
                if(!(head = doc.getElementsByTagName("head")[0] )){

                    head =doc.createElement("head");
                    doc.getElementsByTagName("html")[0].appendChild(head);
                }
                if(head && (script = doc.createElement("script"))){
                    for(var attrib in attributes){
                          if(attributes.hasOwnProperty(attrib) && attrib in script){
                              script[attrib] = attributes[attrib];
                          }
                    }
                    return !!head.appendChild(script);
                }
            }
         }catch(ex){}
         return false;
    };

    
    if(Ext.isIE && Ext.isWindows && ux.Flash.prototype.flashVersion.major == 9) {

        window.attachEvent('onbeforeunload', function() {
              __flash_unloadHandler = __flash_savedUnloadHandler = function() {};
        });

        //Note: we cannot use IE's onbeforeunload event because an internal Flash Form-POST
        // raises the browsers onbeforeunload event when the server returns a response.  that is crazy!
        window.attachEvent('onunload', function() {

            Ext.each(Ext.query('.x-media-swf'), function(item, index) {
                item.style.display = 'none';
                for (var x in item) {
                    if (x.toLowerCase() != 'flashvars' && typeof item[x] == 'function') {
                        item[x] = null;
                    }
                }
            });
        });

    }

 Ext.apply(Ext.util.Format , {
       
        xmlEncode : function(value){
            return !value ? value : String(value)
                .replace(/&/g, "&amp;")
                .replace(/>/g, "&gt;")
                .replace(/</g, "&lt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&apos;");
        },

        
        xmlDecode : function(value){
            return !value ? value : String(value)
                .replace(/&gt;/g, ">")
                .replace(/&lt;/g, "<")
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, "&")
                .replace(/&apos;/g, "'");

        }

    });


 Ext.ux.FlashComponent  = Ext.ux.Media.Flash.Component ;
 Ext.ux.FlashPanel      = Ext.ux.Media.Flash.Panel;
 Ext.ux.FlashPortlet    = Ext.ux.Media.Flash.Portlet;
 Ext.ux.FlashWindow     = Ext.ux.Media.Flash.Window;

})();


