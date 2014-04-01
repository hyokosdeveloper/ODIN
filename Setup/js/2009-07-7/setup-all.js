// file: /var/www/tine20build/tine20/Tinebase/js/extFixes.js
/**
 * IE8 fixes
 */
if (Ext.isIE8) {
    /**
     * fix twin trigger field layout
     */
    Ext.form.TwinTriggerField.prototype.onRender = function(ct, position) {
        Ext.form.TwinTriggerField.superclass.onRender.call(this, ct, position);
        this.el.setTop.defer(10, this.el, ['1px']);
    }
    
    /**
     * fix datepicker width
     */
    Ext.DatePicker.prototype.onRender = Ext.DatePicker.prototype.onRender.createSequence(function(ct, position) {
        var wrap = ct.up('div[class="x-layer x-menu x-menu-plain x-date-menu"]');
        var orgWidth = this.el.getWidth();
        if (wrap) {
            // only wraped in menues
            wrap.setWidth.defer(10, wrap, [orgWidth]);
        }
    });
}

/**
 * fix broken ext email validator
 * 
 * @type RegExp
 */
Ext.apply(Ext.form.VTypes, {
    //emailFixed: /^([0-9,a-z,A-Z]+)([.,_,-]([0-9,a-z,A-Z]+))*[@]([0-9,a-z,A-Z]+)([.,_,-]([0-9,a-z,A-Z]+))*[.]([a-z,A-Z]){2,6}$/,
    emailFixed:  /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i,

    email:  function(v) {
        return this.emailFixed.test(v);
    }
});

/**
 * fix timezone handling for date picker
 * 
 * The getValue function always returns 00:00:00 as time. So if a form got filled
 * with a date like 2008-10-01T21:00:00 the form returns 2008-10-01T00:00:00 although 
 * the user did not change the fieled.
 * 
 * In a multi timezone context this is fatal! When a user in a certain timezone set
 * a date (just a date and no time information), this means in his timezone the 
 * time range from 2008-10-01T00:00:00 to 2008-10-01T23:59:59. 
 * _BUT_ for an other user sitting in a different timezone it means e.g. the 
 * time range from 2008-10-01T02:00:00 to 2008-10-02T21:59:59.
 * 
 * So on the one hand we need to make shure, that the date picker only returns 
 * changed datetime information when the user did a change. 
 * 
 * @todo On the other hand we
 * need adjust the day +/- one day according to the timeshift. 
 */
/**
 * @private
 */
 Ext.form.DateField.prototype.setValue = function(date){
    // preserv original datetime information
    this.fullDateTime = date;
    Ext.form.DateField.superclass.setValue.call(this, this.formatDate(this.parseDate(date)));
};
/**
 * @private
 */
Ext.form.DateField.prototype.getValue = function(){
    //var value = this.parseDate(Ext.form.DateField.superclass.getValue.call(this));
    
    // return the value that was set (has time information when unchanged in client) 
    // and not just the date part!
    value =  this.fullDateTime;
    return value || "";
};

/**
 * fix interpretation of ISO-8601  formatcode (Date.patterns.ISO8601Long) 
 * 
 * Browsers do not support timezones and also javascripts Date object has no 
 * support for it.  All Date Objects are in _one_ timezone which may ore may 
 * not be the operating systems timezone the browser runs on.
 * 
 * parsing dates in ISO format having the timeshift appended (Date.patterns.ISO8601Long) lead to 
 * correctly converted Date Objects in the browsers timezone. This timezone 
 * conversion changes the the Date Parts and as such, javascipt widget 
 * representing date time information print values of the browsers timezone 
 * and _not_ the values send by the server!
 * 
 * So in a multi timezone envireonment, datetime information in the browser 
 * _must not_ be parsed including the offset. Just the values of the server 
 * side converted datetime information are allowed to be parsed.
 */
Date.parseIso = function(isoString) {
    return Date.parseDate(isoString.replace(/\+\d{2}\d{2}/, ''), 'Y-m-d\\Th:i:s');
};

/**
 * rename window
 */
Ext.Window.prototype.rename = function(newId) {
    // Note PopupWindows are identified by name, whereas Ext.windows
    // get identified by id this should be solved some time ;-)
    this.manager.unregister(this);
    this.id = newId;
    this.manager.register(this);
};

/**
 * utility class used by Button
 * 
 * Fix: http://yui-ext.com/forum/showthread.php?p=142049
 * adds the ButtonToggleMgr.getSelected(toggleGroup, handler, scope) function
 */
Ext.ButtonToggleMgr = function(){
   var groups = {};
   
   function toggleGroup(btn, state){
       if(state){
           var g = groups[btn.toggleGroup];
           for(var i = 0, l = g.length; i < l; i++){
               if(g[i] != btn){
                   g[i].toggle(false);
               }
           }
       }
   }
   
   return {
       register : function(btn){
           if(!btn.toggleGroup){
               return;
           }
           var g = groups[btn.toggleGroup];
           if(!g){
               g = groups[btn.toggleGroup] = [];
           }
           g.push(btn);
           btn.on("toggle", toggleGroup);
       },
       
       unregister : function(btn){
           if(!btn.toggleGroup){
               return;
           }
           var g = groups[btn.toggleGroup];
           if(g){
               g.remove(btn);
               btn.un("toggle", toggleGroup);
           }
       },
       
       getSelected : function(toggleGroup, handler, scope){
           var g = groups[toggleGroup];
           for(var i = 0, l = g.length; i < l; i++){
               if(g[i].pressed === true){
                   if(handler) {
                        handler.call(scope || g[i], g[i]);   
                   }
                   return g[i];
               }
           }
           return;
       }
   };
}();

// file: /var/www/tine20build/tine20/Tinebase/js/gears_init.js
// Copyright 2007, Google Inc.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//  1. Redistributions of source code must retain the above copyright notice,
//     this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//     this list of conditions and the following disclaimer in the documentation
//     and/or other materials provided with the distribution.
//  3. Neither the name of Google Inc. nor the names of its contributors may be
//     used to endorse or promote products derived from this software without
//     specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
// EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// Sets up google.gears.*, which is *the only* supported way to access Gears.
//
// Circumvent this file at your own risk!
//
// In the future, Gears may automatically define google.gears.* without this
// file. Gears may use these objects to transparently fix bugs and compatibility
// issues. Applications that use the code below will continue to work seamlessly
// when that happens.

(function() {
  // We are already defined. Hooray!
  if (window.google && google.gears) {
    return;
  }

  var factory = null;

  // Firefox
  if (typeof GearsFactory != 'undefined') {
    factory = new GearsFactory();
  } else {
    // IE
    try {
      factory = new ActiveXObject('Gears.Factory');
      // privateSetGlobalObject is only required and supported on WinCE.
      if (factory.getBuildInfo().indexOf('ie_mobile') != -1) {
        factory.privateSetGlobalObject(this);
      }
    } catch (e) {
      // Safari
      if ((typeof navigator.mimeTypes != 'undefined')
           && navigator.mimeTypes["application/x-googlegears"]) {
        factory = document.createElement("object");
        factory.style.display = "none";
        factory.width = 0;
        factory.height = 0;
        factory.type = "application/x-googlegears";
        document.documentElement.appendChild(factory);
      }
    }
  }

  // *Do not* define any objects if Gears is not installed. This mimics the
  // behavior of Gears defining the objects in the future.
  if (!factory) {
    return;
  }

  // Now set up the objects, being careful not to overwrite anything.
  //
  // Note: In Internet Explorer for Windows Mobile, you can't add properties to
  // the window object. However, global objects are automatically added as
  // properties of the window object in all browsers.
  if (!window.google) {
    google = {};
  }

  if (!google.gears) {
    google.gears = {factory: factory};
  }
})();

// file: /var/www/tine20build/tine20/Tinebase/js/extInit.js
/*
 * Tine 2.0
 * 
 * @package     Tine
 * @subpackage  Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 */

/**
 * NOTE: init.js is included before the tine2.0 code!
 */
 
/** --------------------- Ultra Geneirc Javacipt Stuff --------------------- **/

/**
 * create console pseudo object when firebug is disabled/not installed
 */
if (! window.console) window.console = {};
for (fn in {
        // maximum possible console functions based on firebug
        log: null , debug: null, info: null, warn: null, error: null, assert: null, dir: null, dirxml: null, group: null,
        groupEnd: null, time: null, timeEnd: null, count: null, trace: null, profile: null, profileEnd: null
    }) {
    window.console[fn] = window.console[fn] || function() {};
}

/** ------------------------- Gears Initialisation ------------------------- **/
/**
if (window.google && google.gears) {
    var permission = google.gears.factory.getPermission('Tine 2.0', 'images/oxygen/32x32/actions/dialog-information.png', 'Tine 2.0 detected that gears is installed on your computer. Permitting Tine 2.0 to store information on your computer, will increase speed of the software.');
    if (permission) {
        try {
            google.gears.localServer = google.gears.factory.create('beta.localserver');
            google.gears.localServer.store = google.gears.localServer.createManagedStore('tine20-store');
            google.gears.localServer.store.manifestUrl = 'Tinebase/js/tine20-manifest.js';
            google.gears.localServer.store.checkForUpdate();
            
            if (google.gears.localServer.store.updateStatus == 3) {
                console.info('gears localserver store failure: ' + google.gears.localServer.store.lastErrorMessage);
                google.gears.localServer.removeManagedStore('tine20-store');
            }
        } catch (e) {
            console.info("can't initialize gears: " + e);
        }
    }
}
*/
if (window.google && google.gears) {
    var permission = google.gears.factory.getPermission('Odin', 'images/oxygen/32x32/actions/dialog-information.png', 'Odin detected that gears is installed on your computer. Permitting Odin to store information on your computer, will increase speed of the software.');
    if (permission) {
        try {
            google.gears.localServer = google.gears.factory.create('beta.localserver');
            google.gears.localServer.store = google.gears.localServer.createManagedStore('tine20-store');
            google.gears.localServer.store.manifestUrl = 'Tinebase/js/tine20-manifest.js';
            google.gears.localServer.store.checkForUpdate();
            
            if (google.gears.localServer.store.updateStatus == 3) {
                console.info('gears localserver store failure: ' + google.gears.localServer.store.lastErrorMessage);
                google.gears.localServer.removeManagedStore('tine20-store');
            }
        } catch (e) {
            console.info("can't initialize gears: " + e);
        }
    }
}




/** -------------------- Extjs Framework Initialisation -------------------- **/

/**
 * don't fill the ext stats
 */
Ext.BLANK_IMAGE_URL = "library/ExtJS/resources/images/default/s.gif";

/**
 * init ext quick tips
 */
Ext.QuickTips.init();

/**
 * html encode all grid columns per defaut
 */
Ext.grid.ColumnModel.defaultRenderer = Ext.util.Format.htmlEncode;

/**
 * additional date patterns
 * @see{Date}
 */
Date.patterns = {
    ISO8601Long:"Y-m-d H:i:s",
    ISO8601Short:"Y-m-d",
    ISO8601Time:"H:i:s",
    ShortDate: "n/j/Y",
    LongDate: "l, F d, Y",
    FullDateTime: "l, F d, Y g:i:s A",
    MonthDay: "F d",
    ShortTime: "g:i A",
    LongTime: "g:i:s A",
    SortableDateTime: "Y-m-d\\TH:i:s",
    UniversalSortableDateTime: "Y-m-d H:i:sO",
    YearMonth: "F, Y"
};

Ext.util.JSON.encodeDate = function(o){
    var pad = function(n) {
        return n < 10 ? "0" + n : n;
    };
    return '"' + o.getFullYear() + "-" +
        pad(o.getMonth() + 1) + "-" +
        pad(o.getDate()) + " " +
        pad(o.getHours()) + ":" +
        pad(o.getMinutes()) + ":" +
        pad(o.getSeconds()) + '"';
};

/**
 * addidional formats
 */
Ext.util.Format = Ext.apply(Ext.util.Format, {
    euMoney: function(v){
        v.toString().replace(/,/, '.');
        
        v = (Math.round(parseFloat(v)*100))/100;
        
        v = (v == Math.floor(v)) ? v + ".00" : ((v*10 == Math.floor(v*10)) ? v + "0" : v);
        v = String(v);
        var ps = v.split('.');
        var whole = ps[0];
        var sub = ps[1] ? '.'+ ps[1] : '.00';
        var r = /(\d+)(\d{3})/;
        while (r.test(whole)) {
            whole = whole.replace(r, '$1' + '.' + '$2');
        }
        v = whole + sub;
        if(v.charAt(0) == '-'){
            return v.substr(1) + ' -€';
        }  
        return v + " €";
    },
    percentage: function(v){
        if(v === null) {
            return 'none';
        }
        if(!isNaN(v)) {
            return v + " %";                        
        } 
    },
    pad: function(v,l,s){
        if (!s) {
            s = '&nbsp;';
        }
        var plen = l-v.length;
        for (var i=0;i<plen;i++) {
            v += s;
        }
        return v;
   }
});
// file: /var/www/tine20build/tine20/Tinebase/js/Locale.js
/**
 * @license     http://creativecommons.org/licenses/publicdomain Public Domain
 * @author      Koji Horaguchi <horaguchi@horaguchi.net>
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 */
if (typeof Locale == 'undefined') {
  var Locale = function (category, locale) {
    this._instance = true;
    this.LC_ALL =      'C';
    this.LC_COLLATE =  'C';
    this.LC_CTYPE =    'C';
    this.LC_MESSAGES = 'C';
    this.LC_MONETARY = 'C';
    this.LC_NUMERIC =  'C';
    this.LC_TIME =     'C';
    this.setlocale(category, locale);
  };
}

Locale.VERSION = '0.0.3';
Locale.EXPORT = [
  'LC_ALL',
  'LC_COLLATE',
  'LC_CTYPE',
  'LC_MESSAGES',
  'LC_MONETARY',
  'LC_NUMERIC',
  'LC_TIME'
];
Locale.EXPORT_OK = [
  'setlocale'
];
Locale.EXPORT_TAGS = {
  ':common': Locale.EXPORT,
  ':all': Locale.EXPORT.concat(Locale.EXPORT_OK)
};

Locale.prototype.TranslationLists = {};

Locale.LC_ALL =      'LC_ALL';
Locale.LC_COLLATE =  'LC_COLLATE';
Locale.LC_CTYPE =    'LC_CTYPE';
Locale.LC_MESSAGES = 'LC_MESSAGES';
Locale.LC_MONETARY = 'LC_MONETARY';
Locale.LC_NUMERIC =  'LC_NUMERIC';
Locale.LC_TIME =     'LC_TIME';

Locale.setlocale = Locale.prototype.setlocale = function (category, locale) {
  return function () {
    if (locale === null || typeof locale == 'undefined') {
      return this[category];
    }

    if (locale == '') {
      locale = (window.navigator.browserLanguage || window.navigator.language || 'C')
        .replace(/^(.{2}).?(.{2})?.*$/, function (match, lang, terr) {
          return lang.toLowerCase() + (terr ? '_' + terr.toUpperCase() : '');
        });
    }

    switch (category) {
      case Locale.LC_ALL:
        this.LC_ALL      = locale;
        this.LC_COLLATE  = locale;
        this.LC_CTYPE    = locale;
        this.LC_MESSAGES = locale;
        this.LC_MONETARY = locale;
        this.LC_NUMERIC  = locale;
        this.LC_TIME     = locale;
        break;
      case Locale.LC_COLLATE:
      case Locale.LC_CTYPE:
      case Locale.LC_MESSAGES:
      case Locale.LC_MONETARY:
      case Locale.LC_NUMERIC:
      case Locale.LC_TIME:
        this[category] = locale;
        break;
      default:
        return false;
    }
    return locale;
  }.call(this._instance ? this : arguments.callee);
};

Locale.setlocale.LC_ALL =      'C';
Locale.setlocale.LC_COLLATE =  'C';
Locale.setlocale.LC_CTYPE =    'C';
Locale.setlocale.LC_MESSAGES = 'C';
Locale.setlocale.LC_MONETARY = 'C';
Locale.setlocale.LC_NUMERIC =  'C';
Locale.setlocale.LC_TIME =     'C';

/**
 * get translation data from generic locale object (partial clone of Zend Frameworks locale data)
 * 
 * @param   type (Date, Symbol, ...)
 * @param   key  the key
 * @return  translation data
 */
Locale.getTranslationData = function(type, key) {
    
    var value = '';
 
    if ( Locale.prototype.TranslationLists[type] && Locale.prototype.TranslationLists[type][key] ) {
        value = Locale.prototype.TranslationLists[type][key];
    }
    
    return value;
};

// file: /var/www/tine20build/tine20/Tinebase/js/Locale/Gettext.js
/**
 * @license     http://creativecommons.org/licenses/publicdomain Public Domain
 * @author      Koji Horaguchi <horaguchi@horaguchi.net>
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 */
 
/* We don't support dynamic inclusion of po files any longer!
if (typeof ActiveXObject != 'undefined' && typeof XMLHttpRequest == 'undefined') {
  XMLHttpRequest = function () { try { return new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) { return new ActiveXObject("Microsoft.XMLHTTP"); } };
}
*/

/**
 * @constuctor
 */
Locale.Gettext = function (locale) {
    this.locale = typeof locale == 'string' ? new Locale(Locale.LC_ALL, locale) : locale || Locale;
    this.domain = 'messages';
    this.category = Locale.LC_MESSAGES;
    this.suffix = 'po';
    this.dir = '.';
};

Locale.Gettext.prototype.bindtextdomain = function (domain, dir) {
  this.dir = dir;
  this.domain = domain;
};

Locale.Gettext.prototype.textdomain = function (domain) {
  this.domain = domain;
};

Locale.Gettext.prototype.getmsg = function (domain, category, reload) {
  var key = this._getkey(category, domain);
  return Locale.Gettext.prototype._msgs[key];
};

Locale.Gettext.prototype._msgs = {};

Locale.Gettext.prototype._getkey = function(category, domain) {
    return this.dir + '/' + category + '/' + domain; // expect category is str
};

/*
Locale.Gettext.prototype._url = function (category, domain) {
 try {
    var req = new XMLHttpRequest;

    req.open('POST', 'index.php', false);
    req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    req.setRequestHeader('X-Tine20-Request-Type', 'JSON');
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send('method=Tinebase.getTranslations&requestType=JSON&application=' + domain + '&jsonKey=' + Tine.Tinebase.registry.get('jsonKey'));
    if (req.status == 200 || req.status == 304 || req.status == 0 || req.status == null) {
      return Ext.util.JSON.decode(req.responseText);
    }
  } catch (e) {
    return '';
  }
};
*/

Locale.Gettext.prototype.dcgettext = function (domain, msgid, category) {
  var msg = this.getmsg(domain, category);
  
  return msg ? msg.get(msgid) || msgid : msgid;
};

Locale.Gettext.prototype.dcngettext = function (domain, msgid, msgid_plural, n, category) {
  var msg = this.getmsg(domain, category);
  
  if (msg) {
    return (msg.get(msgid, msgid_plural) || [msgid, msgid_plural])[msg.plural(n)];
  } else {
    // fallback if cataloge is not available
    return n > 1 ? msgid_plural : msgid;
  }
};

Locale.Gettext.prototype.dgettext = function (domain, msgid) {
  return this.dcgettext(domain, msgid, this.category);
};

Locale.Gettext.prototype.dngettext = function (domain, msgid, msgid_plural, n) {
  return this.dcngettext(domain, msgid, msgid_plural, n, this.category);
};

Locale.Gettext.prototype.gettext = Locale.Gettext.prototype._ = Locale.Gettext.prototype._hidden = function (msgid) {
  return this.dcgettext(this.domain, msgid, this.category);
};

Locale.Gettext.prototype.ngettext = Locale.Gettext.prototype.n_ = Locale.Gettext.prototype.n_hidden = function (msgid, msgid_plural, n) {
  return this.dcngettext(this.domain, msgid, msgid_plural, n, this.category);
};

Locale.Gettext.prototype.gettext_noop = Locale.Gettext.prototype.N_ = function (msgid) {
  return msgid;
};

// extend object
(function () {
  for (var i in Locale.Gettext.prototype) {
    Locale.Gettext[i] = function (func) {
      return function () {
        return func.apply(Locale.Gettext, arguments);
      };
    }(Locale.Gettext.prototype[i]);
  }
})();

// Locale.Gettext.PO

if (typeof Locale.Gettext.PO == 'undefined') {
  Locale.Gettext.PO = function (object) {
    if (typeof object == 'string' || object instanceof String) {
      this.msg = Locale.Gettext.PO.po2object(object);
    } else if (object instanceof Object) {
      this.msg = object;
    } else {
      this.msg = {};
    }
  };
}

/*
Locale.Gettext.PO.VERSION = '0.0.4';
Locale.Gettext.PO.EXPORT_OK = [
  'po2object',
  'po2json'
];

Locale.Gettext.PO.po2object = function (po) {
  return eval(Locale.Gettext.PO.po2json(po));
};


Locale.Gettext.PO.po2json = function (po) {
  var first = true, plural = false;
  return '({\n' + po
    .replace(/\r?\n/g, '\n')
    .replace(/#.*\n/g, '')
    .replace(/"(\n+)"/g, '')
    .replace(/msgid "(.*?)"\nmsgid_plural "(.*?)"/g, 'msgid "$1, $2"')
    .replace(/msg(\S+) /g, function (match, op) {
      switch (op) {
      case 'id':
        return first
          ? (first = false, '')
          : plural
            ? (plural = false, ']\n, ')
            : ', ';
      case 'str':
        return ': ';
      case 'str[0]':
        return plural = true, ': [\n  ';
      default:
        return ' ,';
      }
    }) + (plural ? ']\n})' : '\n})');
};
*/

Locale.Gettext.PO.prototype.get = function (msgid, msgid_plural) {
  // for msgid_plural == ""
  return typeof msgid_plural != 'undefined' ? this.msg[msgid + ', ' + msgid_plural] : this.msg[msgid];
};

Locale.Gettext.PO.prototype.plural = function (n) {
  var nplurals, plural;
  eval((this.msg[''] + 'Plural-Forms: nplurals=2; plural=n != 1\n').match(/Plural-Forms:(.*)\n/)[1]);
  return plural === true
    ? 1
    : plural === false
      ? 0
      : plural;
};

// create dummy domain
Locale.Gettext.prototype._msgs.emptyDomain = new Locale.Gettext.PO(({}));
// file: /var/www/tine20build/tine20/Tinebase/js/ux/ConnectionStatus.js
/*
 * Tine 2.0
 * 
 * @package     Ext
 * @subpackage  ux
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
Ext.namespace('Ext.ux');

/**
 * @class Ext.ux.ConnectionStatus
 * @constructor
 * 
 */
Ext.ux.ConnectionStatus = function(config) {
    Ext.apply(this, config);
    Ext.ux.ConnectionStatus.superclass.constructor.call(this);
    
};

Ext.extend(Ext.ux.ConnectionStatus, Ext.Button, {
    /**
     * @property {String}
     */
    status: 'unknown',
    /**
     * @private
     */
    iconCls: 'x-ux-connectionstatus-unknown',
    
    /**
     * @property {bool} Browser supports online offline detection
     */
    isSuppoeted: null,
    
    /**
     * @private
     */
    handler: function() {
        if (this.isSuppoeted){
            this.toggleStatus();
        }
    },
    
    initComponent: function() {
        Ext.ux.ConnectionStatus.superclass.initComponent.call(this);
        
        this.onlineText = '(' + _('online') + ')';
        this.offlineText = '(' + _('offline') + ')';
        this.unknownText = '(' + _('unknown') + ')';
        
        // M$ IE has not online/offline events yet
        if (Ext.isIE6 || Ext.isIE7 || ! window.navigator || window.navigator.onLine === undefined) {
            this.setStatus('unknown');
            this.isSupported = false;
        } else {
            this.setStatus(window.navigator.onLine ? 'online' : 'offline');
            this.isSupported = true;
        }
       
        //if (Ext.isGecko3) {
            Ext.getBody().on('offline', function() {
                this.setStatus('offline', true);
            }, this);
            
            Ext.getBody().on('online', function() {
                this.setStatus('online', true);
            }, this);
        //}
    },

    /**
     * toggles online status
     */
    toggleStatus: function() {
        this.setStatus(this.status == 'online' ? 'offline' : 'online');
    },
    
    /**
     * sets online status
     */
    setStatus: function(status) {
        switch (status) {
            case 'online':
                this.status = status;
                this.setText(this.onlineText);
                this.setIconClass('x-ux-connectionstatus-online');
                break;
            case 'offline':
                this.status = status;
                this.setText(this.offlineText);
                this.setIconClass('x-ux-connectionstatus-offline');
                break;
            case 'unknown':
                this.status = status;
                this.setText(this.unknownText);
                this.setIconClass('x-ux-connectionstatus-unknown');
                // as HTML implementation status is verry poor atm. don't bother the user with this state
                this.hide();
                break;
            default:
                console.error('no such status:"' + status + '"');
                break;
        }
    }
});
// file: /var/www/tine20build/tine20/Tinebase/js/ux/DatePickerWeekPlugin.js
/* 
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 */
 
Ext.ns('Ext.ux');

Ext.ux.DatePickerWeekPlugin = function(config) {
    Ext.apply(this, config || {});
    
};

Ext.ux.DatePickerWeekPlugin.prototype = {
    /**
     * @cfg {String} weekHeaderString
     */
    weekHeaderString: 'WK',
    
    init: function(picker) {
        picker.onRender = picker.onRender.createSequence(this.onRender, picker);
        picker.update = picker.update.createSequence(this.update, picker);
        picker.handleDateClick = picker.handleDateClick.createSequence(this.handleDateClick, picker);
        picker.showMonthPicker = picker.showMonthPicker.createInterceptor(this.inspectMonthPickerClick, picker);
        picker.weekHeaderString = this.weekHeaderString;
        
        picker.getRowEl = this.getRowEl.createDelegate(picker);
        picker.selectWeek = this.selectWeek.createDelegate(picker);
        picker.clearSelection = this.clearSelection.createDelegate(picker);
    },
    
    onRender: function() {
        var innerCal = Ext.DomQuery.selectNode('table[class=x-date-inner]', this.getEl().dom);
        var trs = Ext.DomQuery.select('tr', innerCal);
        for (var i=0; i<trs.length; i++) {
            Ext.DomHelper.insertFirst(trs[i], i==0 ? '<th class="x-date-picker-wk-hd">' + this.weekHeaderString + '</th>' : '<td class="x-date-picker-wk"><a class="x-date-date" tabindex="1" hidefocus="on" href="#"><em><span>'+ i +'</span></em></td>');
        }
        
        // update again;
        this.update(this.value);
        
        // shit, datePicker is not on BaxComponent ;-(
        //this.picker.getEl().container.on('resize', function() {
        //    console.log(this.picker.getEl());
        //}, this);
    },
    
    update: function(date, forceRefresh, weekNumber){
        var firstOfMonth = date.getFirstDateOfMonth();
        var startingPos = firstOfMonth.getDay()-this.startDay;
        if(startingPos <= this.startDay) {
            startingPos += 7;
        }
        
        // NOTE "+1" to ensure ISO week!
        var startDate = firstOfMonth.add(Date.DAY, -1*startingPos + 1);
        var wkCells = Ext.DomQuery.select('td[class=x-date-picker-wk]', this.getEl().dom);
        for (var i=0, id; i<wkCells.length; i++) {
            id = Ext.id() + ':' + startDate.add(Date.DAY, i*7).format('Y-m-d');
            wkCells[i].firstChild.firstChild.innerHTML = '<span id="' + id + '">' + startDate.add(Date.DAY, i*7).getWeekOfYear() + '</span>';
        }
        
        if (weekNumber) {
            this.clearSelection();
            
            if (! Ext.isArray(weekNumber)) {
                weekNumber = [weekNumber];
            }
            
            for (var i=0, row; i<weekNumber.length; i++) {
                row = this.getRowEl(weekNumber[i]);
                this.selectWeek(row);
            }
        }
        
    },
    
    handleDateClick: function(e) {
        target = e.getTarget('td[class=x-date-picker-wk]');
        if (target) {
            var row = target.parentNode;
            var weekNumber = target.firstChild.firstChild.firstChild.innerHTML;
            
            if (Ext.DomQuery.select('td[class=x-date-prevday]', row).length > 3 ) {
                this.showPrevMonth()
            } else if (Ext.DomQuery.select('td[class=x-date-nextday]', row).length > 4) {
                this.showNextMonth()
            } 
            
            // get row again
            row = this.getRowEl(weekNumber);
            
            // set new date value
            var value = Date.parseDate(row.firstChild.firstChild.firstChild.firstChild.id.split(':')[1], 'Y-m-d');
            this.setValue(value);
            
            // set selection
            this.clearSelection();
            this.selectWeek(row);
            
            this.fireEvent("select", this, this.value, weekNumber);
        }
    },
    
    getRowEl: function(weekNumber) {
        var wktds = Ext.DomQuery.select('td[class=x-date-picker-wk]', this.getEl().dom);
        for (var i=0; i<wktds.length; i++) {
            if (wktds[i].firstChild.firstChild.firstChild.innerHTML == weekNumber) {
                var rowEl = wktds[i].parentNode;
                break;
            }
        }
        
        return rowEl;
    },
    
    clearSelection: function() {
        var innerCal = Ext.DomQuery.selectNode('table[class=x-date-inner]', this.getEl().dom);
        var dates = Ext.DomQuery.select('td', innerCal);
        for (var i=0; i<dates.length; i++) {
            Ext.fly(dates[i]).removeClass('x-date-selected');
        }
    },
    
    /**
     * inspects month picker onClick event method
     * return false to cancle original onClick handler
     */
    inspectMonthPickerClick: Ext.emptyFn,
    
    selectWeek: function(rowEl) {
        if (rowEl) {
            // set new selection
            for (var j=1; j<rowEl.childNodes.length; j++) {
                Ext.fly(rowEl.childNodes[j]).addClass('x-date-selected');
            }
        }
    }
};
// file: /var/www/tine20build/tine20/Tinebase/js/ux/ButtonLockedToggle.js
/*
 * Tine 2.0
 * 
 * @license     New BSD License
 * @author      www.steinarmyhre.com
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Ext.ux');

/**
 * @class Ext.ux.ButtonLockedToggle & Ext.ux.tbButtonLockedToggle
 * @extends Ext.Button
 * @description
 * The normal button, when enableToggle is used and toggleGroup is set correctly, still allows the user
 * to toggle off the toggled button by pressing on it. This class overrides the toggle-method so that
 * the toggled button is impossible to 'untoggle' other than programmatically or as a reaction
 * to any of the other buttons in the group getting toggled on.
 *
 * Toggle is by the way a very strange word when you repeat it enough.
 *
 * @author www.steinarmyhre.com
 * @constructor
 * Identical to Ext.Button and/or Ext.Toolbar.Button except that enableToggle is true by default.
 * @param (Object/Array) config A config object
 */
Ext.ux.ButtonLockedToggle = Ext.extend(Ext.Button,{
    enableToggle: true,

    toggle: function(state){
        if(state === undefined && this.pressed) {
            return;
        }
        state = state === undefined ? !this.pressed : state;
        if(state != this.pressed){
            if(state){
                this.el.addClass("x-btn-pressed");
                this.pressed = true;
                this.fireEvent("toggle", this, true);
            }else{
                this.el.removeClass("x-btn-pressed");
                this.pressed = false;
                this.fireEvent("toggle", this, false);
            }
            if(this.toggleHandler){
                this.toggleHandler.call(this.scope || this, this, state);
            }
        }
    }
});

//Ext.ux.tbButtonLockedToggle = Ext.extend(Ext.Toolbar.Button, Ext.ux.ButtonLockedToggle);
Ext.reg('btnlockedtoggle', Ext.ux.ButtonLockedToggle);
Ext.reg('tbbtnlockedtoggle', Ext.ux.ButtonLockedToggle);
//Ext.reg('tbbtnlockedtoggle', Ext.ux.tbButtonLockedToggle);

// file: /var/www/tine20build/tine20/Tinebase/js/ux/Percentage.js
/*
 * Tine 2.0
 * 
 * @package     Ext
 * @subpackage  ux
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
Ext.namespace('Ext.ux');

/**
 * Percentage select combo box
 * 
 */
Ext.ux.PercentCombo = Ext.extend(Ext.form.ComboBox, {
    /**
     * @cfg {bool} autoExpand Autoexpand comboBox on focus.
     */
    autoExpand: false,
    /**
     * @cfg {bool} blurOnSelect blurs combobox when item gets selected
     */
    blurOnSelect: false,
    
    displayField: 'value',
    valueField: 'key',
    mode: 'local',
    triggerAction: 'all',
    emptyText: 'percent ...',
    lazyInit: false,
    
    //private
    initComponent: function(){
        Ext.ux.PercentCombo.superclass.initComponent.call(this);
        // allways set a default
        if(!this.value) {
            this.value = 0;
        }
            
        this.store = new Ext.data.SimpleStore({
            fields: ['key','value'],
            data: [
                    ['0',    '0%'],
                    ['10',  '10%'],
                    ['20',  '20%'],
                    ['30',  '30%'],
                    ['40',  '40%'],
                    ['50',  '50%'],
                    ['60',  '60%'],
                    ['70',  '70%'],
                    ['80',  '80%'],
                    ['90',  '90%'],
                    ['100','100%']
                ]
        });
        
        if (this.autoExpand) {
            this.on('focus', function(){
                this.lazyInit = false;
                this.selectByValue(this.getValue());
                this.expand();
            });
        }
        
        if (this.blurOnSelect){
            this.on('select', function(){
                this.fireEvent('blur', this);
            }, this);
        }
    },
    
    setValue: function(value) {
        value = value ? value : 0;
        Ext.ux.PercentCombo.superclass.setValue.call(this, value);
    }
});
Ext.reg('extuxpercentcombo', Ext.ux.PercentCombo);

/**
 * Renders a percentage value to a percentage bar
 * @constructor
 */
Ext.ux.PercentRenderer = function(percent) {
    if (! Ext.ux.PercentRenderer.template) {
        Ext.ux.PercentRenderer.template = new Ext.XTemplate(
            '<div class="x-progress-wrap PercentRenderer">',
            '<div class="x-progress-inner PercentRenderer">',
                '<div class="x-progress-bar PercentRenderer" style="width:{percent}%">',
                    '<div class="PercentRendererText PercentRenderer">',
                        '<div>{percent}%</div>',
                    '</div>',
                '</div>',
                '<div class="x-progress-text x-progress-text-back PercentRenderer">',
                    '<div>&#160;</div>',
                '</div>',
            '</div>',
        '</div>'
        ).compile();
    }
    
    return Ext.ux.PercentRenderer.template.apply({percent: percent});
};

// file: /var/www/tine20build/tine20/Tinebase/js/ux/PopupWindow.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Ext.ux');

/**
 * Class for handling of native browser popup window.
 * <p>This class is intended to make the usage of a native popup window as easy as dealing with a modal window.<p>
 * <p>Example usage:</p>
 * <pre><code>
 var win = new Ext.ux.PopupWindow({
     name: 'TasksEditWindow',
     width: 700,
     height: 300,
     url:index.php?method=Tasks.editTask&taskId=5
 });
 * </code></pre>
 */
Ext.ux.PopupWindow = function(config) {
    Ext.apply(this, config);
    Ext.ux.PopupWindow.superclass.constructor.call(this);
};

Ext.extend(Ext.ux.PopupWindow, Ext.Component, {
	/**
	 * @cfg 
	 * @param {String} url
	 * @desc  url to open
	 */
	url: null,
	/**
	 * @cfg {String} internal name of new window
	 */
	name: 'new window',
	/**
	 * @cfg {Int} width of new window
	 */
	width: 500,
	/**
	 * @cfg {Int} height of new window
	 */
	height: 500,
    /**
     * @cfg {Bolean}
     */
    modal: false,
    /**
     * @cfg {String}
     */
    layout: 'fit',
    /**
     * @cfg {String}
     */
    title: 'Tine 2.0',
    /**
     * @cfg {String} Name of a constructor to create item property
     */
    contentPanelConstructor: null,
    /**
     * @cfg {Object} Config object to pass to itemContructor
     */
    contentPanelConstructorConfig: {},
    /**
     * @property {Browser Window}
     */
    popup: null,
    /**
     * @prperty {Ext.ux.PopupWindowMgr}
     */
    windowManager: null,
    
	/**
	 * @private
	 */
	initComponent: function(){
        this.windowManager = Ext.ux.PopupWindowMgr;
        Ext.ux.PopupWindow.superclass.initComponent.call(this);

        // open popup window first to save time
        this.popup = Tine.Tinebase.common.openWindow(this.name, this.url, this.width, this.height);
        
        //. register window ( in fact register complete PopupWindow )
        this.windowManager.register(this);
        
        // does not work on reload!
        //this.popup.PopupWindow = this;
        
        // strange problems in FF
        //this.injectFramework(this.popup);

        this.addEvents({
            /**
             * @event beforecolse
             * @desc Fires before the Window is closed. A handler can return false to cancel the close.
             * @param {Ext.ux.PopupWindow}
             */
            "beforeclose" : true,
            /**
             * @event render
             * @desc  Fires after the viewport in the popup window is rendered
             * @param {Ext.ux.PopupWindow} 
             */
            "render" : true,
            /**
             * @event close
             * @desc  Fired, when the window got closed
             */
            "close" : true
        });
        
        // NOTE: Do not register unregister with this events, 
        //       as it would be broken on window reloads!
        /*
        if (this.popup.addEventListener) {
            this.popup.addEventListener('load', this.onLoad, true);
            this.popup.addEventListener('unload', this.onClose, true);
        } else if (this.popup.attachEvent) {
            this.popup.attachEvent('onload', this.onLoad);
            this.popup.attachEvent('onunload', this.onClose);
        } else {
            this.popup.onload = this.onLoad;
            this.popup.onunload = this.onClose;
        }
        */
	},
    
    /**
     * rename window name
     * 
     * @param {String} new name
     */
    rename: function(newName) {
        this.windowManager.unregister(this);
        this.name = this.popup.name = newName;
        this.windowManager.register(this);
    },
    
    /**
     * Sets the title text for the panel and optionally the icon class.
     * 
     * @param {String} title The title text to set
     * @param {String} iconCls (optional) iconCls A user-defined CSS class that provides the icon image for this panel
     */
    setTitle: function(title, iconCls) {
        if (this.popup && this.popup.document) {
            this.popup.document.title = title;
        }
    },
    
    /**
     * Closes the window, removes it from the DOM and destroys the window object. 
     * The beforeclose event is fired before the close happens and will cancel 
     * the close action if it returns false.
     */
    close: function() {
        if(this.fireEvent("beforeclose", this) !== false){
            this.fireEvent('close', this);
            this.purgeListeners();
            this.popup.close();
        }
    },
    
	/**
	 * @private
     * 
	 * called after this.popups native onLoad
     * note: 'this' references the popup, whereas window references the parent
	 */
	onLoad: function() {
        this.Ext.onReady(function() {
        	//console.log(this);
        	//console.log(window);
        }, this);
    },
    
    /**
     * @private
     * 
     * note: 'this' references the popup, whereas window references the parent
     */
    onClose: function() {

    }
});


// file: /var/www/tine20build/tine20/Tinebase/js/ux/PopupWindowManager.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 

/**
 * @class Ext.ux.PopupWindowGroup
 * An object that represents a group of {@link Ext.ux.PopupWindow}
 * @constructor
 */
Ext.ux.PopupWindowGroup = function(){
    var list = {};
    var accessList = [];
    var front = null;

    // private
    var cleanupClosedWindows = function() {
        var doc;
        for(var id in list){
            try {
                doc = list[id].popup.document;
            } catch(e)  {
                doc = false;
            }
            if (! doc) {
                accessList.remove(list[id]);
                delete list[id];
                
            }
        }
    };
    /*
    // private
    var sortWindows = function(d1, d2){
        return (!d1._lastAccess || d1._lastAccess < d2._lastAccess) ? -1 : 1;
    };

    // private
    var orderWindows = function(){
        var a = accessList, len = a.length;
        if(len > 0){
            a.sort(sortWindows);
            var seed = a[0].manager.zseed;
            for(var i = 0; i < len; i++){
                var win = a[i];
                if(win && !win.hidden){
                    win.setZIndex(seed + (i*10));
                }
            }
        }
        activateLast();
    };

    // private
    var setActiveWin = function(win){
        if(win != front){
            if(front){
                front.setActive(false);
            }
            front = win;
            if(win){
                win.setActive(true);
            }
        }
    };

    // private
    var activateLast = function(){
        for(var i = accessList.length-1; i >=0; --i) {
            if(!accessList[i].hidden){
                setActiveWin(accessList[i]);
                return;
            }
        }
        // none to activate
        setActiveWin(null);
    };
*/
    return {

        register : function(win){
            cleanupClosedWindows();
            if (! win.popup) {
                console.error('pure window instead of Ext.ux.PopupWindow got registered');
            }
            list[win.name] = win;
            accessList.push(win);
            //win.on('hide', activateLast);
        },

        unregister : function(win){
            delete list[win.name];
            //win.un('hide', activateLast);
            accessList.remove(win);
        },

        /**
         * Gets a registered window by name.
         * @param {String/Object} name The name of the window or a browser window object
         * @return {Ext.ux.PopupWindow}
         */
        get : function(name){
            cleanupClosedWindows();
            name = typeof name == "object" ? name.name : name;
            return list[name];
        },

        /**
         * Brings the specified window to the front of any other active windows.
         * @param {String/Object} win The id of the window or a {@link Ext.Window} instance
         * @return {Boolean} True if the dialog was brought to the front, else false
         * if it was already in front
         */
        bringToFront : function(win){
            win = this.get(win);
            if(win != front){
                win._lastAccess = new Date().getTime();
                win.popup.focus();
                //orderWindows();
                return true;
            }
            return false;
        },
        
        /**
         * Sends the specified window to the back of other active windows.
         * @param {String/Object} win The id of the window or a {@link Ext.Window} instance
         * @return {Ext.Window} The window
         */
        /*
        sendToBack : function(win){
            win = this.get(win);
            win._lastAccess = -(new Date().getTime());
            orderWindows();
            return win;
        },
        */
        
        /**
         * Hides all windows in the group.
         */
        /*
        hideAll : function(){
            for(var id in list){
                if(list[id] && typeof list[id] != "function" && list[id].isVisible()){
                    list[id].hide();
                }
            }
        },
        */
        
        /**
         * Gets the currently-active window in the group.
         * @return {Ext.Window} The active window
         */
        /*
        getActive : function(){
            return front;
        },
        */

        /**
         * Returns zero or more windows in the group using the custom search function passed to this method.
         * The function should accept a single {@link Ext.ux.PopupWindow} reference as its only argument and should
         * return true if the window matches the search criteria, otherwise it should return false.
         * @param {Function} fn The search function
         * @param {Object} scope (optional) The scope in which to execute the function (defaults to the window
         * that gets passed to the function if not specified)
         * @return {Array} An array of zero or more matching windows
         */
        getBy : function(fn, scope){
            cleanupClosedWindows();
            var r = [];
            for(var i = accessList.length-1; i >=0; --i) {
                var win = accessList[i];
                if(fn.call(scope||win, win) !== false){
                    r.push(win);
                }
            }
            return r;
        },

        /**
         * Executes the specified function once for every window in the group, passing each
         * window as the only parameter. Returning false from the function will stop the iteration.
         * @param {Function} fn The function to execute for each item
         * @param {Object} scope (optional) The scope in which to execute the function
         */
        each : function(fn, scope){
            cleanupClosedWindows();
            for(var id in list){
                if(list[id] && typeof list[id] != "function"){
                    if(fn.call(scope || list[id], list[id]) === false){
                        return;
                    }
                }
            }
        }
    };
};

Ext.ux.PopupWindowGroup.MainWindowName = 'MainWindow';
/**
 * returns the main window
 * 
 * @todo move to WindowManager
 */
Ext.ux.PopupWindowGroup.getMainWindow = function() {
    var w = window;
    try {
        while ( w.name != Ext.ux.PopupWindowGroup.MainWindowName) {
            w = w.opener;
            if (! w) {
                return false;
            }
        }
    } catch (e) {
        // lets reuse this window
        w.name = Ext.ux.PopupWindowGroup.MainWindowName;
        return false;
    }
    return w;
};

/**
 * @class Ext.ux.PopupWindowMgr
 * @extends Ext.ux.PopupWindowGroup
 * The default global window group that is available automatically.  To have more than one group of 
 * popup windows, create additional instances of {@link Ext.ux.PopupWindowGroup} as needed.
 * @singleton
 */
var mainWindow = Ext.ux.PopupWindowGroup.getMainWindow();
if (! mainWindow || mainWindow == window) {
    Ext.ux.PopupWindowMgr = new Ext.ux.PopupWindowGroup();
    window.name = Ext.ux.PopupWindowGroup.MainWindowName;
    window.isMainWindow = true;
} else {
    Ext.ux.PopupWindowMgr = Ext.ux.PopupWindowGroup.getMainWindow().Ext.ux.PopupWindowMgr;
    window.isMainWindow = false;
}

// file: /var/www/tine20build/tine20/Tinebase/js/ux/WindowFactory.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Ext.ux');

/**
 * @class Ext.ux.WindowFactory
 * @contructor
 * 
 */
/**
 * @cfg {String} windowType type of window {Ext|Browser|Air}
 */
Ext.ux.WindowFactory = function(config) {
    Ext.apply(this, config);
    
    switch (this.windowType) {
        case 'Browser' :
            this.windowClass = Ext.ux.PopupWindow;
            this.windowManager = Ext.ux.PopupWindowMgr;
            break;
        case 'Ext' :
            this.windowClass = Ext.Window;
            this.windowManager = Ext.WindowMgr;
            break;
        case 'Air' :
            this.windowClass = Ext.air.NativeWindow;
            this.windowManager = Ext.air.NativeWindowManager;
            break;
        default :
            console.error('No such windowType: ' + this.windowType);
            break;
    }
    //Ext.ux.WindowFactory.superclass.constructor.call(this);
};

/**
 * @class Ext.ux.WindowFactory
 */
Ext.ux.WindowFactory.prototype = {
    
    /**
     * @private
     */
    windowClass: null,
    /**
     * @private
     */
    windowManager: null,
    
    /**
     * @rivate
     */
    getBrowserWindow: function(config) {
        var win = Ext.ux.PopupWindowMgr.get(config.name);
        
        if (! win) {
            win = new this.windowClass(config);
        }
        
        Ext.ux.PopupWindowMgr.bringToFront(win);
        return win;
    },
    
    /**
     * @private
     */
    getExtWindow: function(c) {
        // add titleBar
        c.height = c.height + 20;
        
        c.items = this.getContentPanel(c);
        
        // we can only handle one window yet
        c.modal = true;
        
        var win = new Ext.Window(c);
        c.items.window = win;
        
        win.show();
        return win;
    },
    
    /**
     * constructs window items from config properties
     */
    getContentPanel: function(config) {
        var items;
        if (config.contentPanelConstructor) {
            config.contentPanelConstructorConfig = config.contentPanelConstructorConfig || {};
            
            /*
             * IE fix for listeners
             * 
             * In IE we have two problems when dealing with listeners accros windows
             * 1. listeners (functions) are defined in the parent window. a typeof (some function from parent) returns object in IE
             *    the Ext.Observable code can't deal with this
             * 2. listeners get executed by fn.apply(scope, arguments). For some reason in IE this dosn't work with functions defined
             *    in an other window.
             *    
             * To work araoud this, we create new fresh listeners in the new window and proxy the event calls
             */
            var ls = config.contentPanelConstructorConfig.listeners;
            if (ls /* && Ext.isIE */) {
                var lsProxy = {};
                for (var p in ls) {
                    if (ls.hasOwnProperty(p)) {
                        // NOTE apply dosn't work here for some strange reason, so we hope that there are not more than 5 params
                        if (ls[p].fn) {
                            lsProxy[p] = function() {ls[p].fn.call(ls[p].scope, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);};
                        } else {
                            lsProxy[p] = function() {ls[p].call(ls.scope, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);};
                        }
                    }
                }
                config.contentPanelConstructorConfig.listeners = lsProxy;
            }
            
            // place a referece to current window class in the itemConsturctor.
            // this may be overwritten depending on concrete window implementation
            config.contentPanelConstructorConfig.window = config;
            
            // find the constructor in this context
            var parts = config.contentPanelConstructor.split('.');
            var ref = window;
            for (var i=0; i<parts.length; i++) {
                ref = ref[parts[i]];
            }
            
            // finally construct the content panel
            var items = new ref(config.contentPanelConstructorConfig);
        } else {
            items = config.items ? config.items : {};
        }
        
        return items;
    },
    
    /**
     * getWindow
     * 
     * creates new window if not already exists.
     * brings window to front
     */
    getWindow: function(config) {
        
        var windowType = (config.modal) ? 'Ext' : this.windowType;
        
        switch (windowType) {
            case 'Browser' :
                return this.getBrowserWindow(config);
                break;
            case 'Ext' :
                return this.getExtWindow(config);
                break;
            case 'Air' :
                return this.getAirWindow(config);
                break;
            default :
                console.error('No such windowType: ' + this.windowType);
                break;
        }
    }
};

// file: /var/www/tine20build/tine20/Tinebase/js/ux/SliderTip.js
/*
 * Ext JS Library 2.2
 * Copyright(c) 2006-2008, Ext JS, LLC.
 * licensing@extjs.com
 * 
 * http://extjs.com/license
 */


/**
 * @class Ext.ux.SliderTip
 * @extends Ext.Tip
 * Simple plugin for using an Ext.Tip with a slider to show the slider value
 */
Ext.ux.SliderTip = Ext.extend(Ext.Tip, {
    minWidth: 10,
    offsets : [0, -10],
    init : function(slider){
        slider.on('dragstart', this.onSlide, this);
        slider.on('drag', this.onSlide, this);
        slider.on('dragend', this.hide, this);
        slider.on('destroy', this.destroy, this);
    },

    onSlide : function(slider){
        this.show();
        this.body.update(this.getText(slider));
        this.doAutoWidth();
        this.el.alignTo(slider.thumb, 'b-t?', this.offsets);
    },

    getText : function(slider){
        return slider.getValue();
    }
});
// file: /var/www/tine20build/tine20/Tinebase/js/ux/Wizard.js
/*
 * @author Pontifex
 * @version 1.0
 *
 * @class Ext.ux.Wizard
 */
Ext.namespace('Ext.ux');

/**
 * Ext.ux.Wizard Extension Class
 * @extends Ext.Panel
 * @constructor
 * @param {Object} config Configuration options
 */
Ext.ux.Wizard = function(config) {
 
    var _config = Ext.apply({
        
        layout: 'card',
        activeItem: 0,
        bodyStyle: 'paddingTop:15px',
        defaults: {
                // applied to each contained panel
                border: false
            },
        
        buttons  : [
            {text:'Previous', handler: this.movePrevious, scope: this, disabled:true},
            {text:'Next', handler: this.moveNext, scope: this},
            {text:'Finish', handler: this.finishHanlder, scope: this, disabled:true},
            {text:'Cancel', handler: this.hideHanlder, scope: this}
        ]
    }, config||{});
    
    this.currentItem = 0;
    this.template = new Ext.Template('Step {current} of {count}');
    this.mandatorySteps = _config.mandatorySteps;

    Ext.ux.Wizard.superclass.constructor.call(this, _config);
    
    this.addEvents('leave', 'activate', 'finish', 'cancel');
    this.on('render', function(){
        this.footer.addClass('x-panel-footer-wizard');
        this.footer.insertFirst({html: '<div class="x-panel-footer-wizard-status">&nbsp;</div>'});
        this.setStatus();
        return true;
    });
 
}; // end of Ext.ux.Wizard constructor
 
// extend
Ext.extend(Ext.ux.Wizard, Ext.Panel, {
    
    getCurrentStep: function() {
        return this.currentItem + 1;
    },
    getStepCount: function() {
        return this.items.items.length;
    },
    setCurrentStep: function(step) {
        this.move(step-1);
    },
     
    /**
     * @private
     */
    beforeMove: function(currentItem, nextItem, forward) {
        return this.fireEvent('leave', currentItem, nextItem, forward);
    },
    
    /**
     * @private
     */
    setStatus: function() {
        var BUTTON_PREVIOUS = 0;
        var BUTTON_NEXT = 1;
        var BUTTON_FINISH = 2;
        var BUTTON_CANCEL = 3;

        var isFirstItem = (this.getCurrentStep() == 1);
        var isLastItem = (this.getCurrentStep() == this.getStepCount());
        var minimunSteps = isNaN(parseInt(this.mandatorySteps)) ?
                           this.getStepCount() :
                           Math.min(Math.max(parseInt(this.mandatorySteps), 1), this.getStepCount());

        this.buttons[BUTTON_PREVIOUS].setDisabled(isFirstItem);
        this.buttons[BUTTON_NEXT].setDisabled(isLastItem);
        this.buttons[BUTTON_FINISH].setDisabled(!(isLastItem || (minimunSteps < this.getCurrentStep())));
                
        this.footer.first('div div', true).firstChild.innerHTML = this.template.applyTemplate({'current': this.getCurrentStep(), 'count': this.getStepCount()});
    },
    /**
     * @private
     */
    move: function(item) {
        if(item >= 0 && item < this.items.items.length) {
            
            if(this.beforeMove(this.layout.activeItem, this.items.items[item], item > this.currentItem)) {
                this.layout.setActiveItem(item);
                this.currentItem = item;
    
                this.setStatus();                
                this.fireEvent('activate', this.layout.activeItem);
            }
        }
    },
    
    /**
     * @private
     */
    moveNext:function(btn,e){
        this.move(this.currentItem+1);
    },
    
    /**
     * @private
     */
    movePrevious:function(btn,e){
        this.move(this.currentItem-1);
    },
    
    /**
     * @private
     */
    hideHanlder :function(){
        if(this.fireEvent('cancel')) {
            this.hide();
        }
    },
    
    /**
     * @private
     */
    finishHanlder:function(){
        if(this.fireEvent('finish')) {
            this.hide();
        }
    }
});
// file: /var/www/tine20build/tine20/Tinebase/js/ux/SearchField.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Ext.ux');

/**
 * Generic widget for a twintriggerd search field
 */
Ext.ux.SearchField = Ext.extend(Ext.form.TwinTriggerField, {
    /**
     * @cfg {String} paramName
     */
    paramName : 'query',
    /**
     * @cfg {Bool} selectOnFocus
     */
    selectOnFocus : true,
    /**
     * @cfg {String} emptyText
     */
    emptyText: 'enter searchfilter',
    
    validationEvent:false,
    validateOnBlur:false,
    trigger1Class:'x-form-clear-trigger',
    trigger2Class:'x-form-search-trigger',
    hideTrigger1:true,
    width:180,
    hasSearch : false,
    /**
     * @private
     */
    initComponent : function(){
        Ext.ux.SearchField.superclass.initComponent.call(this);
        this.on('specialkey', function(f, e){
            if(e.getKey() == e.ENTER){
                this.onTrigger2Click();
            }
        }, this);
    },
    /**
     * @private
     */
    onTrigger1Click : function(){
        if(this.hasSearch){
            this.el.dom.value = '';
            this.fireEvent('change', this, this.getRawValue(), this.startValue);
            this.startValue = this.getRawValue();
            this.triggers[0].hide();
            this.hasSearch = false;
        }
    },
    /**
     * @private
     */
    onTrigger2Click : function(){
        var v = this.getRawValue();
        if(v.length < 1){
            this.onTrigger1Click();
            return;
        }
        this.fireEvent('change', this, this.getRawValue(), this.startValue);
        this.startValue = this.getRawValue();
        this.hasSearch = true;
        this.triggers[0].show();
    }
});

// file: /var/www/tine20build/tine20/Tinebase/js/ux/BrowseButton.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
Ext.namespace('Ext.ux.form');

/**
 * @class Ext.ux.form.BrowseButton
 * @extends Ext.Button
 */
Ext.ux.BrowseButton = Ext.extend(Ext.Button, {

    initComponent: function() {
        this.plugins = this.plugins || [];
        this.plugins.push( new Ext.ux.file.BrowsePlugin({}));
        
        Ext.ux.BrowseButton.superclass.initComponent.call(this);
    }
});

Ext.reg('browsebutton', Ext.ux.BrowseButton);

// file: /var/www/tine20build/tine20/Tinebase/js/ux/grid/CheckColumn.js
/*
 * Tine 2.0
 * 
 * @package     Ext
 * @subpackage  ux
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
Ext.namespace('Ext.ux', 'Ext.ux.grid');

/**
 * Class for having a checkbox in a girds column.
 * <p>Example usage:</p>
 * <pre><code>
 var cm = new Ext.grid.ColumnModel([
    new Ext.ux.grid.CheckColumn({
        header: 'Read',
        dataIndex: 'readGrant',
        width: 55
    }),
    ...
 ]);
 * </code></pre>
 * @class Ext.ux.grid.CheckColumn
 */
Ext.ux.grid.CheckColumn = function(config){
    Ext.apply(this, config);
    if(!this.id){
        this.id = Ext.id();
    }
    this.renderer = this.renderer.createDelegate(this);
};

Ext.ux.grid.CheckColumn.prototype ={
	/**
	 * @private
	 */
    init : function(grid){
        this.grid = grid;
        this.grid.on('render', function(){
            var view = this.grid.getView();
            view.mainBody.on('mousedown', this.onMouseDown, this);
        }, this);
    },
    /**
     * @private
     */
    onMouseDown : function(e, t){
        if(t.className && t.className.indexOf('x-grid3-cc-'+this.id) != -1){
            e.stopEvent();
            var index = this.grid.getView().findRowIndex(t);
            var record = this.grid.store.getAt(index);
            record.set(this.dataIndex, !record.data[this.dataIndex]);
        }
    },
    /**
     * @private
     */
    renderer : function(v, p, record){
        p.css += ' x-grid3-check-col-td';
        return '<div class="x-grid3-check-col'+(v?'-on':'')+' x-grid3-cc-'+this.id+'">&#160;</div>';
    }
};
// file: /var/www/tine20build/tine20/Tinebase/js/ux/grid/QuickaddGridPanel.js
/*
 * Tine 2.0
 * 
 * @package     Ext
 * @subpackage  ux
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
Ext.namespace('Ext.ux', 'Ext.ux.grid');

/**
 * Class for creating a edittable grid with quick add row on top.
 * <p>As form field for the quick add row, the quickaddField of the column definition is used.<p>
 * <p>The event 'newentry' is fired after the user finished editing the new row.<p>
 * <p>Example usage:</p>
 * <pre><code>
 var g =  new Ext.ux.grid.QuickaddGridPanel({
     ...
     quickaddMandatory: 'summary',
     columns: [
         {
             ...
             id: 'summary',
             quickaddField = new Ext.form.TextField({
                 emptyText: 'Add a task...'
             })
         },
         {
             ...
             id: 'due',
             quickaddField = new Ext.form.DateField({
                 ...
             })
         }
     ]
 });
 * </code></pre>
 */
Ext.ux.grid.QuickaddGridPanel = Ext.extend(Ext.grid.EditorGridPanel, {
	/**
	 * @cfg {String} quickaddMandatory Mandatory field which must be set before quickadd fields will be enabled
	 */
	quickaddMandatory: false,
    
    /**
     * @property {Bool} adding true if a quickadd is in process
     */
    adding: false,
    
    /**
     * @private
     */
    initComponent: function(){
        
        this.idPrefix = Ext.id();
        
        Ext.ux.grid.QuickaddGridPanel.superclass.initComponent.call(this);
        this.addEvents(
            /**
             * @event newentry
             * Fires when add process is finished 
             * @param {Object} data of the new entry
             */
            'newentry'
        );
        
        this.cls = 'x-grid3-quickadd';
        
        // The customized header template
        this.initTemplates();
        
        // add our fields after view is rendered
        this.getView().afterRender = this.getView().afterRender.createSequence(this.renderQuickAddFields, this);
        
        // init handlers
        this.quickaddHandlers = {
        	scope: this,
            blur: function(){
                this.doBlur.defer(250, this);
            },
            specialkey: function(f, e){
                if(e.getKey()==e.ENTER){
                    e.stopEvent();
                    f.el.blur();
                    if(f.triggerBlur){
                        f.triggerBlur();
                    }
                }
            }
        };
    },
    
    /**
     * renders the quick add fields
     */
    renderQuickAddFields: function() {
        
        Ext.each(this.getVisibleCols(), function(item){
            if (item.quickaddField) {
                item.quickaddField.render(this.idPrefix + item.id);
                item.quickaddField.setDisabled(item.id != this.quickaddMandatory);
                item.quickaddField.on(this.quickaddHandlers);
            }
        },this);
        
        // rezise quickeditor fields according to parent column
        this.on('resize', this.syncFields);
        this.on('columnresize', this.syncFields);
        this.syncFields();
        
        this.colModel.getColumnById(this.quickaddMandatory).quickaddField.on('focus', this.onMandatoryFocus, this);
    },
    
    /**
     * @private
     */
    doBlur: function(){
    	
    	// check if all quickadd fields are blured
    	var hasFocus;
    	Ext.each(this.getVisibleCols(), function(item){
    	    if(item.quickaddField.hasFocus){
    	    	hasFocus = true;
    	    }
    	}, this);
    	
    	// only fire a new record if no quickaddField is focused
    	if (!hasFocus) {
    		var data = {};
    		Ext.each(this.getVisibleCols(), function(item){
                data[item.id] = item.quickaddField.getValue();
                item.quickaddField.setDisabled(item.id != this.quickaddMandatory);
            }, this);
            
            if (this.colModel.getColumnById(this.quickaddMandatory).quickaddField.getValue() != '') {
            	if (this.fireEvent('newentry', data)){
                    this.colModel.getColumnById(this.quickaddMandatory).quickaddField.setValue('');
                }
            }
    		
            this.adding = false;
    	}
    	
    },
    /**
     * @private
     */
    getVisibleCols: function(){
    	var enabledCols = [];
    	
    	var cm = this.colModel;
    	var ncols = cm.getColumnCount();
        for (var i=0; i<ncols; i++) {
            if (!cm.isHidden(i)) {
            	var colId = cm.getColumnId(i);
            	enabledCols.push(cm.getColumnById(colId));
            }
        }
        return enabledCols;
    },
    /**
     * @private
     */
    initTemplates: function() {
        this.getView().templates = this.getView().templates ? this.getView().templates : {};
        var ts = this.getView().templates;
        
        var newRows = '';
    	Ext.each(this.getVisibleCols(), function(item){
    	    newRows += '<td><div class="x-small-editor" id="' + this.idPrefix + item.id + '"></div></td>';
    	}, this);
        
    	ts.header = new Ext.Template(
            '<table border="0" cellspacing="0" cellpadding="0" style="{tstyle}">',
            '<thead><tr class="x-grid3-hd-row">{cells}</tr></thead>',
            '<tbody><tr class="new-row">',
                newRows,
            '</tr></tbody>',
            '</table>'
        );
        
        
        /*
        ts.master = new Ext.Template(
            '<div class="x-grid3" hidefocus="true">',
                '<div class="x-grid3-viewport">',
                    '<div class="x-grid3-header x-grid3-quickadd"><div class="x-grid3-header-inner"><div class="x-grid3-header-offset">{header}</div></div><div class="x-clear"></div></div>',
                    '<div class="x-grid3-scroller"><div class="x-grid3-body">{body}</div><a href="#" class="x-grid3-focus" tabIndex="-1"></a></div>',
                "</div>",
                '<div class="x-grid3-resize-marker">&#160;</div>',
                '<div class="x-grid3-resize-proxy">&#160;</div>',
            "</div>"
            );
        
        this.getView().templates = {
            header: this.makeHeaderTemplate()
        };
        */
    },
    /**
     * @private
     */
    syncFields: function(){
        var pxToSubstract = 2;
        if (Ext.isSafari) {pxToSubstract = 11;}

        var cm = this.colModel;
        Ext.each(this.getVisibleCols(), function(item){
            if(item.quickaddField){
            	item.quickaddField.setSize(cm.getColumnWidth(cm.getIndexById(item.id))-pxToSubstract);
            }
        }, this);
    },
    /**
     * @private
     */
    onMandatoryFocus: function() {
        this.adding = true;
        Ext.each(this.getVisibleCols(), function(item){
            item.quickaddField.setDisabled(false);
        }, this);
    }
        
});

// file: /var/www/tine20build/tine20/Tinebase/js/ux/grid/RowExpander.js
/*
 * Ext JS Library 2.1
 * Copyright(c) 2006-2008, Ext JS, LLC.
 * licensing@extjs.com
 * 
 * http://extjs.com/license
 */
 
Ext.ux.grid.RowExpander = function(config){
    Ext.apply(this, config);

    this.addEvents({
        beforeexpand : true,
        expand: true,
        beforecollapse: true,
        collapse: true
    });

    Ext.ux.grid.RowExpander.superclass.constructor.call(this);

    if(this.tpl){
        if(typeof this.tpl == 'string'){
            this.tpl = new Ext.Template(this.tpl);
        }
        this.tpl.compile();
    }

    this.state = {};
    this.bodyContent = {};
};

    Ext.extend(Ext.ux.grid.RowExpander, Ext.util.Observable, {
        header: "",
        width: 20,
        sortable: false,
        fixed:true,
        dataIndex: '',
        id: 'expander',
        lazyRender : true,
        enableCaching: false,
    
        getRowClass : function(record, rowIndex, p, ds){
            p.cols = p.cols-1;
            var content = this.bodyContent[record.id];
            if(!content && !this.lazyRender){
                content = this.getBodyContent(record, rowIndex);
            }
            if(content){
                p.body = content;
            }
            return this.state[record.id] ? 'x-grid3-row-expanded' : 'x-grid3-row-collapsed';
        },
    
        init : function(grid){
            this.grid = grid;
    
            var view = grid.getView();
            view.getRowClass = this.getRowClass.createDelegate(this);
    
            view.enableRowBody = true;
    
            grid.on('render', function(){
                view.mainBody.on('mousedown', this.onMouseDown, this);
            }, this);
        },
    
        getBodyContent : function(record, index){
            if(!this.enableCaching){
                return this.tpl.apply(record.data);
            }
            var content = this.bodyContent[record.id];
            if(!content){
                content = this.tpl.apply(record.data);
                this.bodyContent[record.id] = content;
            }
            return content;
        },
    
        onMouseDown : function(e, t){
            if(t.className == 'x-grid3-row-expander'){
                e.stopEvent();
                var row = e.getTarget('.x-grid3-row');
                this.toggleRow(row);
            }
        },
    
        renderer : function(v, p, record){
            p.cellAttr = 'rowspan="2"';
            return '<div class="x-grid3-row-expander">&#160;</div>';
        },
    
        beforeExpand : function(record, body, rowIndex){
            if(this.fireEvent('beforexpand', this, record, body, rowIndex) !== false){
                if(this.tpl && this.lazyRender){
                    body.innerHTML = this.getBodyContent(record, rowIndex);
                }
                return true;
            }else{
                return false;
            }
        },
    
        toggleRow : function(row){
            if(typeof row == 'number'){
                row = this.grid.view.getRow(row);
            }
            this[Ext.fly(row).hasClass('x-grid3-row-collapsed') ? 'expandRow' : 'collapseRow'](row);
        },
    
        expandRow : function(row){
            if(typeof row == 'number'){
                row = this.grid.view.getRow(row);
            }
            var record = this.grid.store.getAt(row.rowIndex);
            var body = Ext.DomQuery.selectNode('tr:nth(2) div.x-grid3-row-body', row);
            if(this.beforeExpand(record, body, row.rowIndex)){
                this.state[record.id] = true;
                Ext.fly(row).replaceClass('x-grid3-row-collapsed', 'x-grid3-row-expanded');
                this.fireEvent('expand', this, record, body, row.rowIndex);
            }
        },
    
        collapseRow : function(row){
            if(typeof row == 'number'){
                row = this.grid.view.getRow(row);
            }
            var record = this.grid.store.getAt(row.rowIndex);
            var body = Ext.fly(row).child('tr:nth(1) div.x-grid3-row-body', true);
            if(this.fireEvent('beforcollapse', this, record, body, row.rowIndex) !== false){
                this.state[record.id] = false;
                Ext.fly(row).replaceClass('x-grid3-row-expanded', 'x-grid3-row-collapsed');
                this.fireEvent('collapse', this, record, body, row.rowIndex);
            }
        }
});

// file: /var/www/tine20build/tine20/Tinebase/js/ux/grid/PagingToolbar.js
/*
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.ns('Ext.ux.grid');


/**
 * Paging toolbar with build in selection support
 * 
 * @constructor
 * @param {Object} config
 */
Ext.ux.grid.PagingToolbar = Ext.extend(Ext.PagingToolbar, {
    /**
     * @cfg {Bool} displayPageInfo 
     * True to display the displayMsg (defaults to false)
     */
    displayPageInfo: false,
    /**
     * @cfg {Bool} displaySelectionHelper
     * True to display the selectionMsg (defaults to false)
     */
    displaySelectionHelper: false,
    /**
     * @cfg {Ext.grid.AbstractSelectionModel}
     */
    sm: null,
    
    /**
     * @private
     */
    initComponent: function() {
        // we don't use the original display-info handling
        this.displayInfo = false;
        
        // initialise i18n
        this.selHelperText = {
            'main'         : _('{0} selected'),
            'deselect'     : _('Unselect all'),
            'selectvisible': _('Select all visible ({0} records)'),
            'selectall'    : _('Select all pages ({0} records)'),
            'toggle'       : _('Toggle selection')
        };

        Ext.ux.grid.PagingToolbar.superclass.initComponent.call(this);
    },
    
    /**
     * @private
     */
    onRender : function(ct, position) {
        Ext.ux.grid.PagingToolbar.superclass.onRender.call(this, ct, position);
        
        // lets display info be a 'normal' tb item
        this.addFill();
        this.displayEl = Ext.get(this.addText('').getEl());
        
        if (this.displaySelectionHelper) {
            this.renderSelHelper();
        }
    },
    
    /**
     * @private
     */
    renderSelHelper: function() {
        this.deselectBtn = new Ext.Action({
            iconCls: 'x-ux-pagingtb-deselect',
            text: this.getSelHelperText('deselect'),
            scope: this,
            handler: function() {this.sm.clearSelections();}
        });
        this.selectAllPages = new Ext.Action({
            iconCls: 'x-ux-pagingtb-selectall',
            text: this.getSelHelperText('selectall'),
            scope: this,
            handler: function() {this.sm.selectAll();}
        });
        this.selectVisibleBtn = new Ext.Action({
            iconCls: 'x-ux-pagingtb-selectvisible',
            text: this.getSelHelperText('selectvisible'),
            scope: this,
            handler: function() {this.sm.selectAll(true);}
        });
        this.toggleSelectionBtn = new Ext.Action({
            iconCls: 'x-ux-pagingtb-toggle',
            text: this.getSelHelperText('toggle'),
            scope: this,
            handler: function() {this.sm.toggleSelection();}
        });
        
        this.addSeparator();
        this.selHelperBtn = new Ext.Action({
            xtype: 'tbsplit',
            text: this.getSelHelperText('main'),
            iconCls: 'x-ux-pagingtb-main',
            //handler: Ext.emptyFn,
            menu: new Ext.menu.Menu({
                items: [
                    this.deselectBtn,
                    this.selectAllPages,
                    this.selectVisibleBtn, // usefull?
                    this.toggleSelectionBtn
                ]
            })
        });
        
        this.add(this.selHelperBtn);
        
        // update buttons when data or selection changes
        this.sm.on('selectionchange', this.updateSelHelper, this);
        this.store.on('load', this.updateSelHelper, this);
    },
    
    /**
     * update all button descr.
     */
    updateSelHelper: function() {
        this.selHelperBtn.setText(this.getSelHelperText('main'));
        this.selectVisibleBtn.setText(this.getSelHelperText('selectvisible'));
        this.selectAllPages.setText(this.getSelHelperText('selectall'));
    },

    /**
     * get test for button
     * @param {String} domain 
     * @return {String}
     */
    getSelHelperText: function(domain) {
        var num;
        switch(domain) {
            case 'main':
                num = this.sm.getCount();
                break;
            case 'selectvisible':
                num = this.store.getCount();
                break;
            case 'selectall':
                num = this.store.getTotalCount();
                break;
            default:
                return this.selHelperText[domain];
                break;
        }
        
        return String.format(this.selHelperText[domain], num);
    }    
});
// file: /var/www/tine20build/tine20/Tinebase/js/ux/grid/GridViewMenuPlugin.js
/**
 * Ext.ux.grid.GridViewMenuPlugin
 * Copyright (c) 2008, http://www.siteartwork.de
 *
 * Ext.ux.grid.GridViewMenuPlugin is licensed under the terms of the
 *                  GNU Open Source LGPL 3.0
 * license.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the LGPL as published by the Free Software
 * Foundation, either version 3 of the License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the LGPL License for more
 * details.
 *
 * You should have received a copy of the GNU LGPL along with
 * this program. If not, see <http://www.gnu.org/licenses/lgpl.html>.
 *
 */

Ext.namespace('Ext.ux.grid');

/**
 * Renders a menu button to the upper right corner of the grid this plugin is
 * bound to. The menu items will represent the column model and hide/show
 * the columns on click.
 *
 * Note that you have to set the enableHdMenu-property of the bound grid to
 * "false" so this plugin does not interfere with the header menus of the grid's view.
 *
 * @class Ext.ux.grid.GridViewMenuPlugin
 * @extends Object
 * @constructor
 *
 * @author Thorsten Suckow-Homberg <ts@siteartwork.de>
 */
Ext.ux.grid.GridViewMenuPlugin = Ext.extend(Object, {

    /**
     * The {Ext.grid.GridView} this plugin is bound to.
     * @type {Ext.grid.GridView}
     * @protected
     */
    _view : null,

    /**
     * The menu button that gets rendered to the upper right corner of the
     * grid's view.
     * @type {Ext.Element}
     * @protected
     */
    _menuBtn : null,

    /**
     * The menu that will be shown when the menu button gets clicked.
     * Named after the "colModel" property of the grid's view so this plugin
     * can easily operate in the scope of the view.
     * @type {Ext.Menu}
     */
    colMenu : null,

    /**
     * The column model of the grid this plugin is bound to.
     * Named after the "cm" property of the grid's view so this plugin
     * can easily operate in the scope of the view.
     * @type {Ext.grid.ColumnModel}
     */
    cm : null,

    /**
     * Inits this plugin.
     * Method is API-only. Will be called automatically from the grid this
     * plugin is bound to.
     *
     * @param {Ext.grid.GridPanel} grid
     *
     * @throws {Exception} throws an exception if the plugin recognizes the
     * grid's "enableHdMenu" property to be set to "true"
     */
    init : function(grid)
    {
        if (grid.enableHdMenu === true) {
            throw("Ext.ux.grid.GridViewMenuPlugin - grid's \"enableHdMenu\" property has to be set to \"false\"");
        }
        
        var v = this._view = grid.getView();
        v.afterMethod('initElements', this.initElements, this);
        v.afterMethod('initData', this.initData, this);
        v.afterMethod('onLayout', this._onLayout, this);
        v.beforeMethod('destroy', this._destroy, this);
        
        this.colMenu = new Ext.menu.Menu({
            listeners: {
                scope: this,
                beforeshow: this._beforeColMenuShow,
                itemclick: this._handleHdMenuClick
            }
        });
        
        this.colMenu.override({
            show : function(el, pos, parentMenu){
                this.parentMenu = parentMenu;
                if(!this.el){
                    this.render();
                }
                this.fireEvent("beforeshow", this);

                // show menu and constrain to viewport if necessary
                // ( + minor offset adjustments for pixel perfection)
                this.showAt(
                    this.el.getAlignToXY(el, pos || this.defaultAlign, [Ext.isSafari? 2 : 1, 0]), 
                    parentMenu, 
                    true // true to constrain
                );
            }
        });
        

    },

// -------- listeners

    /**
     * Callback for the itemclick event of the menu.
     * Default implementation calls the view's handleHdMenuClick-method in the
     * scope of the view itself.
     *
     * @param {Ext.menu.BaseItem baseItem} item
     * @param {Ext.EventObject} e
     *
     * @return {Boolean} returns false if hiding the column represented by the
     * column is not allowed, otherwise true
     *
     * @protected
     */
    _handleHdMenuClick : function(item, e)
    {
        return this._view.handleHdMenuClick(item, e);
    },

    /**
     * Listener for the beforeshow-event of the menu.
     * Default implementation calls the view's beforeColMenuShow-method
     * in the scope of this plugin.
     *
     * Overwrite this for custom behavior.
     *
     * @param {Ext.menu.Menu} menu
     *
     * @protected
     */
    _beforeColMenuShow : function(menu)
    {
        this._view.beforeColMenuShow.call(this, menu);
        
        // menu title tweak
        this.colMenu.insert(0, new Ext.menu.Separator());
        this.colMenu.insert(0, new Ext.menu.TextItem({
            text: String.format(
                '<img src="{0}" class="x-menu-item-icon x-cols-icon" />{1}',
                Ext.BLANK_IMAGE_URL,
                this._view.columnsText
            ),
            style: 'line-height:16px;padding:3px 21px 3px 27px;'
        }));
    },

    /**
     * Listener for the click event of the menuBtn element.
     * Used internally to show the menu.
     *
     * @param {Ext.EventObject} e
     * @param {HtmlElement} t
     *
     * @protected
     */
    _handleHdDown : function(e, t)
    {
        if(Ext.fly(t).hasClass('x-grid3-hd-btn')){
            e.stopEvent();
            this.colMenu.show(t, "tr-br?");
        }
    },

// -------- helpers

    /**
     * Builds the element that gets added to teh grid's header for showing
     * the menu.
     * The default implementation will render the menu button into the upper
     * right corner of the grid.
     * Overwrite for custom behavior.
     *
     * @return {Ext.Element}
     *
     * @protected
     */
    _getMenuButton : function()
    {
        var a = document.createElement('a');
        a.className = 'ext-ux-grid-gridviewmenuplugin-menuBtn x-grid3-hd-btn';
        a.href = '#';

        return new Ext.Element(a);
    },

    /**
     * Sequenced function for storing the view's cm property,
     * Called in the scope of this plugin.
     */
    initData : function()
    {
        this.cm = this._view.cm;
    },

    /**
     * Sequenced function for adding the menuBtn to the grid's header.
     * Called in the scope of this plugin.
     */
    initElements : function()
    {
        this.menuBtn = this._getMenuButton();
        this._view.mainHd.dom.appendChild(this.menuBtn.dom);
        this.menuBtn.on("click", this._handleHdDown, this);
    },
    
    /**
     * sets the buttons size
     */
    _onLayout: function() {
        this.menuBtn.dom.style.height = (this._view.mainHd.dom.offsetHeight-1)+'px';
    },
    
    /**
     * Hooks into the view's destroy method and removes the menu and the menu
     * button.
     *
     * @protected
     */
    _destroy : function()
    {
        if(this.colMenu){
            this.colMenu.removeAll();
            Ext.menu.MenuMgr.unregister(this.colMenu);
            this.colMenu.getEl().remove();
            delete this.colMenu;
        }

        if(this._menuBtn){
            this._menuBtn.remove();
            delete this._menuBtn;
        }
    }

});

// file: /var/www/tine20build/tine20/Tinebase/js/ux/file/Uploader.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Ext.ux.file');

/**
 * a simple file uploader
 * 
 * objects of this class represent a single file uplaod
 */
Ext.ux.file.Uploader = function(config) {
    Ext.apply(this, config);

    Ext.ux.file.Uploader.superclass.constructor.apply(this, arguments);
    
    this.addEvents(
        /**
         * @event uploadcomplete
         * Fires when the upload was done successfully 
         * @param {Ext.ux.file.Uploader} this
         */
         'uploadcomplete',
        /**
         * @event uploadfailure
         * Fires when the upload failed 
         * @param {Ext.ux.file.Uploader} this
         */
         'uploadfailure'
    );
};
 
Ext.extend(Ext.ux.file.Uploader, Ext.util.Observable, {
    /**
     * @cfg {Int} maxFileSize the maximum file size in bytes
     */
    maxFileSize: 2097152,
    /**
     * @cfg {String} url the url we upload to
     */
    url: 'index.php',
    
    /**
     * creates a form where the upload takes place in
     * @private
     */
    createForm: function() {
        var form = Ext.getBody().createChild({
            tag:'form',
            action:this.url,
            method:'post',
            cls:'x-hidden',
            id:Ext.id(),
            cn:[{
                tag: 'input',
                type: 'hidden',
                name: 'MAX_FILE_SIZE',
                value: this.maxFileSize
            }]
        });
        return form;
    },
    /**
     * perform the upload
     * @return {Ext.ux.file.Uploader} this
     */
    upload: function() {
        var form = this.createForm();
        form.appendChild(this.input);
        this.record = new Ext.ux.file.Uploader.file({
            input: this.input,
            form: form,
            status: 'uploading'
        });
        
        var request = Ext.Ajax.request({
            isUpload: true,
            method:'post',
            form: form,
            scope: this,
            success: this.onUploadSuccess,
            //failure: this.onUploadFail,
            params: {
                method: 'Tinebase.uploadTempFile',
                requestType: 'HTTP'
            }
        });
        
        this.record.set('request', request);
        return this;
    },
    /**
     * returns record with info about this upload
     * @return {Ext.data.Record}
     */
    getRecord: function() {
        return this.record;
    },
    /**
     * executed if a file got uploaded successfully
     */
    onUploadSuccess: function(response, request) {
        response = Ext.util.JSON.decode(response.responseText);
        if (response.status && response.status !== 'success') {
            this.onUploadFail();
        } else {
            this.record.set('status', 'complete');
            this.record.set('tempFile', response.tempFile);
            
            this.fireEvent('uploadcomplete', this, this.record);
        }
    },
    /**
     * executed if a file upload failed
     */
    onUploadFail: function(response, request) {
        this.record.set('status', 'failure');
        
        this.fireEvent('uploadfailure', this, this.record);
    },
    /**
     * get file name
     * @return {String}
     */
    getFileName:function() {
        return this.input.getValue().split(/[\/\\]/).pop();
    },
    /**
     * get file path (excluding the file name)
     * @return {String}
     */
    getFilePath:function() {
        return this.input.getValue().replace(/[^\/\\]+$/,'');
    },
    /**
     * returns file class based on name extension
     * @return {String} class to use for file type icon
     */
    getFileCls: function() {
        var fparts = this.getFileName().split('.');
        if(fparts.length === 1) {
            return '';
        }
        else {
            return fparts.pop().toLowerCase();
        }
    },
    isImage: function() {
        var cls = this.getFileCls();
        return (cls == 'jpg' || cls == 'gif' || cls == 'png' || cls == 'jpeg');
    }
});

Ext.ux.file.Uploader.file = Ext.data.Record.create([
    {name: 'id', type: 'text', system: true},
    {name: 'status', type: 'text', system: true},
    {name: 'tempFile', system: true},
    {name: 'form', system: true},
    {name: 'input', system: true},
    {name: 'request', system: true}
]);
// file: /var/www/tine20build/tine20/Tinebase/js/ux/file/BrowsePlugin.js
/*
 * Tine 2.0
 * 
 * @license     New BSD License
 * @author      loeppky - based on the work done by MaximGB in Ext.ux.UploadDialog (http://extjs.com/forum/showthread.php?t=21558)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
Ext.namespace('Ext.ux.file');

/**
 * @class Ext.ux.file.BrowseAction
 * Reusable action that provides a customizable file browse button.
 * Clicking this button, pops up a file dialog box for a user to select the file to upload.
 * This is accomplished by having a transparent <input type="file"> box above the Ext.Button.
 * When a user thinks he or she is clicking the Ext.Button, they're actually clicking the hidden input "Browse..." box.
 * Note: this class can be instantiated explicitly or with xtypes anywhere a regular Ext.Button can be except in 2 scenarios:
 * - Panel.addButton method both as an instantiated object or as an xtype config object.
 * - Panel.buttons config object as an xtype config object.
 * These scenarios fail because Ext explicitly creates an Ext.Button in these cases.
 * Browser compatibility:
 * Internet Explorer 6:
 * - no issues
 * Internet Explorer 7:
 * - no issues
 * Firefox 2 - Windows:
 * - pointer cursor doesn't display when hovering over the button.
 * Safari 3 - Windows:
 * - no issues.
 * @constructor
 * Create a new BrowseButton.
 * @param {Object} config Configuration options
 */
Ext.ux.file.BrowsePlugin = function(config) {
    Ext.apply(this, config);
};

Ext.ux.file.BrowsePlugin.prototype = {
    /**
     * @cfg {String} inputFileName
     * Name to use for the hidden input file DOM element.  Deaults to "file".
     */
    inputFileName: 'file',
    /**
     * @cfg {Boolean} debug
     * Toggle for turning on debug mode.
     * Debug mode doesn't make clipEl transparent so that one can see how effectively it covers the Ext.Button.
     * In addition, clipEl is given a green background and floatEl a red background to see how well they are positioned.
     */
    debug: false,
    
    
    /*
     * Private constants:
     */
    /**
     * @property FLOAT_EL_WIDTH
     * @type Number
     * The width (in pixels) of floatEl.
     * It should be less than the width of the IE "Browse" button's width (65 pixels), since IE doesn't let you resize it.
     * We define this width so we can quickly center floatEl at the mouse cursor without having to make any function calls.
     * @private
     */
    FLOAT_EL_WIDTH: 60,
    
    /**
     * @property FLOAT_EL_HEIGHT
     * @type Number
     * The heigh (in pixels) of floatEl.
     * It should be less than the height of the "Browse" button's height.
     * We define this height so we can quickly center floatEl at the mouse cursor without having to make any function calls.
     * @private
     */
    FLOAT_EL_HEIGHT: 18,
    
    
    /*
     * Private properties:
     */
    /**
     * @property buttonCt
     * @type Ext.Element
     * Element that contains the actual Button DOM element.
     * We store a reference to it, so we can easily grab its size for sizing the clipEl.
     * @private
     */
    buttonCt: null,
    /**
     * @property clipEl
     * @type Ext.Element
     * Element that contains the floatEl.
     * This element is positioned to fill the area of Ext.Button and has overflow turned off.
     * This keeps floadEl tight to the Ext.Button, and prevents it from masking surrounding elements.
     * @private
     */
    clipEl: null,
    /**
     * @property floatEl
     * @type Ext.Element
     * Element that contains the inputFileEl.
     * This element is size to be less than or equal to the size of the input file "Browse" button.
     * It is then positioned wherever the user moves the cursor, so that their click always clicks the input file "Browse" button.
     * Overflow is turned off to preven inputFileEl from masking surrounding elements.
     * @private
     */
    floatEl: null,
    /**
     * @property inputFileEl
     * @type Ext.Element
     * Element for the hiden file input.
     * @private
     */
    inputFileEl: null,
    /**
     * @property originalHandler
     * @type Function
     * The handler originally defined for the Ext.Button during construction using the "handler" config option.
     * We need to null out the "handler" property so that it is only called when a file is selected.
     * @private
     */
    originalHandler: null,
    /**
     * @property originalScope
     * @type Object
     * The scope originally defined for the Ext.Button during construction using the "scope" config option.
     * While the "scope" property doesn't need to be nulled, to be consistent with originalHandler, we do.
     * @private
     */
    originalScope: null,
    
    /*
     * Protected Ext.Button overrides
     */
    /**
     * @see Ext.Button.initComponent
     */
    init: function(cmp){
        //Ext.ux.file.BrowseAction.superclass.initComponent.call(this);
        // Store references to the original handler and scope before nulling them.
        // This is done so that this class can control when the handler is called.
        // There are some cases where the hidden file input browse button doesn't completely cover the Ext.Button.
        // The handler shouldn't be called in these cases.  It should only be called if a new file is selected on the file system.
        this.originalHandler = cmp.handler || null;
        this.originalScope = cmp.scope || window;
        this.handler = null;
        this.scope = null;
        
        this.component = cmp;
        
        cmp.on('render', this.onRender, this);
        
        // chain enable/disable fns
        if (typeof cmp.setDisabled == 'function') {
            cmp.setDisabled = cmp.setDisabled.createSequence(function(disabled) {
                if (this.inputFileEl) {
                    this.inputFileEl.dom.disabled = disabled;
                }
            }, this);
        }
        
        if (typeof cmp.enable == 'function') {
            cmp.enable = cmp.enable.createSequence(function() {
                if (this.inputFileEl) {
                    this.inputFileEl.dom.disabled = false;
                }
            }, this);
        }
        
        if (typeof cmp.disable == 'function') {
            cmp.disable = cmp.disable.createSequence(function() {
                if (this.inputFileEl) {
                    this.inputFileEl.dom.disabled = true;
                }
            }, this);
        }
        
    },
    
    /**
     * @see Ext.Button.onRender
     */
    onRender: function(){
        
        this.buttonCt = this.buttonCt || this.component.el.child('.x-btn-center em') || this.component.el;
        this.buttonCt.position('relative'); // this is important!
        var styleCfg = {
            position: 'absolute',
            overflow: 'hidden',
            top: '0px', // default
            left: '0px' // default
        };
        // browser specifics for better overlay tightness
        if (Ext.isIE) {
            Ext.apply(styleCfg, {
                left: '-3px',
                top: '-3px'
            });
        } else if (Ext.isGecko) {
            Ext.apply(styleCfg, {
                left: '-3px',
                top: '-3px'
            });
        } else if (Ext.isSafari) {
            Ext.apply(styleCfg, {
                left: '-4px',
                top: '-2px'
            });
        }
        this.clipEl = this.buttonCt.createChild({
            tag: 'div',
            style: styleCfg
        });
        this.setClipSize();
        this.clipEl.on({
            'mousemove': this.onButtonMouseMove,
            'mouseover': this.onButtonMouseMove,
            scope: this
        });
        
        this.floatEl = this.clipEl.createChild({
            tag: 'div',
            style: {
                position: 'absolute',
                width: this.FLOAT_EL_WIDTH + 'px',
                height: this.FLOAT_EL_HEIGHT + 'px',
                overflow: 'hidden'
            }
        });
        
        // set the styles, is IE has problems to follow the mouse
        // when no styles are set
        this.clipEl.applyStyles({
            'background-color': 'green'
        });
        this.floatEl.applyStyles({
            'background-color': 'red'
        });
            
        if (! this.debug) {
            this.clipEl.setOpacity(0.0);
        }
        
        this.createInputFile();
    },
    
    
    /*
     * Private helper methods:
     */
    /**
     * Sets the size of clipEl so that is covering as much of the button as possible.
     * @private
     */
    setClipSize: function(){
        if (this.clipEl) {
            var width = this.buttonCt.getWidth();
            var height = this.buttonCt.getHeight();
            if (Ext.isIE) {
                width = width + 5;
                height = height + 5;
            } else if (Ext.isGecko) {
                width = width + 6;
                height = height + 6;
            } else if (Ext.isSafari) {
                width = width + 6;
                height = height + 6;
            }
            this.clipEl.setSize(width, height);
        }
    },
    
    /**
     * Creates the input file element and adds it to inputFileCt.
     * The created input file elementis sized, positioned, and styled appropriately.
     * Event handlers for the element are set up, and a tooltip is applied if defined in the original config.
     * @private
     */
    createInputFile: function(){
    
        this.inputFileEl = this.floatEl.createChild({
            tag: 'input',
            type: 'file',
            size: 1, // must be > 0. It's value doesn't really matter due to our masking div (inputFileCt).  
            name: this.inputFileName || Ext.id(this.el),
            // Use the same pointer as an Ext.Button would use.  This doesn't work in Firefox.
            // This positioning right-aligns the input file to ensure that the "Browse" button is visible.
            style: {
                position: 'absolute',
                cursor: 'pointer',
                right: '0px',
                top: '0px'
            }
        });
        this.inputFileEl = this.inputFileEl.child('input') || this.inputFileEl;
        
        // setup events
        this.inputFileEl.on({
            'click': this.onInputFileClick,
            'change': this.onInputFileChange,
            scope: this
        });
        
        // add a tooltip
        if (this.tooltip) {
            if (typeof this.tooltip == 'object') {
                Ext.QuickTips.register(Ext.apply({
                    target: this.inputFileEl
                }, this.tooltip));
            } else {
                this.inputFileEl.dom[this.tooltipType] = this.tooltip;
            }
        }
    },
    
    /**
     * Handler when the cursor moves over the clipEl.
     * The floatEl gets centered to the cursor location.
     * @param {Event} e mouse event.
     * @private
     */
    onButtonMouseMove: function(e){
        var xy = e.getXY();
        xy[0] -= this.FLOAT_EL_WIDTH / 2;
        xy[1] -= this.FLOAT_EL_HEIGHT / 2;
        this.floatEl.setXY(xy);
    },
    
    /**
     * Handler when inputFileEl's "Browse..." button is clicked.
     * @param {Event} e click event.
     * @private
     */
    onInputFileClick: function(e){
        e.stopPropagation();
    },
    
    /**
     * Handler when inputFileEl changes value (i.e. a new file is selected).
     * @private
     */
    onInputFileChange: function(){
        if (this.originalHandler) {
            this.originalHandler.call(this.originalScope, this);
        }
    },
    
    
    /*
     * Public methods:
     */
    /**
     * Detaches the input file associated with this BrowseButton so that it can be used for other purposed (e.g. uplaoding).
     * The returned input file has all listeners and tooltips applied to it by this class removed.
     * @param {Boolean} whether to create a new input file element for this BrowseButton after detaching.
     * True will prevent creation.  Defaults to false.
     * @return {Ext.Element} the detached input file element.
     */
    detachInputFile: function(noCreate){
        var result = this.inputFileEl;
        
        if (typeof this.tooltip == 'object') {
            Ext.QuickTips.unregister(this.inputFileEl);
        } else {
            this.inputFileEl.dom[this.tooltipType] = null;
        }
        this.inputFileEl.removeAllListeners();
        this.inputFileEl = null;
        
        if (!noCreate) {
            this.createInputFile();
        }
        return result;
    },
    
    /**
     * @return {Ext.Element} the input file element attached to this BrowseButton.
     */
    getInputFile: function(){
        return this.inputFileEl;
    },
    
    /**
     * @see Ext.Button.disable
     */
    disable: function(){
        Ext.ux.file.BrowseAction.superclass.disable.call(this);
        this.inputFileEl.dom.disabled = true;
    },
    
    /**
     * @see Ext.Button.enable
     */
    enable: function(){
        Ext.ux.file.BrowseAction.superclass.enable.call(this);
        this.inputFileEl.dom.disabled = false;
    }
};

// file: /var/www/tine20build/tine20/Tinebase/js/ux/file/Download.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Ext.ux.file');

Ext.ux.file.Download = function(config) {
    config = config || {};
    Ext.apply(this, config);
    
    Ext.ux.file.Download.superclass.constructor.call(this);
    
    this.addEvents({
        'success': true,
        'fail': true,
        'abort': true
    });
};

Ext.extend(Ext.ux.file.Download, Ext.util.Observable, {    
    url: null,
    method: 'POST',
    params: null,
    
    /**
     * @private 
     */
    form: null,
    transactionId: null,
    
    /**
     * start download
     */
    start: function() {
        this.form = Ext.getBody().createChild({
            tag:'form',
            method: this.method,
            cls:'x-hidden'
        });

        this.transactionId = Ext.Ajax.request({
            isUpload: true,
            form: this.form,
            params: this.params,
            scope: this,
            success: this.onSuccess,
            failure: this.onFailure
        });
    },
    
    /**
     * abort download
     */
    abort: function() {
        console.log('abort');
        Ext.Ajax.abort(this.transactionId);
        this.form.remove();
        this.fireEvent('abort', this);
    },
    
    /**
     * @private
     * 
     */
    onSuccess: function() {
        this.form.remove();
        this.fireEvent('success', this);
    },
    
    /**
     * @private
     * 
     */
    onFailure: function() {
        this.form.remove();
        this.fireEvent('fail', this);
    }
    
});

// file: /var/www/tine20build/tine20/Tinebase/js/ux/form/IconTextField.js
/*
 * Tine 2.0
 * 
 * @package     Ext
 * @subpackage  ux
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
Ext.namespace('Ext.ux', 'Ext.ux.form');

/**
 * Class for creating text-fields with an icon in front of the label.
 * <p>Example usage:</p>
 * <pre><code>
 var field =  new Ext.ux.form.IconTextField({
     labelIcon: 'images/oxygen/16x16/actions/mail.png'
     fieldLabel: 'email',
     name: 'email',
 });
 * </code></pre>
 */
Ext.ux.form.IconTextField = Ext.extend(Ext.form.TextField, {
    /**
     * @cfg {String} LabelIcon icon to be displayed in front of the label
     */
    labelIcon: '',
    /**
     * @private
     */
    initComponent: function(){
         Ext.ux.form.IconTextField.superclass.initComponent.call(this);
         if (this.labelIcon.length > 0){
            this.fieldLabel = '<img src="' + this.labelIcon + '" class="x-ux-form-icontextfield-labelicon">' + this.fieldLabel;
         }
    }
});
Ext.reg('icontextfield', Ext.ux.form.IconTextField);
// file: /var/www/tine20build/tine20/Tinebase/js/ux/form/MirrorTextField.js
/*
 * Tine 2.0
 * 
 * @package     Ext
 * @subpackage  ux
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
Ext.namespace('Ext.ux', 'Ext.ux.form');

/**
 * Class for creating equal text-fields multiple times in a form.
 * If a value gets changed in one of the fields, all other will be updated
 * <p>Example usage:</p>
 * <pre><code>
 var dialog =  new Ext.Panel({
     layout: 'form',
     items: [
         {
             fieldLabel: 'First occurrence',
             xtype: 'mirrortextfield',
             name: 'themirrorfiled'
         },{
             fieldLabel: 'Normal field',
             xtype: 'textfield',
             name: 'someotherfield'
         },{
             fieldLabel: 'Second occurrence',
             xtype: 'mirrortextfield',
             name: 'themirrorfiled'
         },
     ]
 });
 * </code></pre>
 */
Ext.ux.form.MirrorTextField = Ext.extend(Ext.ux.form.IconTextField, {
    /**
     * @private
     */
    initComponent: function(){
         Ext.ux.form.MirrorTextField.superclass.initComponent.call(this);
         Ext.ux.form.MirrorTextFieldManager.register(this);
    },
    /**
     * @private
     */
    setValue: function(value){
        Ext.ux.form.MirrorTextFieldManager.setAll(this, value);
    },
    /**
     * @private
     */
    onDestroy : function(){
        if(this.rendered){
            Ext.ux.form.MirrorTextFieldManager.unregister(this);
        }
    }
});
Ext.reg('mirrortextfield', Ext.ux.form.MirrorTextField);

/**
 * Helper for Ext.ux.form.MirrorTextField
 * @singleton
 */
Ext.ux.form.MirrorTextFieldManager = function() {
    var MirrorTextFields = {};
    
    function MirrorField(field, newValue, oldValue) {
        var m = MirrorTextFields[field.name];
        for(var i = 0, l = m.length; i < l; i++){
            m[i].setRawValue(newValue);
        }
        return true;
    }
    
    return {
        register: function(field) {
            var m = MirrorTextFields[field.name];
            if(!m){
                m = MirrorTextFields[field.name] = [];
            }
            m.push(field);
            field.on("change", MirrorField);
        },
        
        unregister: function(field) {
            var m = MirrorTextFields[field.name];
            if(m){
                m.remove(field);
                field.un("change", MirrorField);
            }
        },
        
        setAll: function(field, value) {
            var m = MirrorTextFields[field.name];
            if(m){
                MirrorField(field, value);
            }
        }
    };
}();
// file: /var/www/tine20build/tine20/Tinebase/js/ux/form/ColumnFormPanel.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Ext.ux', 'Ext.ux.form');

/**
 * @class Ext.ux.form.ColumnFormPanel
 * @description
 * Helper Class for creating form panels with a horizontal layout. This class could be directly
 * created using the new keyword or by specifying the xtype: 'columnform'
 * Example usage:</p>
 * <pre><code>
var p = new Ext.ux.form.ColumnFormPanel({
    title: 'Horizontal Form Layout',
    items: [
        [
            {
                columnWidth: .6,
                fieldLabel:'Company Name', 
                name:'org_name'
            },
            {
                columnWidth: .4,
                fieldLabel:'Street', 
                name:'adr_one_street'
            }
        ],
        [
            {
                columnWidth: .7,
                fieldLabel:'Region',
                name:'adr_one_region'
            },
            {
                columnWidth: .3,
                fieldLabel:'Postal Code', 
                name:'adr_one_postalcode'
            }
        ]
    ]
});
</code></pre>
 */
Ext.ux.form.ColumnFormPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg
     */
    formDefaults: {
        xtype:'icontextfield',
        anchor: '100%',
        labelSeparator: '',
        columnWidth: .333
    },
    
    layout: 'hfit',
    labelAlign: 'top',
    /**
     * @private
     */
    initComponent: function() {
        var items = [];
            
        // each item is an array with the config of one row
        for (var i=0,j=this.items.length; i<j; i++) {
            
            var initialRowConfig = this.items[i];
            var rowConfig = {
                border: false,
                layout: 'column',
                items: []
            };
            // each row consits n column objects 
            for (var n=0,m=initialRowConfig.length; n<m; n++) {
                var column = initialRowConfig[n];
                var idx = rowConfig.items.push({
                    columnWidth: column.columnWidth ? column.columnWidth : this.formDefaults.columnWidth,
                    layout: 'form',
                    labelAlign: this.labelAlign,
                    defaults: this.formDefaults,
                    bodyStyle: 'padding-right: 5px;',
                    border: false,
                    items: column
                });
                
                if (column.width) {
                    rowConfig.items[idx-1].width = column.width;
                    delete rowConfig.items[idx-1].columnWidth;
                }
            }
            items.push(rowConfig);
        }
        this.items = items;
        
        Ext.ux.form.ColumnFormPanel.superclass.initComponent.call(this);
    }
});

Ext.reg('columnform', Ext.ux.form.ColumnFormPanel);


// file: /var/www/tine20build/tine20/Tinebase/js/ux/form/ExpandFieldSet.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Ext.ux', 'Ext.ux.form');

/**
 * Expandable Panel
 * <p>This class provieds a expandable fieldset. The first item is allways visable, whereas 
 * all furthor items are colapsed by default</p>
 * <p>Example usage:</p>
 * <pre><code>
 var p = new Ext.ux.ExpandFieldSet({
     name: 'Expandable Panel',
     items: [
        {
            xtype: 'panel'
            html: 'This panel is always visable'
        },
        {
            xtype: 'panel'
            html: 'This panel is colabsed by default'
        }
     ]
 });
 * </code></pre>
 * <p>The <b>xtype</b> of this panel is <b>expanderfieldset</b>.
 * @todo Generalise this an inherit from Ext.Panel
 */
Ext.ux.form.ExpandFieldSet = Ext.extend(Ext.form.FieldSet, {
    /**
     * @private
     */
    initComponent: function(){
        Ext.ux.form.ExpandFieldSet.superclass.initComponent.call(this);
        
        var panelCount = 0;
        this.items.each(function(item){
            if(panelCount > 0) {
                item.collapsed = true;
                item.on('expand', function(){
                    var innerWidth = this.getInnerWidth();
                    item.setWidth(innerWidth);
                }, this);
            }
            panelCount++;
        }, this);
        this.collapsed = true;
    },
    onRender : function(ct, position){
        Ext.ux.form.ExpandFieldSet.superclass.onRender.call(this, ct, position);
        this.el.addClass('x-tool-expand');
    },
    
    expand: function(animate) {
        var panelCount = 0;
        this.items.each(function(item){
            if(panelCount > 0) {
                item.expand(animate);
            }
            panelCount++;
        }, this);
        this.el.removeClass('x-tool-expand');
        this.el.addClass('x-tool-collapse');
        //this.el.addClass('x-tool-minimize');
        this.collapsed = false;
    },
    collapse: function(animate) {
        var panelCount = 0;
        this.items.each(function(item){
            if(panelCount > 0) {
                item.collapse(animate);
            }
            panelCount++;
        }, this);
        //this.el.addClass(this.collapsedCls);
        this.el.removeClass('x-tool-collapse');
        this.el.addClass('x-tool-expand');
        
        this.collapsed = true;
    }
    
    

});

Ext.reg('expanderfieldset', Ext.ux.form.ExpandFieldSet);
// file: /var/www/tine20build/tine20/Tinebase/js/ux/form/ClearableComboBox.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Ext.ux', 'Ext.ux.form');

/**
 * A ComboBox with a secondary trigger button that clears the contents of the ComboBox
 * 
 */ 
Ext.ux.form.ClearableComboBox = Ext.extend(Ext.form.ComboBox, {
    initComponent : function(){
        Ext.ux.form.ClearableComboBox.superclass.initComponent.call(this);

        this.triggerConfig = {
            tag:'span', cls:'x-form-twin-triggers', style:'padding-right:2px',  // padding needed to prevent IE from clipping 2nd trigger button
            cn:[
                {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger x-form-clear-trigger"},            
                {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger"}                            
            ]
        };
    },

    getTrigger : function(index){
        return this.triggers[index];
    },

    initTrigger : function(){
        var ts = this.trigger.select('.x-form-trigger', true);
        this.wrap.setStyle('overflow', 'hidden');
        var triggerField = this;
        ts.each(function(t, all, index){
            t.hide = function(){
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = 'none';
                triggerField.el.setWidth(w-triggerField.trigger.getWidth());
            };
            t.show = function(){
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = '';
                triggerField.el.setWidth(w-triggerField.trigger.getWidth());
            };
            var triggerIndex = 'Trigger'+(index+1);

            if(this['hide'+triggerIndex]){
                t.dom.style.display = 'none';
            }
            t.on("click", this['on'+triggerIndex+'Click'], this, {preventDefault:true});
            t.addClassOnOver('x-form-trigger-over');
            t.addClassOnClick('x-form-trigger-click');
        }, this);
        this.triggers = ts.elements;
        this.triggers[0].hide();                   
    },
    
    // clear contents of combobox
    onTrigger1Click : function() {
        this.clearValue();
        this.fireEvent('select', this, this.getRawValue(), this.startValue);
        this.startValue = this.getRawValue();
        this.triggers[0].hide();
    },
    // pass to original combobox trigger handler
    onTrigger2Click : function() {
        this.onTriggerClick();
    },
    // show clear triger when item got selected
    onSelect: function(combo, record, index) {
        Ext.ux.form.ClearableComboBox.superclass.onSelect.call(this, combo, record, index);
        this.startValue = this.getValue();
        this.triggers[0].show();
    },
    
    setValue: function(value) {
        Ext.ux.form.ClearableComboBox.superclass.setValue.call(this, value);
        if (value) {
            this.triggers[0].show();
        }
    }

});
// file: /var/www/tine20build/tine20/Tinebase/js/ux/form/RecordsComboBox.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Ext.ux.form');

/**
 * A ComboBox with a (Ext.data.JsonStore) store that loads its data from a record in this format:
 * {
 *  value:1,
 *  records:[{
 *          totalcount: 2,
 *          results: {id: 0, name: 'name 1'}, {id: 1,name: 'name 2'}
 *      }]
 * }
 * 
 * use it like this:
 * {
 *   xtype:'reccombo',
 *   name: 'software_id',
 *   fieldLabel: this.app.i18n._('Software Version'),
 *   displayField: 'name',
 *   store: new Ext.data.Store({
 *      fields: Tine.Voipmanager.Model.SnomSoftware,
 *      proxy: Tine.Voipmanager.SnomSoftwareBackend,
 *      reader: Tine.Voipmanager.SnomSoftwareBackend.getReader(),
 *      remoteSort: true,
 *      sortInfo: {field: 'name', dir: 'ASC'}
 *   })
 * }
 */ 
Ext.ux.form.RecordsComboBox = Ext.extend(Ext.form.ComboBox, {
	
    /**
     * default config
     */
	triggerAction: 'all',
    editable: false,
    forceSelection: true,
    valueField: 'id',
	
	/**
	 * overwrite setValue() to get records
	 * 
	 * @param value
	 */
    setValue: function(value) {
        var val = value;
        // check if object and load options from record
        if(typeof value === 'object' && Object.prototype.toString.call(value) === '[object Object]') {
            if(value['records'] !== undefined) {
            	this.mode = 'local';
                this.store.loadData(value['records']);
            }
            val = value['value'];
        }
        Ext.ux.form.RecordsComboBox.superclass.setValue.call(this, val);
    }
});

// register xtype
Ext.reg('reccombo', Ext.ux.form.RecordsComboBox);

// file: /var/www/tine20build/tine20/Tinebase/js/ux/form/DateTimeField.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Ext.ux', 'Ext.ux.form');

/**
 * A combination of datefield and timefield
 */
Ext.ux.form.DateTimeField = Ext.extend(Ext.form.Field, {
    autoEl: 'div',
    value: '',
    
    initComponent: function() {
        Ext.ux.form.DateTimeField.superclass.initComponent.call(this);
        this.lastValues = [];
        
    },
    
    clearInvalid: function() {
        this.dateField.clearInvalid();
        this.timeField.clearInvalid();
    },
    
    clearTime: function() {
        var dateTime = this.getValue();
        if (Ext.isDate(dateTime)) {
            this.setValue(this.getValue().clearTime(true));
        } else {
            this.timeField.setValue(new Date().clearTime());
        }
        
    },
    
    getName: function() {
        return this.name;
    },
    
    getValue: function() {
        var date = this.dateField.getValue();
        // this is odd, why doesn't Ext.form.TimeField a Date datatype?
        var time = Date.parseDate(this.timeField.getValue(), this.timeField.format);
        
        if (Ext.isDate(date) && Ext.isDate(time)) {
            date = date.clone();
            date.clearTime();
            date = date.add(Date.HOUR, time.getHours());
            date = date.add(Date.MINUTE, time.getMinutes());
        }
        
        return date;
    },
    
    markInvalid: function(msg) {
        this.dateField.markInvalid(msg);
        this.timeField.markInvalid(msg);
    },
    
    onRender: function(ct, position) {
        Ext.ux.form.DateTimeField.superclass.onRender.call(this, ct, position);
        
        this.dateField = new Ext.form.DateField({
            renderTo: this.el,
            readOnly: this.readOnly,
            hideTrigger: this.hideTrigger,
            disabled: this.disabled,
            tabIndex: this.tabIndex == -1 ? this.tabIndex : false,
            listeners: {
                scope: this,
                change: this.onDateChange
            }
        });
        
        this.timeField = new Ext.form.TimeField({
            renderTo: this.el,
            readOnly: this.readOnly,
            hideTrigger: this.hideTrigger,
            disabled: this.disabled,
            tabIndex: this.tabIndex == -1 ? this.tabIndex : false,
            listeners: {
                scope: this,
                change: this.onTimeChange
            }
        });
        
    },
    
    onDateChange: function() {
        var newValue = this.getValue();
        this.setValue(newValue);
        this.fireEvent('change', this, newValue, this.lastValues.length > 1 ? this.lastValues[this.lastValues.length-2] : '');
    },
    
    onResize : function(w, h) {
        Ext.ux.form.DateTimeField.superclass.onResize.apply(this, arguments);
        
        this.el.setHeight(15);
        
        this.dateField.wrap.setStyle({'position': 'absolute'});
        this.dateField.setWidth(w * 0.55 -5);
        
        this.timeField.wrap.setStyle({'position': 'absolute'});
        this.timeField.setWidth(w * 0.45);
        this.timeField.wrap.setRight(0);
    },
    
    onTimeChange: function() {
        var newValue = this.getValue();
        this.setValue(newValue);
        this.fireEvent('change', this, newValue, this.lastValues.length > 1 ? this.lastValues[this.lastValues.length-2] : '');
    },
    
    setDisabled: function(bool, what) {
        if (what !== 'time') {
            this.dateField.setDisabled(bool);
        }
        
        if (what !== 'date') {
            this.timeField.setDisabled(bool);
        }
    },
    
    setRawValue: Ext.EmptyFn,
    
    setValue: function(value, skipHistory) {
        if (! skipHistory) {
            this.lastValues.push(value);
        }
        
        this.dateField.setValue(value);
        this.timeField.setValue(value);
    },
    
    undo: function() {
        if (this.lastValues.length > 1) {
            this.lastValues.pop();
            this.setValue(this.lastValues[this.lastValues.length-1], true);
        } else {
            this.reset();
        }
    }
});
Ext.reg('datetimefield', Ext.ux.form.DateTimeField);
// file: /var/www/tine20build/tine20/Tinebase/js/ux/form/ClearableDateField.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Ext.ux', 'Ext.ux.form');

/**
 * A DateField with a secondary trigger button that clears the contents of the DateField
 */
Ext.ux.form.ClearableDateField = Ext.extend(Ext.form.DateField, {
    initComponent : function(){
        Ext.ux.form.ClearableDateField.superclass.initComponent.call(this);

        this.triggerConfig = {
            tag:'span', cls:'x-form-twin-triggers',
            cn:[
                {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger x-form-clear-trigger"},            
                {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger x-form-date-trigger"}                            
            ]
        };
    },

    getTrigger : function(index){
        return this.triggers[index];
    },

    initTrigger : function(){
        var ts = this.trigger.select('.x-form-trigger', true);
        this.wrap.setStyle('overflow', 'hidden');
        var triggerField = this;
        ts.each(function(t, all, index){
            t.hide = function(){
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = 'none';
                triggerField.el.setWidth(w-triggerField.trigger.getWidth());
            };
            t.show = function(){
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = '';
                triggerField.el.setWidth(w-triggerField.trigger.getWidth());
            };
            var triggerIndex = 'Trigger'+(index+1);

            if(this['hide'+triggerIndex]){
                t.dom.style.display = 'none';
            }
            t.on("click", this['on'+triggerIndex+'Click'], this, {preventDefault:true});
            t.addClassOnOver('x-form-trigger-over');
            t.addClassOnClick('x-form-trigger-click');
        }, this);
        this.triggers = ts.elements;        
        this.triggers[0].hide();                   
    },
    
    validateValue : function(value) {
        if(value !== this.emptyText && value !== undefined && value.length > '1'){
            this.triggers[0].show();
        }      
      
        return true;
    },    
    // clear contents of combobox
    onTrigger1Click : function() {
        this.reset();
        this.fireEvent('select', this, '' , '');
        this.triggers[0].hide();
    },
    // pass to original combobox trigger handler
    onTrigger2Click : function() {
        this.onTriggerClick();
    }
});
Ext.reg('extuxclearabledatefield', Ext.ux.form.ClearableDateField);
// file: /var/www/tine20build/tine20/Tinebase/js/ux/form/ImageField.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Ext.ux.form');

/**
 * @class Ext.ux.form.ImageField
 * 
 * <p>A field which displayes a image of the given url and optionally supplies upload
 * button with the feature to display the newly uploaded image on the fly</p>
 * <p>Example usage:</p>
 * <pre><code>
 var formField = new Ext.ux.form.ImageField({
     name: 'jpegimage',
     width: 90,
     height: 90
 });
 * </code></pre>
 */
Ext.ux.form.ImageField = Ext.extend(Ext.form.Field, {
    /**
     * @cfg {bool}
     */
    border: true,
    /**
     * @cfg {String}
     */
    defaultImage: 'images/empty_photo.png',
    
    defaultAutoCreate : {tag:'input', type:'hidden'},
    
    initComponent: function() {
        this.plugins = this.plugins || [];
        this.scope = this;
        this.handler = this.onFileSelect;
        
        this.browsePlugin = new Ext.ux.file.BrowsePlugin({});
        this.plugins.push(this.browsePlugin);
        
        Ext.ux.form.ImageField.superclass.initComponent.call(this);
        this.imageSrc = this.defaultImage;
        if(this.border === true) {
            this.width = this.width;
            this.height = this.height;
        }
    },
    onRender: function(ct, position) {
        Ext.ux.form.ImageField.superclass.onRender.call(this, ct, position);
        
        // the container for the browe button
        this.buttonCt = Ext.DomHelper.insertFirst(ct, '<div>&nbsp;</div>', true);
        this.buttonCt.applyStyles({
            border: this.border === true ? '1px solid #B5B8C8' : '0'
        });
        this.buttonCt.setSize(this.width, this.height);
        this.buttonCt.on('contextmenu', this.onContextMenu, this);
        
        // the click to edit text container
        var clickToEditText = _('click to edit');
        this.textCt = Ext.DomHelper.insertFirst(this.buttonCt, '<div class="x-ux-from-imagefield-text">' + clickToEditText + '</div>', true);
        this.textCt.setSize(this.width, this.height);
        var tm = Ext.util.TextMetrics.createInstance(this.textCt);
        tm.setFixedWidth(this.width);
        this.textCt.setStyle({top: ((this.height - tm.getHeight(clickToEditText)) / 2) + 'px'});
        
        // the image container
        // NOTE: this will atm. always be the default image for the first few miliseconds
        this.imageCt = Ext.DomHelper.insertFirst(this.buttonCt, '<img src="' + this.imageSrc + '"/>' , true);
        this.imageCt.setOpacity(0.2);
        this.imageCt.setStyle({
            position: 'absolute',
            top: '18px'
        });
        
        Ext.apply(this.browsePlugin, {
            buttonCt: this.buttonCt,
            renderTo: this.buttonCt
        });
        
        /*
        this.bb = new Ext.ux.form.BrowseButton({
            //debug: true,
            buttonCt: this.buttonCt,
            renderTo: this.buttonCt,
            scope: this,
            handler: this.onFileSelect
        });
        */
    },
    getValue: function() {
        var value = Ext.ux.form.ImageField.superclass.getValue.call(this);
        return value;
    },
    setValue: function(value) {
        Ext.ux.form.ImageField.superclass.setValue.call(this, value);
        if (! value || value == this.defaultImage) {
            this.imageSrc = this.defaultImage;
        } else {
            this.imageSrc = Ext.ux.util.ImageURL.prototype.parseURL(value);
            this.imageSrc.width = this.width;
            this.imageSrc.height = this.height;
            this.imageSrc.ratiomode = 0;
        }
        this.updateImage();
    },
    /**
     * @private
     */
    onFileSelect: function(bb) {
        var input = bb.detachInputFile();
        var uploader = new Ext.ux.file.Uploader({
            input: input
        });
        if(! uploader.isImage()) {
            Ext.MessageBox.alert(_('Not An Image'), _('Plase select an image file (gif/png/jpeg)')).setIcon(Ext.MessageBox.ERROR);
            return;
        }
        uploader.on('uploadcomplete', function(uploader, record){
            //var method = Ext.util.Format.htmlEncode('');
            this.imageSrc = new Ext.ux.util.ImageURL({
                id: record.get('tempFile').id,
                width: this.width,
                height: this.height,
                ratiomode: 0
            });
            this.setValue(this.imageSrc);
            
            this.updateImage();
        }, this);
        uploader.on('uploadfailure', this.onUploadFail, this);
        
        this.buttonCt.mask(_('Loading'), 'x-mask-loading');
        uploader.upload();
        
        if (this.ctxMenu) {
            this.ctxMenu.hide();
        }
    },
    /**
     * @private
     */
    onUploadFail: function() {
        Ext.MessageBox.alert(_('Upload Failed'), _('Could not upload image. Please notify your Administrator')).setIcon(Ext.MessageBox.ERROR);
    },
    /**
     * executed on image contextmenu
     * @private
     */
    onContextMenu: function(e, input) {
        e.preventDefault();
        
        var ct = Ext.DomHelper.append(this.buttonCt, '<div>&nbsp;</div>', true);
        
        var upload = new Ext.menu.Item({
            text: _('Change Image'),
            iconCls: 'action_uploadImage',
            handler: this.onFileSelect,
            scope: this,
            plugins: [new Ext.ux.file.BrowsePlugin({})]
        });
        /*
        upload.on('render', function(){
            var ct = upload.getEl();
            var bb = new Ext.ux.form.BrowseButton({
                buttonCt: ct,
                renderTo: ct,
                //debug: true,
                scope: this,
                handler: function(bb) {
                    this.ctxMenu.hide();
                    this.onFileSelect(bb);
                }
            });
        }, this);
        */
        
        this.ctxMenu = new Ext.menu.Menu({
            items: [
            upload,
            {
                text: _('Crop Image'),
                iconCls: 'action_cropImage',
                scope: this,
                disabled: true, //this.imageSrc == this.defaultImage,
                handler: function() {
                    var cropper = new Ext.ux.form.ImageCropper({
                        imageURL: this.imageSrc
                    });
                    
                    var dlg = new Tine.widgets.dialog.EditRecord({
                        handlerScope: this,
                        handlerCancle: this.close,
                        items: cropper
                    });
                    
                    var win = new Ext.Window({
                        width: 320,
                        height: 320,
                        title: _('Crop Image'),
                        layout: 'fit',
                        items: dlg
                    });
                    win.show();
                }
            
            },{
                text: _('Delete Image'),
                iconCls: 'action_delete',
                disabled: this.imageSrc == this.defaultImage,
                scope: this,
                handler: function() {
                    this.setValue('');
                }
                
            },{
                text: _('Show Original Image'),
                iconCls: 'action_originalImage',
                disabled: this.imageSrc == this.defaultImage,
                scope: this,
                handler: this.downloadImage
                
            }]
        });
        this.ctxMenu.showAt(e.getXY());
    },
    
    downloadImage: function() {
        var url = Ext.apply(this.imageSrc, {
            height: -1,
            width: -1
        }).toString();
        
        Tine.Tinebase.common.openWindow('showImage', url, 800, 600);
    },
    
    updateImage: function() {
        // only update when new image differs from current
        if(this.imageCt.dom.src.substr(-1 * this.imageSrc.length) != this.imageSrc) {
            var ct = this.imageCt.up('div');
            var img = Ext.DomHelper.insertAfter(this.imageCt, '<img src="' + this.imageSrc + '"/>' , true);
            // replace image after load
            img.on('load', function(){
                this.imageCt.remove();
                this.imageCt = img;
                this.textCt.setVisible(this.imageSrc == this.defaultImage);
                this.imageCt.setOpacity(this.imageSrc == this.defaultImage ? 0.2 : 1);
                this.buttonCt.unmask();
            }, this);
            img.on('error', function() {
                Ext.MessageBox.alert(_('Image Failed'), _('Could not load image. Please notify your Administrator')).setIcon(Ext.MessageBox.ERROR);
                this.buttonCt.unmask();
            }, this);
        }
    }
});

Ext.namespace('Ext.ux.util');

/**
 * this class represents an image URL
 */
Ext.ux.util.ImageURL = function(config) {
    Ext.apply(this, config, {
        url: 'index.php',
        method: 'Tinebase.getImage',
        application: 'Tinebase',
        location: 'tempFile',
        width: 90,
        height: 120,
        ratiomode: 0
    }); 
};
/**
 * generates an imageurl according to the class members
 * 
 * @return {String}
 */
Ext.ux.util.ImageURL.prototype.toString = function() {
    return this.url + 
        "?method=" + this.method + 
        "&application=" + this.application + 
        "&location=" + this.location + 
        "&id=" + this.id + 
        "&width=" + this.width + 
        "&height=" + this.height + 
        "&ratiomode=" + this.ratiomode;
};
/**
 * parses an imageurl
 * 
 * @param  {String} url
 * @return {Ext.ux.util.ImageURL}
 */
Ext.ux.util.ImageURL.prototype.parseURL = function(url) {
    var url = url.toString();
    var params = {};
    var lparams = url.substr(url.indexOf('?')+1).split('&');
    for (var i=0, j=lparams.length; i<j; i++) {
        var param = lparams[i].split('=');
        params[param[0]] = Ext.util.Format.htmlEncode(param[1]);
    }
    return new Ext.ux.util.ImageURL(params);
};


// file: /var/www/tine20build/tine20/Tinebase/js/ux/form/ImageCropper.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Ext.ux.form');

Ext.ux.form.ImageCropper = function(config) {
    Ext.apply(this, config);

    Ext.ux.form.ImageCropper.superclass.constructor.apply(this, arguments);
    
    this.addEvents(
        /**
         * @event uploadcomplete
         * Fires when the upload was done successfully 
         * @param {String} croped image
         */
         'imagecropped'
    );
};

Ext.extend(Ext.ux.form.ImageCropper, Ext.Component, {
    /**
     * @property {Object} natrual size of image
     */
    imageSize: false,
    
    width: 320,
    height: 320,
    
    initComponent: function() {
        this.imageURL.width = 290;
        this.imageURL.height = 240;
        this.imageURL.ratiomode = 1;

        Ext.ux.form.ImageCropper.superclass.initComponent.call(this);
    },
    onRender: function(ct, position) {
        Ext.ux.form.ImageCropper.superclass.onRender.call(this, ct, position);
        this.wrapEl = Ext.DomHelper.insertFirst(ct, {tag: 'div'}, true);
        //this.maskEl = Ext.DomHelper.insertFirst(this.wrapEl, {tag: 'div', style: 'background-color: #000000'}, true);
        
        // bg image
        this.bgImageEl = Ext.DomHelper.insertFirst(this.wrapEl, {tag: 'img', id: 'yui_img', src: this.imageURL}, true);
        this.bgImageEl.setOpacity(0.5);
        
        // yui cropper is very fast. 
        // cause of the window usage the yui crop mask does not work, so we use the mask obove
        /*
        var Dom = YAHOO.util.Dom, 
        Event = YAHOO.util.Event; 
    
        var crop = new YAHOO.widget.ImageCropper('yui_img');
        */
        
         // Ext only implementation is very slow!
         // the bad news is that the resizeable dosn't fire events while resizeing 
         // and that the dd onDrag looses scope
         this.fgImageEl = Ext.DomHelper.insertFirst(this.wrapEl, {tag: 'div', style: {
            width              : '100px',
            height             : '100px',
            position           : 'absolute',
            top                : '30px',
            left               : '30px',
            'background-image' : 'url(' + this.imageURL + ')',
            'background-repeat': 'no-repeat'
        }}, true);
        
        this.resizeable = new Ext.Resizable(this.fgImageEl, {
            wrap:true,
            pinned:true,
            handles: 's e se',
            draggable:true,
            dynamic:true
        });
        this.resizeable.dd.fgImageEl = this.fgImageEl;
        this.resizeable.dd.bgImageEl = this.bgImageEl;
        
        this.resizeable.dd.onDrag = this.syncImageEls;
        
        // fix opacity, which might be broken by the inherited window properties
        var rhs = this.resizeable.getEl().query('div.x-resizable-handle');
        for (var i=0, j=rhs.length; i<j; i++) {
            Ext.get(rhs[i]).setOpacity(1);
        }
        this.syncImageEls();
    },
    /**
     * sync fg image with bg image
     */
    syncImageEls: function() {
        var dx = this.bgImageEl.getX() - this.fgImageEl.getX();
        var dy = this.bgImageEl.getY() - this.fgImageEl.getY();
        this.fgImageEl.setStyle('background-position', dx + 'px ' + dy + 'px');
    }
});

// file: /var/www/tine20build/tine20/Tinebase/js/ux/form/Spinner.js
/**
 * Copyright (c) 2008, Steven Chim
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *     * The names of its contributors may not be used to endorse or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
  * Ext.ux.form.Spinner Class
	*
	* @author  Steven Chim
	* @version Spinner.js 2008-08-27 v0.35
  *
  * @class Ext.ux.form.Spinner
  * @extends Ext.form.TriggerField
  */

Ext.namespace("Ext.ux.form");

Ext.ux.form.Spinner = function(config){
	Ext.ux.form.Spinner.superclass.constructor.call(this, config);
	this.addEvents({
		'spin' : true,
		'spinup' : true,
		'spindown' : true
	});
};

Ext.extend(Ext.ux.form.Spinner, Ext.form.TriggerField, {
	triggerClass : 'x-form-spinner-trigger',
	splitterClass : 'x-form-spinner-splitter',

	alternateKey : Ext.EventObject.shiftKey,
	strategy : undefined,

	//private
	onRender : function(ct, position){
		Ext.ux.form.Spinner.superclass.onRender.call(this, ct, position);

		this.splitter = this.wrap.createChild({tag:'div', cls:this.splitterClass, style:'width:13px; height:2px;'});
		this.splitter.show().setRight( (Ext.isIE) ? 1 : 2 );
		this.splitter.show().setTop(8);

		this.proxy = this.trigger.createProxy('', this.splitter, true);
		this.proxy.addClass("x-form-spinner-proxy");
		this.proxy.setStyle('left','0px');  
		this.proxy.setSize(14, 1);
		this.proxy.hide();
		this.dd = new Ext.dd.DDProxy(this.splitter.dom.id, "SpinnerDrag", {dragElId: this.proxy.id});

		this.initSpinner();
	},

	//private
	initTrigger : function(){
		this.trigger.addClassOnOver('x-form-trigger-over');
		this.trigger.addClassOnClick('x-form-trigger-click');
	},

	//private
	initSpinner : function(){
		this.keyNav = new Ext.KeyNav(this.el, {
			"up" : function(e){
				e.preventDefault();
				this.onSpinUp();
			},

			"down" : function(e){
				e.preventDefault();
				this.onSpinDown();
			},

			"pageUp" : function(e){
				e.preventDefault();
				this.onSpinUpAlternate();
			},

			"pageDown" : function(e){
				e.preventDefault();
				this.onSpinDownAlternate();
			},

			scope : this
		});

		this.repeater = new Ext.util.ClickRepeater(this.trigger);
		this.repeater.on("click", this.onTriggerClick, this, {preventDefault:true});
		this.trigger.on("mouseover", this.onMouseOver, this, {preventDefault:true});
		this.trigger.on("mouseout",  this.onMouseOut,  this, {preventDefault:true});
		this.trigger.on("mousemove", this.onMouseMove, this, {preventDefault:true});
		this.trigger.on("mousedown", this.onMouseDown, this, {preventDefault:true});
		this.trigger.on("mouseup",   this.onMouseUp,   this, {preventDefault:true});
		this.wrap.on("mousewheel",   this.handleMouseWheel, this);

		this.dd.setXConstraint(0, 0, 10);
		this.dd.setYConstraint(1500, 1500, 10);
		this.dd.endDrag = this.endDrag.createDelegate(this);
		this.dd.startDrag = this.startDrag.createDelegate(this);
		this.dd.onDrag = this.onDrag.createDelegate(this);

        /*
        jsakalos suggestion
        http://extjs.com/forum/showthread.php?p=121850#post121850 */
        if('object' == typeof this.strategy && this.strategy.xtype) {
            switch(this.strategy.xtype) {
                case 'number':
                    this.strategy = new Ext.ux.form.Spinner.NumberStrategy(this.strategy);
	                break;

                case 'date':
                    this.strategy = new Ext.ux.form.Spinner.DateStrategy(this.strategy);
	                break;

                case 'time':
                    this.strategy = new Ext.ux.form.Spinner.TimeStrategy(this.strategy);
                	break;

                default:
                    delete(this.strategy);
                	break;
            }
            delete(this.strategy.xtype);
        }

		if(this.strategy == undefined){
			this.strategy = new Ext.ux.form.Spinner.NumberStrategy();
		}
	},

	//private
	onMouseOver : function(){
		if(this.disabled){
			return;
		}
		var middle = this.getMiddle();
		this.__tmphcls = (Ext.EventObject.getPageY() < middle) ? 'x-form-spinner-overup' : 'x-form-spinner-overdown';
		this.trigger.addClass(this.__tmphcls);
	},

	//private
	onMouseOut : function(){
		this.trigger.removeClass(this.__tmphcls);
	},

	//private
	onMouseMove : function(){
		if(this.disabled){
			return;
		}
		var middle = this.getMiddle();
		if( ((Ext.EventObject.getPageY() > middle) && this.__tmphcls == "x-form-spinner-overup") ||
			((Ext.EventObject.getPageY() < middle) && this.__tmphcls == "x-form-spinner-overdown")){
		}
	},

	//private
	onMouseDown : function(){
		if(this.disabled){
			return;
		}
		var middle = this.getMiddle();
		this.__tmpccls = (Ext.EventObject.getPageY() < middle) ? 'x-form-spinner-clickup' : 'x-form-spinner-clickdown';
		this.trigger.addClass(this.__tmpccls);
	},

	//private
	onMouseUp : function(){
		this.trigger.removeClass(this.__tmpccls);
	},

	//private
	onTriggerClick : function(){
		if(this.disabled || this.getEl().dom.readOnly){
			return;
		}
		var middle = this.getMiddle();
		var ud = (Ext.EventObject.getPageY() < middle) ? 'Up' : 'Down';
		this['onSpin'+ud]();
	},

	//private
	getMiddle : function(){
		var t = this.trigger.getTop();
		var h = this.trigger.getHeight();
		var middle = t + (h/2);
		return middle;
	},
	
	//private
	//checks if control is allowed to spin
	isSpinnable : function(){
		if(this.disabled || this.getEl().dom.readOnly){
			Ext.EventObject.preventDefault();	//prevent scrolling when disabled/readonly
			return false;
		}
		return true;
	},

	handleMouseWheel : function(e){
		//disable scrolling when not focused
		if(this.wrap.hasClass('x-trigger-wrap-focus') == false){
			return;
		}

		var delta = e.getWheelDelta();
		if(delta > 0){
			this.onSpinUp();
			e.stopEvent();
		} else if(delta < 0){
			this.onSpinDown();
			e.stopEvent();
		}
	},

	//private
	startDrag : function(){
		this.proxy.show();
		this._previousY = Ext.fly(this.dd.getDragEl()).getTop();
	},

	//private
	endDrag : function(){
		this.proxy.hide();
	},

	//private
	onDrag : function(){
		if(this.disabled){
			return;
		}
		var y = Ext.fly(this.dd.getDragEl()).getTop();
		var ud = '';

		if(this._previousY > y){ud = 'Up';}         //up
		if(this._previousY < y){ud = 'Down';}       //down

		if(ud != ''){
			this['onSpin'+ud]();
		}

		this._previousY = y;
	},

	//private
	onSpinUp : function(){
		if(this.isSpinnable() == false) {
			return;
		}
		if(Ext.EventObject.shiftKey == true){
			this.onSpinUpAlternate();
			return;
		}else{
			this.strategy.onSpinUp(this);
		}
		this.fireEvent("spin", this);
		this.fireEvent("spinup", this);
	},

	//private
	onSpinDown : function(){
		if(this.isSpinnable() == false) {
			return;
		}
		if(Ext.EventObject.shiftKey == true){
			this.onSpinDownAlternate();
			return;
		}else{
			this.strategy.onSpinDown(this);
		}
		this.fireEvent("spin", this);
		this.fireEvent("spindown", this);
	},

	//private
	onSpinUpAlternate : function(){
		if(this.isSpinnable() == false) {
			return;
		}
		this.strategy.onSpinUpAlternate(this);
		this.fireEvent("spin", this);
		this.fireEvent("spinup", this);
	},

	//private
	onSpinDownAlternate : function(){
		if(this.isSpinnable() == false) {
			return;
		}
		this.strategy.onSpinDownAlternate(this);
		this.fireEvent("spin", this);
		this.fireEvent("spindown", this);
	}

});

Ext.reg('uxspinner', Ext.ux.form.Spinner);

// file: /var/www/tine20build/tine20/Tinebase/js/ux/form/SpinnerStrategy.js
/**
 * Copyright (c) 2008, Steven Chim
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *     * The names of its contributors may not be used to endorse or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/***
 * Abstract Strategy
 */
Ext.ux.form.Spinner.Strategy = function(config){
	Ext.apply(this, config);
};

Ext.extend(Ext.ux.form.Spinner.Strategy, Ext.util.Observable, {
	defaultValue : 0,
	minValue : undefined,
	maxValue : undefined,
	incrementValue : 1,
	alternateIncrementValue : 5,
	validationTask : new Ext.util.DelayedTask(),
	
	onSpinUp : function(field){
		this.spin(field, false, false);
	},

	onSpinDown : function(field){
		this.spin(field, true, false);
	},

	onSpinUpAlternate : function(field){
		this.spin(field, false, true);
	},

	onSpinDownAlternate : function(field){
		this.spin(field, true, true);
	},

	spin : function(field, down, alternate){
		this.validationTask.delay(500, function(){field.validate();});
		//extend
	},

	fixBoundries : function(value){
		return value;
		//overwrite
	}
	
});

/***
 * Concrete Strategy: Numbers
 */
Ext.ux.form.Spinner.NumberStrategy = function(config){
	Ext.ux.form.Spinner.NumberStrategy.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.form.Spinner.NumberStrategy, Ext.ux.form.Spinner.Strategy, {

    allowDecimals : true,
    decimalPrecision : 2,
    
	spin : function(field, down, alternate){
		Ext.ux.form.Spinner.NumberStrategy.superclass.spin.call(this, field, down, alternate);

		var v = parseFloat(field.getValue());
		var incr = (alternate == true) ? this.alternateIncrementValue : this.incrementValue;

		(down == true) ? v -= incr : v += incr ;
		v = (isNaN(v)) ? this.defaultValue : v;
		v = this.fixBoundries(v);
		field.setRawValue(v);
	},

	fixBoundries : function(value){
		var v = value;

		if(this.minValue != undefined && v < this.minValue){
			v = this.minValue;
		}
		if(this.maxValue != undefined && v > this.maxValue){
			v = this.maxValue;
		}

		return this.fixPrecision(v);
	},
	
    // private
    fixPrecision : function(value){
        var nan = isNaN(value);
        if(!this.allowDecimals || this.decimalPrecision == -1 || nan || !value){
            return nan ? '' : value;
        }
        return parseFloat(parseFloat(value).toFixed(this.decimalPrecision));
    }
});


/***
 * Concrete Strategy: Date
 */
Ext.ux.form.Spinner.DateStrategy = function(config){
	Ext.ux.form.Spinner.DateStrategy.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.form.Spinner.DateStrategy, Ext.ux.form.Spinner.Strategy, {
	defaultValue : new Date(),
	format : "Y-m-d",
	incrementValue : 1,
	incrementConstant : Date.DAY,
	alternateIncrementValue : 1,
	alternateIncrementConstant : Date.MONTH,

	spin : function(field, down, alternate){
		Ext.ux.form.Spinner.DateStrategy.superclass.spin.call(this, field, down, alternate);

		var v = field.getRawValue();
		
		v = Date.parseDate(v, this.format);
		var dir = (down == true) ? -1 : 1 ;
		var incr = (alternate == true) ? this.alternateIncrementValue : this.incrementValue;
		var dtconst = (alternate == true) ? this.alternateIncrementConstant : this.incrementConstant;

		if(typeof this.defaultValue == 'string'){
			this.defaultValue = Date.parseDate(this.defaultValue, this.format);
		}

		v = (v) ? v.add(dtconst, dir*incr) : this.defaultValue;

		v = this.fixBoundries(v);
		field.setRawValue(Ext.util.Format.date(v,this.format));
	},
	
	//private
	fixBoundries : function(date){
		var dt = date;
		var min = (typeof this.minValue == 'string') ? Date.parseDate(this.minValue, this.format) : this.minValue ;
		var max = (typeof this.maxValue == 'string') ? Date.parseDate(this.maxValue, this.format) : this.maxValue ;

		if(this.minValue != undefined && dt < min){
			dt = min;
		}
		if(this.maxValue != undefined && dt > max){
			dt = max;
		}

		return dt;
	}

});


/***
 * Concrete Strategy: Time
 */
Ext.ux.form.Spinner.TimeStrategy = function(config){
	Ext.ux.form.Spinner.TimeStrategy.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.form.Spinner.TimeStrategy, Ext.ux.form.Spinner.DateStrategy, {
	format : "H:i",
	incrementValue : 1,
	incrementConstant : Date.MINUTE,
	alternateIncrementValue : 1,
	alternateIncrementConstant : Date.HOUR
});

// file: /var/www/tine20build/tine20/Tinebase/js/ux/form/LockCombo.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Thomas Wadewitz <t.wadewitz@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 * @todo        switch lock and trigger icons (because only the trigger icon has a round upper right corner)
 */
 
Ext.namespace('Ext.ux', 'Ext.ux.form');

/**
 * Generic widget for a twin trigger combo field
 */
Ext.ux.form.LockCombo = Ext.extend(Ext.form.ComboBox, {
    /**
     * @cfg {String} paramName
     */
    paramName : 'query',
    /**
     * @cfg {Bool} selectOnFocus
     */
    selectOnFocus : true,
    /**
     * @cfg {String} emptyText
     */
    emptyText: 'select entry...',
    
	hiddenFieldId: '',
	
	hiddenFieldData: '',
	
    validationEvent:false,
    validateOnBlur:false,
    trigger1Class:'x-form-trigger',
    trigger2ClassLocked:'x-form-locked-trigger',
	trigger2ClassUnlocked:'x-form-unlocked-trigger',
    hideTrigger1:false,
    width:180,
    hasSearch : false,
    /**
     * @private
     */
    initComponent : function(){
        Ext.ux.form.LockCombo.superclass.initComponent.call(this);

        if(!this.hiddenFieldData) {
            this.hiddenFieldData = '1';
        }

        this.triggerConfig = {
            tag:'span', cls:'x-form-twin-triggers', cn:[
            {tag: "img", id:'trigger1', src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + this.trigger1Class},
            {tag: "img", id:'trigger2', src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " }
        ]};  
    },

    getTrigger : function(index){
        return this.triggers[index];
    },

    initTrigger : function(){

        var ts = this.trigger.select('.x-form-trigger', true);	
        this.wrap.setStyle('overflow', 'hidden');
        var triggerField = this;
        ts.each(function(t, all, index){
            t.hide = function(){
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = 'none';
                triggerField.el.setWidth(w-triggerField.trigger.getWidth());
            };
            t.show = function(){
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = '';
                triggerField.el.setWidth(w-triggerField.trigger.getWidth());
            };
            var triggerIndex = 'Trigger'+(index+1);

            if(this['hide'+triggerIndex]){
                t.dom.style.display = 'none';
            }
            t.on("click", this['on'+triggerIndex+'Click'], this, {preventDefault:true});
	
			if(t.id == 'trigger2') {
				if(this.hiddenFieldData == '0') {
                    var _cssClass = this.trigger2ClassLocked.toString();
		            t.addClass(_cssClass);		
				}
				if(this.hiddenFieldData == '1' || !this.hiddenFieldData) {                                       
                    var _cssClass = this.trigger2ClassUnlocked.toString();
		            t.addClass(_cssClass);							
				}				
			}
	
            t.addClassOnOver('x-form-trigger-over');
            t.addClassOnClick('x-form-trigger-click');
        }, this);
        this.triggers = ts.elements;  
    },
	

    onRender:function(ct, position) {        
        Ext.ux.form.LockCombo.superclass.onRender.call(this, ct, position); // render the Ext.Button
        this.hiddenBox = ct.parent().createChild({tag:'input', type:'hidden', name: this.hiddenFieldId, id: this.hiddenFieldId, value: this.hiddenFieldData });        
        Ext.ComponentMgr.register(this.hiddenBox);
    },


	onTrigger1Click: function(){
        if(this.disabled){
            return;
        }
        if(this.isExpanded()){
            this.collapse();
            this.el.focus();
        }else {
            this.onFocus({});
            if(this.triggerAction == 'all') {
                this.doQuery(this.allQuery, true);
            } else {
                this.doQuery(this.getRawValue());
            }
            this.el.focus();
        }
    },
	
    onTrigger2Click : function(){

		var _currentValue = Ext.getCmp(this.hiddenFieldId).getValue();
        
        var ts = this.trigger.select('.x-form-trigger', true);	


		if (_currentValue == '0') {			
			Ext.getCmp(this.hiddenFieldId).dom.value = '1';
     
            var _cssClass = this.trigger2ClassUnlocked.toString();
			ts.each(function(t, all, index){
				if (t.id == 'trigger2') {
					t.dom.className = "x-form-trigger " + _cssClass;
				}
			});
		}
		else  {
			Ext.getCmp(this.hiddenFieldId).dom.value = '0';

            var _cssClass = this.trigger2ClassLocked.toString();
			ts.each(function(t, all, index){
				if (t.id == 'trigger2') {			
					t.dom.className = "x-form-trigger " + _cssClass;
				}
			});
		}
    }	
});
Ext.reg('lockCombo', Ext.ux.form.LockCombo);

// file: /var/www/tine20build/tine20/Tinebase/js/ux/form/LockTextfield.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Ext.ux', 'Ext.ux.form');

/**
 * Generic widget for a twin trigger textfield
 */
Ext.ux.form.LockTextfield = Ext.extend(Ext.form.TriggerField, {
    hiddenFieldId: '',
    hiddenFieldData: '',
    
    triggerClassLocked: 'x-form-trigger x-form-locked-trigger',
    triggerClassUnlocked: 'x-form-trigger x-form-unlocked-trigger',
    
    /**
     * @private
     */
    initComponent: function() {
        this.triggerClass = (this.hiddenFieldData == '1') 
            ? this.triggerClassUnlocked 
            : this.triggerClassLocked;

    	Ext.ux.form.LockTextfield.superclass.initComponent.call(this);
    },
    
    onRender:function(ct, position) {        
        Ext.ux.form.LockTextfield.superclass.onRender.call(this, ct, position); // render the textfield
        this.hiddenBox = ct.parent().createChild({tag:'input', type:'hidden', name: this.hiddenFieldId, id: this.hiddenFieldId, value: this.hiddenFieldData });        
        Ext.ComponentMgr.register(this.hiddenBox);
    },
    
    onTriggerClick: function() {
    	//this.hiddenFieldData = (this.hiddenFieldData == '1') ? '0' : '1';
    	//this.triggerClass = (this.hiddenFieldData == '1') ? 'x-form-unlocked-trigger' : 'x-form-locked-trigger';

    	var _currentValue = Ext.getCmp(this.hiddenFieldId).getValue();

        if (_currentValue == '0') {         
            Ext.getCmp(this.hiddenFieldId).dom.value = '1';
            this.trigger.removeClass(this.triggerClassLocked);
            this.trigger.addClass(this.triggerClassUnlocked);
        } else {
            Ext.getCmp(this.hiddenFieldId).dom.value = '0';
            this.trigger.removeClass(this.triggerClassUnlocked);
            this.trigger.addClass(this.triggerClassLocked);
        }
    }
});
Ext.reg('lockTextfield', Ext.ux.form.LockTextfield);

// file: /var/www/tine20build/tine20/Tinebase/js/ux/layout/HorizontalFitLayout.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Ext.ux', 'Ext.ux.layout');

/**
 * @class Ext.ux.layout.HorizontalFitLayout
 * @extends Ext.layout.ContainerLayout
 * @description
 * <p>This is a base class for layouts that contain a single item that automatically expands horizontally to fill 
 * the horizontal dimenson of the layout's container.  This class is intended to be extended or created via the 
 * layout:'hfit' {@link Ext.Container#layout} config, and should generally not need to be created directly via 
 * the new keyword.</p>
 * <p>To fit a panel to a container horizontally using Horizontal FitLayout, simply set layout:'hfit' on the container 
 * and add a multiple panel to it.</p>
 * <p>Example usage:</p>
 * <pre><code>
var p = new Ext.Panel({
    title: 'Horizontal Fit Layout',
    layout:'hfit',
    items: [{
        title: 'Inner Panel One',
        html: '&lt;p&gt;This is the firsts inner panel content&lt;/p&gt;',
        border: false
    },{
        title: 'Inner Panel Two',
        html: '&lt;p&gt;This is the seconds inner panel content&lt;/p&gt;',
        border: false
    }]
});
</code></pre>
 */
Ext.ux.layout.HorizontalFitLayout = Ext.extend(Ext.layout.ContainerLayout, {
    /**
     * @cfg {bool} containsScrollbar
     */
    containsScrollbar: false,
    /**
     * @private
     */
    monitorResize:true,

    /**
     * @private
     */
    onLayout : function(ct, target){
        Ext.layout.FitLayout.superclass.onLayout.call(this, ct, target);
        if(!this.container.collapsed){
            var size = target.getStyleSize();
            size.width = ct.containsScrollbar ? size.width-16 : size.width;
            
            ct.items.each(function(item){
                this.setItemSize(item,  size);
            }, this);
        }
    },
    /**
     * @private
     */
    setItemSize : function(item, size){
        if(item && size.height > 0){ // display none?
            item.setWidth(size.width);
        }
    }
});
Ext.Container.LAYOUTS['hfit'] = Ext.ux.layout.HorizontalFitLayout;
// file: /var/www/tine20build/tine20/Tinebase/js/ux/layout/CenterLayout.js
/*
 * Ext JS Library 2.2
 * Copyright(c) 2006-2008, Ext JS, LLC.
 * licensing@extjs.com
 * 
 * http://extjs.com/license
 */

Ext.ns('Ext.ux.layout');

/**
 * @class Ext.ux.layout.CenterLayout
 * @extends Ext.layout.FitLayout
 * <p>This is a very simple layout style used to center contents within a container.  This layout works within
 * nested containers and can also be used as expected as a Viewport layout to center the page layout.</p>
 * <p>As a subclass of FitLayout, CenterLayout expects to have a single child panel of the container that uses 
 * the layout.  The layout does not require any config options, although the child panel contained within the
 * layout must provide a fixed or percentage width.  The child panel's height will fit to the container by
 * default, but you can specify <tt>autoHeight:true</tt> to allow it to autosize based on its content height.  
 * Example usage:</p> 
 * <pre><code>
// The content panel is centered in the container
var p = new Ext.Panel({
    title: 'Center Layout',
    layout: 'ux.center',
    items: [{
        title: 'Centered Content',
        width: '75%',
        html: 'Some content'
    }]
});

// If you leave the title blank and specify no border
// you'll create a non-visual, structural panel just
// for centering the contents in the main container.
var p = new Ext.Panel({
    layout: 'ux.center',
    border: false,
    items: [{
        title: 'Centered Content',
        width: 300,
        autoHeight: true,
        html: 'Some content'
    }]
});
</code></pre>
 */
Ext.ux.layout.CenterLayout = Ext.extend(Ext.layout.FitLayout, {
    // private
    setItemSize : function(item, size){
        this.container.addClass('ux-layout-center');
        item.addClass('ux-layout-center-item');
        if(item && size.height > 0){
            if(item.width){
                size.width = item.width;
            }
            item.setSize(size);
        }
    }
});
Ext.Container.LAYOUTS['ux.center'] = Ext.ux.layout.CenterLayout;

// file: /var/www/tine20build/tine20/Tinebase/js/ux/layout/RowLayout.js
/*
 * Ext JS Library 2.2
 * Copyright(c) 2006-2008, Ext JS, LLC.
 * licensing@extjs.com
 * 
 * http://extjs.com/license
 */

Ext.ns('Ext.ux.layout');

/**
 * @class Ext.ux.layout.RowLayout
 * @extends Ext.layout.ContainerLayout
 * <p>This is the layout style of choice for creating structural layouts in a multi-row format where the height of
 * each row can be specified as a percentage or fixed height.  Row widths can also be fixed, percentage or auto.
 * This class is intended to be extended or created via the layout:'ux.row' {@link Ext.Container#layout} config,
 * and should generally not need to be created directly via the new keyword.</p>
 * <p>RowLayout does not have any direct config options (other than inherited ones), but it does support a
 * specific config property of <b><tt>rowHeight</tt></b> that can be included in the config of any panel added to it.  The
 * layout will use the rowHeight (if present) or height of each panel during layout to determine how to size each panel.
 * If height or rowHeight is not specified for a given panel, its height will default to the panel's height (or auto).</p>
 * <p>The height property is always evaluated as pixels, and must be a number greater than or equal to 1.
 * The rowHeight property is always evaluated as a percentage, and must be a decimal value greater than 0 and
 * less than 1 (e.g., .25).</p>
 * <p>The basic rules for specifying row heights are pretty simple.  The logic makes two passes through the
 * set of contained panels.  During the first layout pass, all panels that either have a fixed height or none
 * specified (auto) are skipped, but their heights are subtracted from the overall container height.  During the second
 * pass, all panels with rowHeights are assigned pixel heights in proportion to their percentages based on
 * the total <b>remaining</b> container height.  In other words, percentage height panels are designed to fill the space
 * left over by all the fixed-height and/or auto-height panels.  Because of this, while you can specify any number of rows
 * with different percentages, the rowHeights must always add up to 1 (or 100%) when added together, otherwise your
 * layout may not render as expected.  Example usage:</p>
 * <pre><code>
// All rows are percentages -- they must add up to 1
var p = new Ext.Panel({
    title: 'Row Layout - Percentage Only',
    layout:'ux.row',
    items: [{
        title: 'Row 1',
        rowHeight: .25 
    },{
        title: 'Row 2',
        rowHeight: .6
    },{
        title: 'Row 3',
        rowHeight: .15
    }]
});

// Mix of height and rowHeight -- all rowHeight values must add
// up to 1. The first row will take up exactly 120px, and the last two
// rows will fill the remaining container height.
var p = new Ext.Panel({
    title: 'Row Layout - Mixed',
    layout:'ux.row',
    items: [{
        title: 'Row 1',
        height: 120,
        // standard panel widths are still supported too:
        width: '50%' // or 200
    },{
        title: 'Row 2',
        rowHeight: .8,
        width: 300
    },{
        title: 'Row 3',
        rowHeight: .2
    }]
});
</code></pre>
 */
Ext.ux.layout.RowLayout = Ext.extend(Ext.layout.ContainerLayout, {
    // private
    monitorResize:true,

    // private
    isValidParent : function(c, target){
        return c.getEl().dom.parentNode == this.innerCt.dom;
    },

    // private
    onLayout : function(ct, target){
        var rs = ct.items.items, len = rs.length, r, i;

        if(!this.innerCt){
            target.addClass('ux-row-layout-ct');
            this.innerCt = target.createChild({cls:'x-row-inner'});
        }
        this.renderAll(ct, this.innerCt);

        var size = target.getViewSize();

        if(size.width < 1 && size.height < 1){ // display none?
            return;
        }

        var h = size.height - target.getPadding('tb'),
            ph = h;

        this.innerCt.setSize({height:h});
        
        // some rows can be percentages while others are fixed
        // so we need to make 2 passes
        
        for(i = 0; i < len; i++){
            r = rs[i];
            if(!r.rowHeight){
                ph -= (r.getSize().height + r.getEl().getMargins('tb'));
            }
        }

        ph = ph < 0 ? 0 : ph;

        for(i = 0; i < len; i++){
            r = rs[i];
            if(r.rowHeight){
                r.setSize({height: Math.floor(r.rowHeight*ph) - r.getEl().getMargins('tb')});
            }
        }
    }
    
    /**
     * @property activeItem
     * @hide
     */
});
Ext.Container.LAYOUTS['ux.row'] = Ext.ux.layout.RowLayout;


// file: /var/www/tine20build/tine20/Tinebase/js/ux/state/JsonProvider.js
/*
 * Tine 2.0
 * 
 * @package     Ext
 * @subpackage  ux
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Ext.ux', 'Ext.ux.state');

/**
 * @class Ext.ux.state.JsonProvider
 * @constructor
 */
Ext.ux.state.JsonProvider = function(config) {
    Ext.apply(this, config);
    
    if (! this.record) {
        this.record = Ext.data.Record.create([
            { name: 'name' },
            { name: 'value'}
        ]);
    }
    
    if (! this.store) {
        this.store = new Ext.data.SimpleStore({
            fields: this.record,
            id: 'name',
            data: [],
            listeners: {
                scope: this,
                add: this.onStateStoreUpdate,
                remove: this.onStateStoreUpdate,
                update: this.onStateStoreUpdate
            }
        });
    }
};
 
Ext.extend(Ext.ux.state.JsonProvider, Ext.state.Provider, {
    
    /**
     * @property {Ext.data.Store}
     */
    store: null,
    /**
     * @property {Ext.data.Record}
     */
    record: null,
    
    /**
     * sets the states store
     */
    setStateStore: function(store) {
        this.store = store;
    },
    
    /**
     * returns the states store
     */
    getStateStore: function() {
        return this.store;
    },
    
    /**
     * Returns the current value for a key 
     */
    get: function(name, defaultValue) {
        if(name.match(/^ext\-comp/)) {
            return defaultValue;
        }
        
        var state = this.store.getById(name);
        
        return state ? state.get('value') : defaultValue;
    },
    
    /**
     * Sets the value for a key
     * @todo!!! only save clones and not the object (references)
     */
    set: function(name, value) {
        if(! name.match(/^ext\-comp/)) {
            var cmp = Ext.getCmp(name);
            if (cmp.stateful) {
                var valueClone = this.clone(value);
                
                // we need to delete old states, cause safari crasches otherwise for some reason
                var state = this.store.getById(name);
                if (state) {
                    this.store.remove(state);
                }
                
                this.store.add(new this.record({
                    name: name,
                    value: valueClone
                }, name));
                
            } else {
                 //console.info('Ext.ux.state.JsonProvider::set Attempt to set state of the non stateful component: "' + name + '"');
            }
        }
    },
    
    loadStateData: function(stateInfo) {
        this.store.removeAll();
        if (Ext.isArray(stateInfo)) {
            Ext.each(stateInfo, function(recordData) {
                var stateRecord = new this.record(recordData, recordData.name);
                this.store.add(stateRecord);
            }, this);
        }
        this.store.hasChanges = false;
    },
    
    /**
     * Clears a value from the state
     */
    clear: function(name) {
        var state = this.store.getById(name);
        if (state) {
            this.store.remove(state);
        }
    },
    
    /**
     * clones an object
     * @todo move to more generic place ;-)
     */
    clone: function(original) {
        var clone;
        switch (typeof(original)) {
             case 'object':
                 if (Ext.isArray(original)) {
                    clone = [];
                    for (var i=0; i<original.length; i++) {
                        clone.push(this.clone(original[i]));
                    }
                } else if (original === null) {
                    clone = null;
                } else {
                    clone = {};
                    for (var property in original) {
                        if (original.hasOwnProperty(property)) {
                            clone[property] = this.clone(original[property]);
                        }
                    }
                }
                break;
            
            case 'number':
            case 'string':
            case 'boolean':
            case 'undefined':
                clone = original;
                break;
            default:
                break;
        }
        return clone;
    },
    
    onStateStoreUpdate: function(store) {
        store.hasChanges = true;
    }
});
// file: /var/www/tine20build/tine20/Tinebase/js/ux/GMapPanel.js
/**
 * Tine 2.0
 * 
 * @package     Ext
 * @subpackage  ux
 * @license     BSD
 * @author      Shea Frederick
 * @copyright   Copyright (c) 2008 Shea Frederick
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 * based on public domain code from Shea Frederick
 * "Free as a bird. Use it anywhere or any way you like."
 * 
 * http://extjs.com/blog/2008/07/01/integrating-google-maps-api-with-extjs/
 */
Ext.namespace('Ext.ux');
 
/**
 *
 * @class GMapPanel
 * @extends Ext.Panel
 */
Ext.ux.GMapPanel = Ext.extend(Ext.Panel, {
    initComponent : function(){
        
        var defConfig = {
            plain: true,
            zoomLevel: 3,
            yaw: 180,
            pitch: 0,
            zoom: 0,
            gmapType: 'map',
            border: false
        };
        
        Ext.applyIf(this,defConfig);
        
        Ext.ux.GMapPanel.superclass.initComponent.call(this);        

    },
    afterRender : function(){
        
        var wh = this.ownerCt.getSize();
        Ext.applyIf(this, wh);
        
        Ext.ux.GMapPanel.superclass.afterRender.call(this); 
        
        if (this.gmapType === 'map'){
            this.gmap = new GMap2(this.body.dom);
        }
        
        if (this.gmapType === 'panorama'){
            this.gmap = new GStreetviewPanorama(this.body.dom);
        }
        
        if (typeof this.addControl === 'object' && this.gmapType === 'map') {
            this.gmap.addControl(this.addControl);
        }
        
        if (typeof this.setCenter === 'object') {
            if (typeof this.setCenter.geoCodeAddr === 'string'){
                this.geoCodeLookup(this.setCenter.geoCodeAddr);
            }else{
                if (this.gmapType === 'map'){
                    var point = new GLatLng(this.setCenter.lat,this.setCenter['long']);
                    this.gmap.setCenter(point, this.zoomLevel); 
                }
                if (typeof this.setCenter.marker === 'object' && typeof point === 'object'){
                    this.addMarker(point,this.setCenter.marker,this.setCenter.marker.clear);
                }
            }
            if (this.gmapType === 'panorama'){
                this.gmap.setLocationAndPOV(new GLatLng(this.setCenter.lat,this.setCenter['long']), {yaw: this.yaw, pitch: this.pitch, zoom: this.zoom});
            }
        }
        
        var dt = new Ext.util.DelayedTask();
        dt.delay(300, function(){
            this.addMarkers(this.markers);
        }, this);

    },
    onResize : function(w, h){

        if (typeof this.gmap == 'object') {
            this.gmap.checkResize();
        }
        
        Ext.ux.GMapPanel.superclass.onResize.call(this, w, h);

    },
    setSize : function(width, height, animate){
        
        if (typeof this.gmap == 'object') {
            this.gmap.checkResize();
        }
        
        Ext.ux.GMapPanel.superclass.setSize.call(this, width, height, animate);
        
    },
    getMap: function(){
        
        return this.gmap;
        
    },
    addMarkers: function(markers) {
        
        if (Ext.isArray(markers)){
            for (var i = 0; i < markers.length; i++) {
                var mkr_point = new GLatLng(markers[i].lat,markers[i]['long']);
                this.addMarker(mkr_point,markers[i].marker,false,markers[i].setCenter);
            }
        }
        
    },
    addMarker: function(point, marker, clear, center){
        
        Ext.applyIf(marker,G_DEFAULT_ICON);

        if (clear === true){
            this.gmap.clearOverlays();
        }
        if (center === true) {
            this.gmap.setCenter(point, this.zoomLevel);
        }
        
        var mark = new GMarker(point,marker);
        this.gmap.addOverlay(mark);

    },
    geoCodeLookup : function(addr) {
        
        this.geocoder = new GClientGeocoder();
        this.geocoder.getLocations(addr, this.addAddressToMap.createDelegate(this));
        
    },
    addAddressToMap : function(response) {
        
        if (!response || response.Status.code != 200) {
            Ext.MessageBox.alert('Error', 'Code '+response.Status.code+' Error Returned');
        } else {
            place = response.Placemark[0];
            addressinfo = place.AddressDetails;
            accuracy = addressinfo.Accuracy;
            if (accuracy === 0) {
                Ext.MessageBox.alert('Unable to Locate Address', 'Unable to Locate the Address you provided');
            }else{
                if (accuracy < 7) {
                    Ext.MessageBox.alert('Address Accuracy', 'The address provided has a low accuracy.<br><br>Level '+accuracy+' Accuracy (8 = Exact Match, 1 = Vague Match)');
                }else{
                    point = new GLatLng(place.Point.coordinates[1], place.Point.coordinates[0]);
                    if (typeof this.setCenter.marker === 'object' && typeof point === 'object'){
                        this.addMarker(point,this.setCenter.marker,this.setCenter.marker.clear,true);
                    }
                }
            }
        }
        
    }
 
});

Ext.reg('gmappanel',Ext.ux.GMapPanel);

// file: /var/www/tine20build/tine20/Tinebase/js/ux/DatepickerRange.js
/**
 * Ext.ux
 * 
 * @package     Ext.ux
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 */

Ext.namespace('Ext.ux'); 


Date.prototype.getFirstDateOfWeek = function(){
    var value=this.clearTime();
    var semana=this.getWeekOfYear();
    while(semana == value.getWeekOfYear()) {
        value=value.add(Date.DAY,-1);
    }
    value=value.add(Date.DAY,1);
    return value;
};


Ext.ux.DatePickerRange = Ext.extend(Ext.DatePicker, { 
    selectionMode:'month',
    setSelectionMode:function(mode){
        this.selectionMode=mode;
        this.setValue(this.value);
    },
    getSelectionMode:function(){
        return this.selectionMode();
    },

    //private
    update : function(date){
        var vd = this.activeDate;
        this.activeDate = date;
        if(vd && this.el){
            var t = date.getTime();
            if(vd.getMonth() == date.getMonth() && vd.getFullYear() == date.getFullYear()){
                this.cells.removeClass("x-date-selected");
                this.cells.each(function(c){
                   if(this.isSelected(  c.dom.firstChild.dateValue  )){
                       c.addClass("x-date-selected");
                   }
                },this);
                return;
            }
        }
        var days = date.getDaysInMonth();
        var firstOfMonth = date.getFirstDateOfMonth();
        var startingPos = firstOfMonth.getDay()-this.startDay;

        if(startingPos <= this.startDay){
            startingPos += 7;
        }

        var pm = date.add("mo", -1);
        var prevStart = pm.getDaysInMonth()-startingPos;

        var cells = this.cells.elements;
        var textEls = this.textNodes;
        days += startingPos;

        
        var day = 86400000;
        var d = (new Date(pm.getFullYear(), pm.getMonth(), prevStart)).clearTime();
        var today = new Date().clearTime().getTime();
        var sel = date.clearTime().getTime();
        var min = this.minDate ? this.minDate.clearTime() : Number.NEGATIVE_INFINITY;
        var max = this.maxDate ? this.maxDate.clearTime() : Number.POSITIVE_INFINITY;
        var ddMatch = this.disabledDatesRE;
        var ddText = this.disabledDatesText;
        var ddays = this.disabledDays ? this.disabledDays.join("") : false;
        var ddaysText = this.disabledDaysText;
        var format = this.format;



        var setCellClass = function(cal, cell){
            cell.title = "";
            var t = d.getTime();
            cell.firstChild.dateValue = t;
            if(t == today){
                cell.className += " x-date-today";
                cell.title = cal.todayText;
            }
            if(cal.isSelected(cell.firstChild.dateValue)){
                cell.className += " x-date-selected";
            }
            
            if(t < min) {
                cell.className = " x-date-disabled";
                cell.title = cal.minText;
                return;
            }
            if(t > max) {
                cell.className = " x-date-disabled";
                cell.title = cal.maxText;
                return;
            }
            if(ddays){
                if(ddays.indexOf(d.getDay()) != -1){
                    cell.title = ddaysText;
                    cell.className = " x-date-disabled";
                }
            }
            if(ddMatch && format){
                var fvalue = d.dateFormat(format);
                if(ddMatch.test(fvalue)){
                    cell.title = ddText.replace("%0", fvalue);
                    cell.className = " x-date-disabled";
                }
            }
        };

        var i = 0;
        for(; i < startingPos; i++) {
            textEls[i].innerHTML = (++prevStart);
            d.setDate(d.getDate()+1);
            cells[i].className = "x-date-prevday";
            setCellClass(this, cells[i]);
        }

        for(; i < days; i++){
            intDay = i - startingPos + 1;
            textEls[i].innerHTML = (intDay);
            d.setDate(d.getDate()+1);
            cells[i].className = "x-date-active";
            setCellClass(this, cells[i]);
        }
        var extraDays = 0;
        for(; i < 42; i++) {
             textEls[i].innerHTML = (++extraDays);
             d.setDate(d.getDate()+1);
             cells[i].className = "x-date-nextday";
             setCellClass(this, cells[i]);
        }

        this.mbtn.setText(this.monthNames[date.getMonth()] + " " + date.getFullYear());

        if(!this.internalRender){
            var main = this.el.dom.firstChild;
            var w = main.offsetWidth;
            this.el.setWidth(w + this.el.getBorderWidth("lr"));
            Ext.fly(main).setWidth(w);
            this.internalRender = true;
            
            if(Ext.isOpera && !this.secondPass){
                main.rows[0].cells[1].style.width = (w - (main.rows[0].cells[0].offsetWidth+main.rows[0].cells[2].offsetWidth)) + "px";
                this.secondPass = true;
                this.update.defer(10, this, [date]);
            }
        }
    },
    isSelected:function(date){
        date=new Date(date);
        switch(this.selectionMode) {
        	case 'day':
        	   return date.clearTime().getTime() == this.value.clearTime().getTime();
        	   break;
        	case 'month':
        	   return date.getFirstDateOfMonth().clearTime().getTime ()==this.value.getFirstDateOfMonth().clearTime().getTime ();
        	   break;
        	case 'week':
        	   return date.getFirstDateOfWeek().clearTime().getTime ()==this.value.getFirstDateOfWeek().clearTime().getTime ();
        	   break;
        	default:
        	   throw 'Illegal selection mode';
        	   break;
        }        
    }
        
    
}); 

Ext.reg('datepickerrange', Ext.ux.DatePickerRange);
// file: /var/www/tine20build/tine20/Tinebase/js/widgets/LangChooser.js
/**
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */

Ext.namespace('Tine.widgets');

/**
 * lang chooser widget
 */
Tine.widgets.LangChooser = Ext.extend(Ext.form.ComboBox, {
    
    /**
     * @cfg {Sring}
     */
    fieldLabel: null,
    
    displayField: 'language',
    valueField: 'locale',
    triggerAction: 'all',
    width: 100,
    listWidth: 200,
    
    initComponent: function() {
        this.value = Tine.Tinebase.registry.get('locale').language;
        this.fieldLabel = this.fieldLabel ? this.fieldLabel : _('Language');
        
        this.tpl = new Ext.XTemplate(
            '<tpl for=".">' +
                '<div class="x-combo-list-item">' +
                    '{language} <tpl if="region.length &gt; 1">{region}</tpl> [{locale}]' + 
                '</div>' +
            '</tpl>',{
                encode: function(value) {
                    return Ext.util.Format.htmlEncode(value);
                }
            }
        );
        
        this.store = new Ext.data.JsonStore({
            id: 'locale',
            root: 'results',
            totalProperty: 'totalcount',
            fields: Tine.Tinebase.Model.Language,
            baseParams: {
                method: 'Tinebase.getAvailableTranslations'
            }
        });
        Tine.widgets.LangChooser.superclass.initComponent.call(this);
        
        this.on('select', this.onLangSelect, this);
    },
    
    onLangSelect: function(combo, localeRecord, idx) {
        var currentLocale = Tine.Tinebase.registry.get('locale').locale;
        var newLocale = localeRecord.get('locale');
        
        if (newLocale != currentLocale) {
            Ext.MessageBox.wait(_('setting new language...'), _('Please Wait'));
            
            Ext.Ajax.request({
                scope: this,
                params: {
                    method: 'Tinebase.setLocale',
                    localeString: newLocale,
                    saveaspreference: true,
                    setcookie: true
                },
                success: function(result, request){
                    if (window.google && google.gears && google.gears.localServer) {
                        var pkgStore = google.gears.localServer.openStore('tine20-package-store');
                        if (pkgStore) {
                            google.gears.localServer.removeStore('tine20-package-store');
                        }
                    }
                    window.location = window.location.href.replace(/#+.*/, '');
                }
            });
        }
    }
});


// file: /var/www/tine20build/tine20/Tinebase/js/widgets/ActionUpdater.js
/*
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 * @todo        refactor this (requiredGrant is required even if skipGrants == true) 
 */
 
 Ext.namespace('Tine', 'Tine.widgets');
 
 Tine.widgets.ActionUpdater = function(config) {
    var actions = config.actions || [];
    delete(config.actions);
    
    Ext.apply(this, config);
    this.addActions(actions);
 };
 
 Tine.widgets.ActionUpdater.prototype = {
    /**
     * @cfg {Array|Toolbar} actions
     * all actions to update
     */
    actions: [],
    
    /**
     * @cfg {String} grantsProperty
     * property in the record to find the grants in
     */
    grantsProperty: 'account_grants',
    
    /**
     * @cfg {String} containerProperty
     * container property of records (if set, grants are expected to be  a property of the container)
     */
    containerProperty: 'container_id',
    
    /**
     * add actions to update
     * @param {Array|Toolbar} actions
     */
    addActions: function(actions) {
        switch (typeof(actions)) {
            case 'object':
                if (typeof(actions.each) == 'function') {
                    actions.each(this.addAction, this);
                } else {
                    for (var action in actions) {
                        this.addAction(actions[action]);
                    }
                }
            break;
            case 'array':
                for (var i=0; i<actions.length; i++) {
                    this.addAction(actions[i]);
                }
            break;
        }
    },
    
    /**
     * add a single action to update
     * @param {Ext.Action} action
     */
    addAction: function(action) {
        // if action has to initialConfig it's no Ext.Action!
        if (action.initialConfig) {
            
            // in some coses our actionUpdater config is not in the initial config
            // this happens for direct extensions of button class, like the notes button
            if (action.requiredGrant) {
                Ext.applyIf(action.initialConfig, {
                    requiredGrant: action.requiredGrant,
                    actionUpdater: action.actionUpdater,
                    allowMultiple: action.allowMultiple,
                    singularText: action.singularText,
                    pluralText: action.pluralText,
                    translationObject: action.translationObject
                });
            }
            
            this.actions.push(action);
        }
    },
    
    /**
     * performs the actual update
     * @param {Array|SelectionModel} records
     */
    updateActions: function(records) {
        
        if (typeof(records.getSelections) == 'function') {
            records = records.getSelections();
        } else if (typeof(records.beginEdit) == 'function') {
            records = [records];
        }
        
        var grants = this.getGrantsSum(records);
        
        this.each(function(action) {
            // action updater opt-in fn has precedence over generic action updater!
            if (typeof(action.actionUpdater) == 'function') {
                action.actionUpdater.call(action.scope||action, grants, records);
            } else {
                this.defaultUpdater(action, grants, records);
            }
        }, this);
        
    },
    
    /**
     * default action updater
     * 
     * - sets disabled status based on grants and required grant
     * - sets disabled status based on allowMutliple
     * - sets action text (signular/plural text)
     * 
     * @param {Ext.Action} action
     * @param {Object} grants
     * @param {Object} grants
     */
    defaultUpdater: function(action, grants, records) {
        var nCondition = records.length != 0 && (records.length > 1 ? action.initialConfig.allowMultiple : true);
        
        if (action.initialConfig.requiredGrant) {
            action.setDisabled(! (grants[action.initialConfig.requiredGrant] && nCondition));
        }
        
        if (action.initialConfig.singularText && action.initialConfig.pluralText && action.initialConfig.translationObject) {
            var text = action.initialConfig.translationObject.n_(action.initialConfig.singularText, action.initialConfig.pluralText, records.length);
            action.setText(text);
        }
    },
    
    /**
     * Calls the specified function for each action
     * 
     * @param {Function} fn The function to call. The action is passed as the first parameter.
     * Returning <tt>false</tt> aborts and exits the iteration.
     * @param {Object} scope (optional) The scope in which to call the function (defaults to the action).
     */
    each: function(fn, scope) {
        for (var i=0; i<this.actions.length; i++) {
            if (fn.call(scope||this.actions[i], this.actions[i]) === false) break;
        }
    },
    
    /**
     * calculats the grants sum of the given record(s)
     * 
     * @param  {Array}  records
     * @return {Object} grantName: sum
     */
    getGrantsSum: function(records) {

        var defaultGrant = records.length == 0 ? false : true;
        var grants = {
            addGrant:    defaultGrant,
            adminGrant:  defaultGrant,
            deleteGrant: defaultGrant,
            editGrant:   defaultGrant,
            readGrant:   defaultGrant
        };
        
        var recordGrants;
        for (var i=0; i<records.length; i++) {
            recordGrants = this.containerProperty ? 
                records[i].get(this.containerProperty)[this.grantsProperty] : this.grantsProperty ? 
                records[i].get(this.grantsProperty) : records[i].data;
            
            for (var grant in grants) {
                if (grants.hasOwnProperty(grant)) {
                    grants[grant] = grants[grant] & recordGrants[grant];
                }
            }
        }
        
        return grants;
    }
 };
 
/**
 * sets text and disabled status of a set of actions according to the grants 
 * of a set of records
 * @legacy use ActionUpdater Obj. instead!
 * 
 * @param {Array|SelectionModel} records
 * @param {Array|Toolbar}        actions
 * @param {String}               containerField
 * @param {Bool}                 skipGrants evaluation
 */
Tine.widgets.actionUpdater = function(records, actions, containerField, skipGrants) {
    if (!containerField) {
        containerField = 'container_id';
    }

    if (typeof(records.getSelections) == 'function') {
        records = records.getSelections();
    } else if (typeof(records.beginEdit) == 'function') {
        records = [records];
    }
    
    // init grants
    var defaultGrant = records.length == 0 ? false : true;
    var grants = {
        addGrant:    defaultGrant,
        adminGrant:  defaultGrant,
        deleteGrant: defaultGrant,
        editGrant:   defaultGrant,
        readGrant:   defaultGrant
    };
    
    // calculate sum of grants
    for (var i=0; i<records.length; i++) {
        var recordGrants = records[i].get(containerField) ? records[i].get(containerField).account_grants : {};
        for (var grant in grants) {
            grants[grant] = grants[grant] & recordGrants[grant];
        }
    }
    
    /**
     * action iterator
     */
    var actionIterator = function(action) {
        var initialConfig = action.initialConfig;
        if (initialConfig) {
            
            // happens for direct extensions of button class, like the notes button
            if (action.requiredGrant) {
                initialConfig = {
                    requiredGrant: action.requiredGrant,
                    allowMultiple: action.allowMultiple,
                    singularText: action.singularText,
                    pluralText: action.pluralText,
                    translationObject: action.translationObject
                };
            }
            
            // NOTE: we don't handle add action for the moment!
            var requiredGrant = initialConfig.requiredGrant;
            if (requiredGrant && requiredGrant != 'addGrant') {
                var enable = skipGrants || grants[requiredGrant];
                if (records.length > 1 && ! initialConfig.allowMultiple) {
                    enable = false;
                }
                if (records.length == 0) {
                    enable = false;
                }
                
                action.setDisabled(!enable);
                if (initialConfig.singularText && initialConfig.pluralText && initialConfig.translationObject) {
                    var text = initialConfig.translationObject.n_(initialConfig.singularText, initialConfig.pluralText, records.length);
                    action.setText(text);
                }
            }
        }
    };
    
    /**
     * call action iterator
     */
    switch (typeof(actions)) {
        case 'object':
            if (typeof(actions.each) == 'function') {
                actions.each(actionIterator, this);
            } else {
                for (var action in actions) {
                    actionIterator(actions[action]);
                }
            }
        break;
        case 'array':
            for (var i=0; i<actions.length; i++) {
                actionIterator(actions[i]);
            }
        break;
    }
    
};
// file: /var/www/tine20build/tine20/Tinebase/js/widgets/EditRecord.js
/**
 * Tine 2.0
 * 
 * @package     Tine
 * @subpackage  Widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 * @deprecated  use EditDialog instead. This class will be removed when all
 *              dialogs are moved to the EditDialog widget
 */
Ext.namespace('Tine.widgets');

Ext.namespace('Tine.widgets.dialog');

/**
 * Generic 'Edit Record' dialog
 *
 */
Tine.widgets.dialog.EditRecord = Ext.extend(Ext.FormPanel, {
	/**
	 * @cfg {Array} additional toolbar items
	 */
	tbarItems: false,
    /**
     * @cfg {String} internal app name
     */
    appName: null,
    /**
     * @cfg {String} translated container item name
     */
    //containerItemName: 'record',
    /**
     * @cfg {String} translated container name
     */
    containerName: 'container',
    /**
     * @cfg {string} containerName
     * name of container (plural)
     */
    containersName: 'containers',
    /**
     * @cfg {String} name of the container property
     */
    containerProperty: 'container_id',
    /**
     * @cfg {Bool} show container selector in bottom area
     */
    showContainerSelector: false,
    /**
     * @cfg {Object} handlerScope scope, the defined handlers will be executed in 
     */
    handlerScope: null,
    /**
     * @cfg {function} handler for generic save and close action
     */
    handlerSaveAndClose: null,
    /**
     * @cfg {function} handler for generic save and close action
     */
    handlerApplyChanges: null,
    /**
     * @cfg {function} handler for generic save and close action
     */
    handlerCancel: null,
    /**
     * @cfg {String} layout of the containing window
     */
    windowLayout: 'border',
    /**
     * @property {Ext.Window|Ext.ux.PopupWindow|Ext.Air.Window}
     */
    window: null,
    
    // private
    bodyStyle:'padding:5px',
    //layout: 'fit',
    anchor:'100% 100%',
    region: 'center',
    deferredRender: false,
    buttonAlign: 'right',
    cls: 'tw-editdialog',
	
	//private
    initComponent: function(){
        this.addEvents(
            /**
             * @event cancel
             * Fired when user pressed cancel button
             */
            'cancel',
            /**
             * @event saveAndClose
             * Fired when user pressed OK button
             */
            'saveAndClose',
            /**
             * @event update
             * @desc  Fired when the record got updated
             * @param {Ext.data.record} data data of the entry
             */
            'update',
            /**
             * @event apply
             * Fired when user pressed apply button
             */
            'apply'
        );
        
        this.initHandlers();
        this.action_saveAndClose = new Ext.Action({
            requiredGrant: 'editGrant',
            text: _('Ok'),
            //tooltip: 'Save changes and close this window',
            minWidth: 70,
            //handler: this.onSaveAndClose,
            handler: this.handlerSaveAndClose,
            iconCls: 'action_saveAndClose',
            scope: this.handlerScope
        });
    
        this.action_applyChanges =new Ext.Action({
            requiredGrant: 'editGrant',
            text: _('Apply'),
            //tooltip: 'Save changes',
            minWidth: 70,
            handler: this.handlerApplyChanges,
            iconCls: 'action_applyChanges',
            scope: this.handlerScope
            //disabled: true
        });
        
        this.action_cancel = new Ext.Action({
            text: _('Cancel'),
            //tooltip: 'Reject changes and close this window',
            minWidth: 70,
            handler: this.handlerCancel,
            iconCls: 'action_cancel',
            scope: this.handlerScope
        });
        
        this.action_delete = new Ext.Action({
            requiredGrant: 'deleteGrant',
            text: _('delete'),
            minWidth: 70,
            handler: this.handlerDelete,
            iconCls: 'action_delete',
            scope: this.handlerScope,
            disabled: true
        });
        
        var genericButtons = [
            this.action_delete
        ];
        
        //this.tbarItems = genericButtons.concat(this.tbarItems);
        
        this.buttons = [
            //this.action_applyChanges,
            this.action_cancel,
            this.action_saveAndClose
       ];
       
        if (this.tbarItems) {
            this.tbar = new Ext.Toolbar({
                items: this.tbarItems
            });
        }
		
		Tine.widgets.dialog.EditRecord.superclass.initComponent.call(this);
	},
    
    /**
     * @private
     */
    onRender : function(ct, position){
        Tine.widgets.dialog.EditRecord.superclass.onRender.call(this, ct, position);
        
        if (this.showContainerSelector) {
            this.recordContainerEl = this.footer.first().first().insertFirst({tag: 'div', style: {'position': 'relative', 'top': '4px', 'float': 'left'}});
            var ContainerForm = new Tine.widgets.container.selectionComboBox({
                id: this.appName + 'EditRecordContainerSelector',
                fieldLabel: _('Saved in'),
                width: 300,
                name: this.containerProperty,
                //itemName: this.containerItemName,
                containerName: this.containerName,
                containersName: this.containersName,
                appName: this.appName
            });
            this.getForm().add(ContainerForm);
            
            var containerSelect = new Ext.Panel({
                layout: 'form',
                border: false,
                renderTo: this.recordContainerEl,
                bodyStyle: {'background-color': '#F0F0F0'},
                items: ContainerForm
            });
        }
    },
    
    /**
     * @private
     */
    initHandlers: function() {
        this.handlerScope = this.handlerScope ? this.handlerScope : this;
        
        this.handlerSaveAndClose = this.handlerSaveAndClose ? this.handlerSaveAndClose : function(e, button) {
            this.handlerApplyChanges(e, button, true);
        };
        
        this.handlerCancel = this.handlerCancel ? this.handlerCancel : this.closeWindow;
    },
    
    /**
     * update (action updateer) top and bottom toolbars
     */
    updateToolbars: function(record, containerField) {
        var actions = [
            this.action_saveAndClose,
            this.action_applyChanges,
            this.action_delete,
            this.action_cancel
        ];
        Tine.widgets.actionUpdater(record, actions, containerField);
        Tine.widgets.actionUpdater(record, this.tbarItems, containerField);
    },
    
    /**
     * get top toolbar
     */
	getToolbar: function() {
		return this.getTopToolbar();
	},
    
    /**
     * @private
     */
    onCancel: function(){
        this.fireEvent('cancel');
        this.purgeListeners();
    },
    
    /**
     * @private
     */
    onSaveAndClose: function(){
        this.fireEvent('saveAndClose');
    },
    
    /**
     * @private
     */
    onApply: function(){
        this.fireEvent('apply');
    },
    
    /**
     * helper function to close window
     */
    closeWindow: function() {
        this.window.close();
    }
});

Ext.reg('tineeditrecord', Tine.widgets.dialog.EditRecord);


// file: /var/www/tine20build/tine20/Tinebase/js/widgets/Priority.js
/*
 * Tine 2.0
 * 
 * @package     Tine
 * @subpackage  Widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
Ext.namespace('Tine.widgets');

Ext.namespace('Tine.widgets.Priority');

Tine.widgets.Priority.getStore = function() {
    if (! Tine.widgets.Priority.store) {
        Tine.widgets.Priority.store = new Ext.data.SimpleStore({
            storeId: 'Priorities',
            id: 'key',
            fields: ['key','value', 'icon'],
            data: [
                    ['0', _('low'),    '' ],
                    ['1', _('normal'), '' ],
                    ['2', _('high'),   '' ],
                    ['3', _('urgent'), '' ]
                ]
        });
    }
    
    return Tine.widgets.Priority.store;
};

Tine.widgets.Priority.Combo = Ext.extend(Ext.form.ComboBox, {
    /**
     * @cfg {bool} autoExpand Autoexpand comboBox on focus.
     */
    autoExpand: false,
    /**
     * @cfg {bool} blurOnSelect blurs combobox when item gets selected
     */
    blurOnSelect: false,
    
    displayField: 'value',
    valueField: 'key',
    mode: 'local',
    triggerAction: 'all',
    //selectOnFocus: true,
    editable: false,
    lazyInit: false,
    
    //private
    initComponent: function(){
        Tine.widgets.Priority.Combo.superclass.initComponent.call(this);
        // allways set a default
        if(!this.value) {
            this.value = 1;
        }
            
        this.store = Tine.widgets.Priority.getStore();
        
        if (this.autoExpand) {
            this.on('focus', function(){
                this.lazyInit = false;
                this.expand();
            });
        }
        if (this.blurOnSelect){
            this.on('select', function(){
                this.fireEvent('blur', this);
            }, this);
        }
    },
    
    setValue: function(value) {
        value = value || 1;
        Tine.widgets.Priority.Combo.superclass.setValue.call(this, value);
    }
});

Ext.reg('tineprioritycombo', Tine.widgets.Priority.Combo);

Tine.widgets.Priority.renderer = function(priority) {
    var s = Tine.widgets.Priority.getStore();
    var idx = s.find('key', priority);
    return (idx !== undefined && idx >= 0) ? s.getAt(idx).data.value : priority;
};

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/VersionCheck.js
/*
 * Tine 2.0
 * 
 * @package     Tine
 * @subpackage  Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */

Ext.namespace('Tine.widgets');

/**
 * check if newer version of Tine 2.0 is available
 * @class Tine.widgets.VersionCheck
 * @constructor
 */
Tine.widgets.VersionCheck = function() {
    
    var ds = new Ext.data.Store({
        proxy: new Ext.data.ScriptTagProxy({
            url: 'https://versioncheck.officespot20.com/versionCheck.php'
        }),
        reader: new Ext.data.JsonReader({
            root: 'version'
        }, ['codeName', 'packageString', 'releaseTime', 'critical', 'build'])
    });
    ds.on('load', function(store, records) {
        if (! Tine.Tinebase.registry.get('version')) {
            return false;
        }
        
        var version = records[0];
        
        var local = Date.parseDate(Tine.Tinebase.registry.get('version').releasetime, Date.patterns.ISO8601Long);
        var latest = Date.parseDate(version.get('releasetime'), Date.patterns.ISO8601Long);
        
        if (latest > local && Tine.Tinebase.common.hasRight('run', 'Tinebase')) {
            if (version.get('critical') == true) {
                Ext.MessageBox.show({
                    title: _('New version of Tine 2.0 available'), 
                    msg: String.format(_('Version "{0}" of Tine 2.0 is available.'), version.get('codeName')) + "\n" +
                                 _("It's a critical update and must be installed as soon as possible!"),
                    width: 500,
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.ERROR
                });
            } else {
                Ext.MessageBox.show({
                    title: _('New version of Tine 2.0 available'),
                    msg: String.format(_('Version "{0}" of Tine 2.0 is available.'), version.get('codeName')) + "\n" +
                                 _('Please consider updating!'),
                    width: 400,
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.INFO
                });
            }
        }
    }, this);
    
    ds.load({params: {version: Ext.util.JSON.encode(Tine.Tinebase.registry.get('version'))}});
};

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/AccountpickerPanel.js
/*
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */

Ext.namespace('Tine.widgets');

/**
 * Account picker widget
 * @class Tine.widgets.AccountpickerField
 * @package Tinebase
 * @subpackage Widgets
 * @extends Ext.form.TwinTriggerField
 * 
 * <p> This widget supplies a generic account picker field. When the field is
 triggered a {Tine.widgets.AccountpickerDialog} is showen, to select a account. </p>
 */
Tine.widgets.AccountpickerField = Ext.extend(Ext.form.TwinTriggerField, {
	/**
     * @cfg {bool}
     * selectOnFocus
     */
	selectOnFocus: true,
	
    /**
     * @property {Ext.data.Record} account
     */
    account: null,
    
    
    /**
     * @private
     */
    trigger2Class: 'x-form-account-trigger',
	allowBlank: true,
	editable: false,
    readOnly:true,
	triggerAction: 'all',
	typeAhead: true,
	trigger1Class:'x-form-clear-trigger',
	hideTrigger1:true,
	accountId: null,
	
	//private
    initComponent: function(){
	    Tine.widgets.AccountpickerField.superclass.initComponent.call(this);
		
        this.emptyText = _('nobody');
		if (this.selectOnFocus) {
			this.on('focus', function(){
				return this.onTrigger2Click();
			}, this);
		}
		
		this.onTrigger2Click = function(e) {
            if (! this.disabled) {
                this.dlg = new Tine.widgets.AccountpickerDialog({
                    TriggerField: this,
                    listeners: {
                        scope: this,
                        close: this.onDlgClose
                    }
                });
            }
        };
		
		this.on('select', function(){
			this.triggers[0].show();
		}, this);
	},
	
    // private
    getValue: function() {
        return this.accountId;
    },
    
    // private: only blur if dialog is closed
    onBlur: function() {
        if (!this.dlg) {
            return Tine.widgets.AccountpickerField.superclass.onBlur.apply(this, arguments);
        }
    },
    
    onDlgClose: function() {
        this.dlg = null;
    },
    
    setValue: function (value) {
        if (value) {
            this.triggers[0].show();
            if(value.accountId) {
                // account object
                this.accountId = value.accountId;
                value = value.accountDisplayName;
            } else if (typeof(value.get) == 'function') {
                // account record
                this.accountId = value.get('id');
                value = value.get('name');
            }
        }
        Tine.widgets.AccountpickerField.superclass.setValue.call(this, value);
    },
    
	// private
	onTrigger1Click: function() {
        if (! this.disabled) {
    		this.accountId = null;
    		this.setValue('');
    		this.fireEvent('select', this, null, 0);
    		this.triggers[0].hide();
        }
	}
});

/**
 * Account picker widget
 * @class Tine.widgets.AccountpickerDialog
 * @package Tinebase
 * @subpackage Widgets
 * @extends Ext.Component
 * 
 * <p> This widget supplies a modal account picker dialog.</p>
 */
Tine.widgets.AccountpickerDialog = Ext.extend(Ext.Component, {
	/**
	 * @cfg {Ext.form.field}
	 * TriggerField
	 */
	TriggerField: null,
	/**
     * @cfg {string}
     * title of dialog
     */
	title: null,
	
	// holds currently selected account
	account: false,
	
    // private
    initComponent: function(){
		Tine.widgets.AccountpickerDialog.superclass.initComponent.call(this);
		
        this.title = this.title ? this.title : _('please select an account');
        
        var ok_button = new Ext.Button({
            iconCls: 'action_saveAndClose',
            disabled: true,
            handler: this.handler_okbutton,
            text: _('Ok'),
            scope: this
        });
        
        var cancle_button = new Ext.Button({
            iconCls: 'action_cancel',
            scope: this,
            handler: function() {this.window.close();},
            text: _('Cancel')
        });
			
		this.window = new Ext.Window({
            title: this.title,
            modal: true,
            width: 320,
            height: 400,
            minWidth: 320,
            minHeight: 400,
            layout: 'fit',
            plain: true,
            bodyStyle: 'padding:5px;',
            buttonAlign: 'right',
			buttons: [cancle_button, ok_button]
        });
		
		this.accountPicker = new Tine.widgets.account.PickerPanel({
			'buttons': this.buttons
		});
        
		this.accountPicker.on('accountdblclick', function(account){
			this.account = account;
			this.handler_okbutton();
		}, this);
		
        
		this.accountPicker.on('accountselectionchange', function(account){
			this.account = account;
			ok_button.setDisabled(account ? false : true);
        }, this);
		
		this.window.add(this.accountPicker);
		this.window.show();
	},
	
	// private
	handler_okbutton: function(){
		this.TriggerField.setValue(this.account);
		this.TriggerField.fireEvent('select');
		this.window.close();
	}
});

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/account/PickerPanel.js
/**
 * Account picker panel
 * 
 * @class Tine.widgets.account.PickerPanel
 * @package Tinebase
 * @subpackage Widgets
 * @extends Ext.TabPanel
 * 
 * <p> This widget supplies a account picker panel to be used in related widgets.</p>
 */
 
Ext.namespace('Tine.widgets', 'Tine.widgets.account');
Tine.widgets.account.PickerPanel = Ext.extend(Ext.TabPanel, {
    /**
     * @cfg {String} one of 'user', 'group', 'both'
     * selectType
     */
    selectType: 'user',
    /**
     * @cfg{String} selectTypeDefault 'user' or 'group' defines which accountType is selected when  {selectType} is true
     */
    selectTypeDefault: 'user',
    /**
     * @cfg {Ext.Action}
     * selectAction
     */
    selectAction: false,
    /**
     * @cfg {Bool}
     * multiSelect
     */
    multiSelect: false,
    /**
     * @cfg {bool}
     * enable bottom toolbar
     */
    enableBbar: false,
    /**
     * @cfg {Ext.Toolbar}
     * optional bottom bar, defaults to 'add account' which fires 'accountdblclick' event
     */ 
    bbar: null,
    
    activeTab: 0,
    defaults:{autoScroll:true},
    border: false,
    split: true,
    width: 300,
    collapsible: false,
    
    //private
    initComponent: function(){
        this.addEvents(
            /**
             * @event accountdblclick
             * Fires when an account is dbl clicked
             * @param {Ext.Record} dbl clicked account
             */
            'accountdblclick',
            /**
             * @event accountselectionchange
             * Fires when account selection changes
             * @param {Ext.Record} dbl clicked account or undefined if none
             */
            'accountselectionchange'
        );
        
        this.actions = {
            addAccount: new Ext.Action({
                text: _('add account'),
                disabled: true,
                scope: this,
                handler: function(){
                    var account = this.searchPanel.getSelectionModel().getSelected();
                    this.fireEvent('accountdblclick', account);
                },
                iconCls: 'action_addContact'
            })
        };

        this.ugStore = new Ext.data.SimpleStore({
            fields: Tine.Tinebase.Model.Account
        });
        
        this.ugStore.setDefaultSort('name', 'asc');
        
        this.loadData = function() {
            var accountType  = Ext.ButtonToggleMgr.getSelected('account_picker_panel_ugselect').accountType;
            var searchString = Ext.getCmp('Tinebase_Accounts_SearchField').getRawValue();
            
            if (this.requestParams && this.requestParams.filter == searchString && this.requestParams.accountType == accountType) {
                return;
            }
            this.requestParams = { filter: searchString, accountType: accountType, dir: 'asc', start: 0, limit: 50 };
            
            Ext.getCmp('Tinebase_Accounts_Grid').getStore().removeAll();
            if (this.requestParams.filter.length < 1) {
                return;
            }
            
            switch (accountType){
                case 'user':
                    this.requestParams.method = 'Tinebase.getUsers';
                    this.requestParams.sort   = 'accountDisplayName';
                    Ext.Ajax.request({
                        params: this.requestParams,
                        success: function(response, options){
                            var data = Ext.util.JSON.decode(response.responseText);
                            var toLoad = [];
                            for (var i=0; i<data.results.length; i++){
                                var item = (data.results[i]);
                                toLoad.push( new Tine.Tinebase.Model.Account({
                                    id: item.accountId,
                                    type: 'user',
                                    name: item.accountDisplayName,
                                    data: item
                                }));
                            }
                            if (toLoad.length > 0) {
                                var grid = Ext.getCmp('Tinebase_Accounts_Grid');
                                grid.getStore().add(toLoad);
                                
                                // select first result and focus row
                                grid.getSelectionModel().selectFirstRow();                                
                                grid.getView().focusRow(0);
                            }
                        }
                    });
                    break;
                case 'group':
                    this.requestParams.method = 'Tinebase.getGroups';
                    this.requestParams.sort   = 'name';
                    Ext.Ajax.request({
                        params: this.requestParams,
                        success: function(response, options){
                            var data = Ext.util.JSON.decode(response.responseText);
                            var toLoad = [];
                            for (var i=0; i<data.results.length; i++){
                                var item = (data.results[i]);
                                toLoad.push( new Tine.Tinebase.Model.Account({
                                    id: item.id,
                                    type: 'group',
                                    name: item.name,
                                    data: item
                                }));
                            }
                            if (toLoad.length > 0) {
                                var grid = Ext.getCmp('Tinebase_Accounts_Grid');
                                grid.getStore().add(toLoad);
                                
                                // select first result
                                grid.getSelectionModel().selectFirstRow();
                                grid.getView().focusRow(0);
                            }
                        }
                    });
                    break;
            }
        };
        
        var columnModel = new Ext.grid.ColumnModel([
            {
                resizable: false,
                sortable: false, 
                id: 'name', 
                header: _('Name'), 
                dataIndex: 'name', 
                width: 70
            }
        ]);

        columnModel.defaultSortable = true; // by default columns are sortable
        
        //var rowSelectionModel = new Ext.grid.RowSelectionModel({multiSelect:true});
        this.quickSearchField = new Ext.ux.SearchField({
            id: 'Tinebase_Accounts_SearchField',
            emptyText: _('enter searchfilter')
        }); 
        this.quickSearchField.on('change', function(){
            this.loadData();
        }, this);
        
        var ugSelectionChange = function(pressed){
            //console.log(p.iconCls);
        };
        this.Toolbar = new Ext.Toolbar({
            items: [
            {
                scope: this,
                hidden: this.selectType != 'both',
                pressed: this.selectTypeDefault != 'group',
                accountType: 'user',
                iconCls: 'action_selectUser',
                xtype: 'tbbtnlockedtoggle',
                handler: this.loadData,
                enableToggle: true,
                toggleGroup: 'account_picker_panel_ugselect'
            },
            {
                scope: this,
                hidden: this.selectType != 'both',
                pressed: this.selectTypeDefault == 'group',
                iconCls: 'action_selectGroup',
                accountType: 'group',
                xtype: 'tbbtnlockedtoggle',
                handler: this.loadData,
                enableToggle: true,
                toggleGroup: 'account_picker_panel_ugselect'
            },
                this.quickSearchField
            ]
        });
        
        if (this.enableBbar && !this.bbar) {
            this.bbar = new Ext.Toolbar({
                items: [this.actions.addAccount]
            });
        }

        this.searchPanel = new Ext.grid.GridPanel({
            title: _('Search'),
            id: 'Tinebase_Accounts_Grid',
            store: this.ugStore,
            cm: columnModel,
            enableColumnHide:false,
            enableColumnMove:false,
            autoSizeColumns: false,
            selModel: new Ext.grid.RowSelectionModel({multiSelect:this.multiSelect}),
            enableColLock:false,
            loadMask: true,
            autoExpandColumn: 'name',
            tbar: this.Toolbar,
            border: false
        });
        
        this.searchPanel.on('rowdblclick', function(grid, row, event) {
            var account = this.searchPanel.getSelectionModel().getSelected();
            this.fireEvent('accountdblclick', account);
        }, this);
        
        // on keypressed("enter") event to add account
        this.searchPanel.on('keydown', function(event){
             //if(event.getKey() == event.ENTER && !this.searchPanel.editing){
             if(event.getKey() == event.ENTER){
                var account = this.searchPanel.getSelectionModel().getSelected();
                this.fireEvent('accountdblclick', account);
             }
        }, this);
        
        this.searchPanel.getSelectionModel().on('selectionchange', function(sm){
            var account = sm.getSelected();
            this.actions.addAccount.setDisabled(!account);
            this.fireEvent('accountselectionchange', account);
        }, this);
        
        this.items = [this.searchPanel, {
           title: _('Browse'),
           html: _('Browse'),
           disabled: true
        }];
        
        Tine.widgets.account.PickerPanel.superclass.initComponent.call(this);
        
        this.on('resize', function(){
            this.quickSearchField.setWidth(this.getSize().width - 3 - (this.selectType == 'both' ? 44 : 0));
        }, this);

        this.quickSearchField.on('render', function(field) {
            this.quickSearchField.focus(false, 350);
        }, this);
    }
});
// file: /var/www/tine20build/tine20/Tinebase/js/widgets/account/ConfigGrid.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 * @todo        make sort by name work in config grid panel 
 */
 
Ext.namespace('Tine.widgets', 'Tine.widgets.account');
Tine.widgets.account.ConfigGrid = Ext.extend(Ext.Panel, {
    /**
     * @cfg {Int} accountPickerWidth
     */
    accountPickerWidth: 200,
    /**
     * @cfg accountPickerType one of 'user', 'group', 'both'
     */
    accountPickerType: 'user',
    /**
     * @cfg{String} accountPickerTypeDefault 'user' or 'group' defines which accountType is selected when  {selectType} is true
     */
    accountPickerTypeDefault: 'user',    
    /**
     * @cfg {String} title for the account list
     */
    accountListTitle: '',
    /**
     * @cfg {Ext.data.JsonStore} configStore
     */
    configStore: null,
    /**
     * @cfg {bool} have the record account properties an account prefix?
     */
    hasAccountPrefix: false,
    /**
     * @cfg {Array} Array of column's config objects where the config options are in
     */
    configColumns: [],
    /**
     * @cfg {Array} contextMenuItems
     * additional items for contextMenu
     */
    contextMenuItems: [],
    
    accountPicker: null,
    configGridPanel: null,
    
    layout: 'border',
    border: false,

    /**
     * @private
     */
    initComponent: function(){
        this.recordPrefix = this.hasAccountPrefix ? 'account_' : '';
        
        this.action_removeAccount = new Ext.Action({
            text: _('Remove account'),
            disabled: true,
            scope: this,
            handler: this.removeAccount,
            iconCls: 'action_deleteContact'
        });
        
        this.configStore.sort(this.recordPrefix + 'name', 'asc');
        
        
        /* account picker */
        this.accountPicker = new Tine.widgets.account.PickerPanel({
            selectType: this.accountPickerType,
            selectTypeDefault: this.accountPickerTypeDefault,
            enableBbar: true
        });
        this.accountPicker.on('accountdblclick', function(account){
            this.addAccount(account);   
        }, this);
        
        /* col model */
        var columnModel = new Ext.grid.ColumnModel([{
                resizable: true, 
                id: this.recordPrefix + 'name', 
                header: _('Name'), 
                dataIndex: this.recordPrefix + 'name', 
                renderer: Tine.Tinebase.common.accountRenderer,
                width: 70
                //sortable: true
            }].concat(this.configColumns)
        );
        columnModel.defaultSortable = true; // by default columns are sortable
        
        /* selection model */
        var rowSelectionModel = new Ext.grid.RowSelectionModel({
            multiSelect:true
        });
        
        rowSelectionModel.on('selectionchange', function(selectionModel) {
            this.action_removeAccount.setDisabled(selectionModel.getCount() < 1);
        }, this);
        
        // remove non-plugin config columns
        var nonPluginColumns = [];
        for (var i=0; i < this.configColumns.length; i++) {
        	if (!this.configColumns[i].init || typeof(this.configColumns[i].init) != 'function') {
        		nonPluginColumns.push(this.configColumns[i]);
        	}
        }
        for (var i=0; i < nonPluginColumns.length; i++) {
        	this.configColumns.remove(nonPluginColumns[i]);
        }
        
        /* grid panel */
        this.configGridPanel = new Ext.grid.EditorGridPanel({
            title: this.accountListTitle,
            store: this.configStore,
            cm: columnModel,
            autoSizeColumns: false,
            selModel: rowSelectionModel,
            enableColLock:false,
            loadMask: true,
            plugins: this.configColumns,
            autoExpandColumn: this.recordPrefix + 'name',
            bbar: [this.action_removeAccount],
            border: false
        });
        this.configGridPanel.on('rowcontextmenu', function(_grid, _rowIndex, _eventObject) {
            _eventObject.stopEvent();
            if(!_grid.getSelectionModel().isSelected(_rowIndex)) {
                _grid.getSelectionModel().selectRow(_rowIndex);
            }
            var contextItems = [this.action_removeAccount]; 
            var menu = new Ext.menu.Menu({
                items: contextItems.concat(this.contextMenuItems)
            }).showAt(_eventObject.getXY());
        }, this);
        
        this.items = this.getConfigGridLayout();
        
        Tine.widgets.account.ConfigGrid.superclass.initComponent.call(this);
        
        this.on('afterlayout', function(container){
            var height = container.ownerCt.getSize().height;
            this.setHeight(height);
            this.items.each(function(item){
                item.setHeight(height);
            });
        },this);
    },
    /**
     * @private Layout
     */
    getConfigGridLayout: function() {
        return [{
            layout: 'fit',
            region: 'west',
            border: false,
            split: true,
            width: this.accountPickerWidth,
            items: this.accountPicker
        },{
            layout: 'fit',
            region: 'center',
            border: false,
            items: this.configGridPanel
        }];
    },
    /**
     * add given account to this.configStore
     * 
     * @param {Tine.model.account}
     */
    addAccount: function(account) {
        var recordIndex = this.getRecordIndex(account);
        if (recordIndex === false) {
            var newRecord = {};
            newRecord[this.recordPrefix + 'name'] = account.data.name;
            newRecord[this.recordPrefix + 'type'] = account.data.type;
            newRecord[this.recordPrefix + 'id'] = account.data.id;
            
            var newData = {};
            newData[this.configStore.root] = [newRecord];
            newData[this.configStore.totalProperty] = 1;
            
            this.configStore.loadData(newData,true);
        }
        this.configGridPanel.getSelectionModel().selectRow(this.getRecordIndex(account));
    },
    /**
     * removes currently in this.configGridPanel selected rows
     */
    removeAccount: function() {
        var selectedRows = this.configGridPanel.getSelectionModel().getSelections();
        for (var i = 0; i < selectedRows.length; ++i) {
            this.configStore.remove(selectedRows[i]);
        }
    },
    /**
     * returns index of given record in this.configStore
     * 
     * @param {Tine.model.account}
     */
    getRecordIndex: function(account) {
        var id = false;
        this.configStore.each(function(item){
            if ( item.data[this.recordPrefix + 'type'] == 'user' && account.data.type == 'user' &&
                    item.data[this.recordPrefix + 'id'] == account.data.id) {
                id = item.id;
            } else if (item.data[this.recordPrefix + 'type'] == 'group' && account.data.type == 'group' &&
                    item.data[this.recordPrefix + 'id'] == account.data.id) {
                id = item.id;
            }
        }, this);
        return id ? this.configStore.indexOfId(id) : false;
    }
    
});
// file: /var/www/tine20build/tine20/Tinebase/js/widgets/dialog/AlarmPanel.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 * TODO         make multiple alarms possible
 * TODO         add custom 'alarm time before' inputfield + combo (with min/day/week/...)
 * TODO         add combo with 'alarm for' single attender / all attendee (extend this panel in calendar?)
 * TODO         use Tine.Tinebase.Model.Alarm?
 */
 
Ext.ns('Tine.widgets', 'Tine.widgets.dialog');

/**
 * Alarm panel
 */
Tine.widgets.dialog.AlarmPanel = Ext.extend(Ext.Panel, {
    
    //private
    // TODO do we need all of those?
    layout: 'form',
    border: true,
    frame: true,
    labelAlign: 'top',
    autoScroll: true,
    defaults: {
        anchor: '100%',
        labelSeparator: ''
    },
    
    initComponent: function() {
        this.title = _('Alarms');
        
        this.items = this.getFormItems();
        
        Tine.widgets.dialog.AlarmPanel.superclass.initComponent.call(this);
    },
    
    getFormItems: function() {
        
        this.alarmCombo = new Ext.form.ComboBox({
            columnWidth: 0.33,
            fieldLabel: _('Send Alarm'),
            name: 'alarm_time_before',
            typeAhead     : false,
            triggerAction : 'all',
            lazyRender    : true,
            editable      : false,
            mode          : 'local',
            forceSelection: true,
            value: 'none',
            store: [
                ['none',    _('None')],
                ['0',       _('0 minutes before')],
                ['15',      _('15 minutes before')],
                ['30',      _('30 minutes before')],
                ['60',      _('1 hour before')],
                ['120',     _('2 hours before')],
                ['1440',    _('1 day before')]
            ]
        });
        
        return {
            layout: 'column',
            style: 'padding-top: 5px;',
            items: this.alarmCombo
        };
    },
    
    /**
     * 
     * @param {Object} record
     */
    onRecordLoad: function(record) {
        this.record = record;
        
        // set combo
        if (record.get('alarms') && record.get('alarms').length > 0) {
            // only get first alarm at the moment
            var alarm = record.get('alarms')[0];
            this.alarmCombo.setValue(alarm.minutes_before);
        }
    },

    /**
     * 
     * @param {Object} record
     */
    onRecordUpdate: function(record) {
        
        var comboValue = this.alarmCombo.getValue();
        var alarm = null;
        
        if (comboValue != 'none') {
            // update or create
            alarm = (record.get('alarms') && record.get('alarms').length > 0) ? record.get('alarms')[0] : {};
            alarm.minutes_before = comboValue;
        }
        
        // we need to initialze alarms because stringcompare would detect no change of the arrays
        record.set('alarms', '');
        if (alarm != null) {
            record.set('alarms', [alarm]);
        }
    }
});

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/dialog/EditDialog.js
/**
 * Tine 2.0
 * 
 * @package     Tine
 * @subpackage  Widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 * 
 */
Ext.namespace('Tine.widgets');

Ext.namespace('Tine.widgets.dialog');

/**
 * Generic 'Edit Record' dialog
 */
/**
 * @class Tine.widgets.dialog.EditDialog
 * @extends Ext.FormPanel
 * Base class for all 'Edit Record' dialogs
 * @constructor
 * @param {Object} config The configuration options.
 */
Tine.widgets.dialog.EditDialog = Ext.extend(Ext.FormPanel, {
    /**
     * @cfg {Tine.Tinebase.Application} app
     * instance of the app object (required)
     */
    app: null,
    /**
     * @cfg {String} mode
     * Set to 'local' if the EditDialog only operates on this.record (defaults to 'remote' which loads and saves using the recordProxy)
     */
    mode : 'remote',
    /**
     * @cfg {Array} tbarItems
     * additional toolbar items (defaults to false)
     */
    tbarItems: false,
    /**
     * @cfg {String} appName
     * internal/untranslated app name (required)
     */
    appName: null,
    /**
     * @cfg {Ext.data.Record} recordClass
     * record definition class  (required)
     */
    recordClass: null,
    /**
     * @cfg {Ext.data.DataProxy} recordProxy
     */
    recordProxy: null,
    /**
     * @cfg {Bool} showContainerSelector
     * show container selector in bottom area
     */
    showContainerSelector: false,
    /**
     * @cfg {Bool} evalGrants
     * should grants of a grant-aware records be evaluated (defaults to true)
     */
    evalGrants: true,
    /**
     * @cfg {Ext.data.Record} record
     * record in edit process.
     */
    record: null,

    /**
     * @cfg {String} saveAndCloseButtonText
     * text of save and close button
     */
    saveAndCloseButtonText: '',

    /**
     * @property window {Ext.Window|Ext.ux.PopupWindow|Ext.Air.Window}
     */
    /**
     * @property {Number} loadRequest 
     * transaction id of loadData request
     */
    /**
     * @property loadMask {Ext.LoadMask}
     */
    
    // private
    bodyStyle:'padding:5px',
    layout: 'fit',
    cls: 'tw-editdialog',
    anchor:'100% 100%',
    deferredRender: false,
    buttonAlign: 'right',
    
    //private
    initComponent: function(){
        this.addEvents(
            /**
             * @event cancel
             * Fired when user pressed cancel button
             */
            'cancel',
            /**
             * @event saveAndClose
             * Fired when user pressed OK button
             */
            'saveAndClose',
            /**
             * @event update
             * @desc  Fired when the record got updated
             * @param {Json String} data data of the entry
             */
            'update',
            /**
             * @event apply
             * Fired when user pressed apply button
             */
            'apply',
            /**
             * @event load
             * Fired when record is loaded
             */
            'load'
        );
        
        if (! this.app) {
            this.app = Tine.Tinebase.appMgr.get(this.appName);
        }
        
        // init some translations
        if (this.app.i18n && this.recordClass !== null) {
            this.i18nRecordName = this.app.i18n.n_hidden(this.recordClass.getMeta('recordName'), this.recordClass.getMeta('recordsName'), 1);
            this.i18nRecordsName = this.app.i18n._hidden(this.recordClass.getMeta('recordsName'));
        }
        
        // init actions
        this.initActions();
        // init buttons and tbar
        this.initButtons();
        // init record 
        this.initRecord();
        // get items for this dialog
        this.items = this.getFormItems();
        
        Tine.widgets.dialog.EditDialog.superclass.initComponent.call(this);
    },
    
    /**
     * init actions
     */
    initActions: function() {
        this.action_saveAndClose = new Ext.Action({
            requiredGrant: 'editGrant',
            text: (this.saveAndCloseButtonText != '') ? this.app.i18n._(this.saveAndCloseButtonText) : _('Ok'),
            minWidth: 70,
            scope: this,
            handler: this.onSaveAndClose,
            iconCls: 'action_saveAndClose'
        });
    
        this.action_applyChanges = new Ext.Action({
            requiredGrant: 'editGrant',
            text: _('Apply'),
            minWidth: 70,
            scope: this,
            handler: this.onApplyChanges,
            iconCls: 'action_applyChanges'
        });
        
        this.action_cancel = new Ext.Action({
            text: _('Cancel'),
            minWidth: 70,
            scope: this,
            handler: this.onCancel,
            iconCls: 'action_cancel'
        });
        
        this.action_delete = new Ext.Action({
            requiredGrant: 'deleteGrant',
            text: _('delete'),
            minWidth: 70,
            scope: this,
            handler: this.onDelete,
            iconCls: 'action_delete',
            disabled: true
        });
    },
    
    /**
     * init buttons
     */
    initButtons: function() {
        var genericButtons = [
            this.action_delete
        ];
        
        //this.tbarItems = genericButtons.concat(this.tbarItems);
        
        this.buttons = [
            //this.action_applyChanges,
            this.action_cancel,
            this.action_saveAndClose
       ];
       
        if (this.tbarItems) {
            this.tbar = new Ext.Toolbar({
                items: this.tbarItems
            });
        }
    },
    
    /**
     * init record to edit
     */
    initRecord: function() {
        // note: in local mode we expect a valid record
        if (this.mode !== 'local') {
            
            if (this.record && this.record.id) {
                this.loadRequest = this.recordProxy.loadRecord(this.record, {
                    scope: this,
                    success: function(record) {
                        this.record = record;
                        this.onRecordLoad();
                    }
                });
            } else {
                this.record = new this.recordClass(this.recordClass.getDefaultData(), 0);
                this.onRecordLoad();
            }
        } else {
            if (! typeof this.record.beginEdit != 'function') {
                this.record = this.recordProxy.recordReader({responseText: this.record});
            }
            this.onRecordLoad();
        }
    },
    
    /**
     * executed after record got updated from proxy
     */
    onRecordLoad: function() {
        // interrupt process flow until dialog is rendered
        if (! this.rendered) {
            this.onRecordLoad.defer(250, this);
            return;
        }
        
        if (! this.record.id) {
            this.window.setTitle(String.format(_('Add New {0}'), this.i18nRecordName));
        } else {
            this.window.setTitle(String.format(_('Edit {0} "{1}"'), this.i18nRecordName, this.record.getTitle()));
        }
        
        if (this.fireEvent('load', this) !== false) {
            this.getForm().loadRecord(this.record);
            this.updateToolbars(this.record, this.recordClass.getMeta('containerProperty'));
            
            this.loadMask.hide();
        }
    },
    
    /**
     * executed when record gets updated from form
     */
    onRecordUpdate: function() {
        var form = this.getForm();
        
        // merge changes from form into record
        form.updateRecord(this.record);
    },
    
    /**
     * @private
     */
    onRender : function(ct, position){
        Tine.widgets.dialog.EditDialog.superclass.onRender.call(this, ct, position);
        
        // generalized keybord map for edit dlgs
        var map = new Ext.KeyMap(this.el, [
            {
                key: [10,13], // enter + return
                ctrl: true,
                fn: this.onSaveAndClose,
                scope: this
            }
        ]);

        // recalculate height, as autoHeight fails for Ext.Window ;-(
        this.setHeight(Ext.fly(this.el.dom.parentNode).getHeight());
        
        if (this.showContainerSelector) {
            this.recordContainerEl = this.footer.first().first().insertFirst({tag: 'div', style: {'position': 'relative', 'top': '4px', 'float': 'left'}});
            var ContainerForm = new Tine.widgets.container.selectionComboBox({
                id: this.app.appName + 'EditDialogContainerSelector',
                fieldLabel: _('Saved in'),
                width: 300,
                name: this.recordClass.getMeta('containerProperty'),
                //itemName: this.recordClass.recordName,
                containerName: this.app.i18n.n_hidden(this.recordClass.getMeta('containerName'), this.recordClass.getMeta('containersName'), 1),
                containersName: this.app.i18n._hidden(this.recordClass.getMeta('containersName')),
                appName: this.app.appName
            });
            this.getForm().add(ContainerForm);
            
            var containerSelect = new Ext.Panel({
                layout: 'form',
                border: false,
                renderTo: this.recordContainerEl,
                bodyStyle: {'background-color': '#F0F0F0'},
                items: ContainerForm
            });
        }
        
        this.loadMask = new Ext.LoadMask(ct, {msg: String.format(_('Transfering {0}...'), this.i18nRecordName)});
        if (this.recordProxy !== null && this.recordProxy.isLoading(this.loadRequest)) {
            this.loadMask.show();
        }
    },
    
    /**
     * update (action updateer) top and bottom toolbars
     */
    updateToolbars: function(record, containerField) {
        if (! this.evalGrants) {
            return;
        }
        
        var actions = [
            this.action_saveAndClose,
            this.action_applyChanges,
            this.action_delete,
            this.action_cancel
        ];
        Tine.widgets.actionUpdater(record, actions, containerField);
        Tine.widgets.actionUpdater(record, this.tbarItems, containerField);
    },
    
    /**
     * get top toolbar
     */
    getToolbar: function() {
        return this.getTopToolbar();
    },
    
    isValid: function() {
        return this.getForm().isValid();
    },
    
    /**
     * @private
     */
    onCancel: function(){
        this.fireEvent('cancel');
        this.purgeListeners();
        this.window.close();
    },
    
    /**
     * @private
     */
    onSaveAndClose: function(button, event){
        this.onApplyChanges(button, event, true);
        this.fireEvent('saveAndClose');
    },
    
    /**
     * generic apply changes handler
     */
    onApplyChanges: function(button, event, closeWindow) {
        if(this.isValid()) {
            this.loadMask.show();
            
            this.onRecordUpdate();
            
            if (this.mode !== 'local') {
                this.recordProxy.saveRecord(this.record, {
                    scope: this,
                    success: function(record) {
                        // override record with returned data
                        this.record = record;
                        
                        // update form with this new data
                        // NOTE: We update the form also when window should be closed,
                        //       cause sometimes security restrictions might prevent
                        //       closing of native windows
                        this.onRecordLoad();
                        this.fireEvent('update', Ext.util.JSON.encode(this.record.data));
                        
                        // free 0 namespace if record got created
                        this.window.rename(this.windowNamePrefix + this.record.id);
                        
                        if (closeWindow) {
                            this.purgeListeners();
                            this.window.close();
                        }
                    },
                    // NOTE: we don't have a failure handler in the generic edit dialog any more (always open exception dialog on fail)
                    //       -> use the method 'onRequestFailed' for custom handling in child class
                    /*failure:  function (result, request) {
                        Ext.MessageBox.alert(_('Failed'), String.format(_('Could not save {0}.'), this.i18nRecordName)); 
                    },*/
                    exceptionHandler: this.onRequestFailed,
                    timeout: 150000 // 3 minutes
                });
            } else {
                this.onRecordLoad();
                this.fireEvent('update', Ext.util.JSON.encode(this.record.data));
                
                // free 0 namespace if record got created
                this.window.rename(this.windowNamePrefix + this.record.id);
                        
                if (closeWindow) {
                    this.purgeListeners();
                    this.window.close();
                }
            }
        } else {
            Ext.MessageBox.alert(_('Errors'), _('Please fix the errors noted.'));
        }
    },
    
    /**
     * generic delete handler
     */
    onDelete: function(btn, e) {
        Ext.MessageBox.confirm(_('Confirm'), String.format(_('Do you really want to delete this {0}?'), this.i18nRecordName), function(_button) {
            if(btn == 'yes') {
                var deleteMask = new Ext.LoadMask(this.getEl(), {msg: String.format(_('Deleting {0}'), this.i18nRecordName)});
                deleteMask.show();
                
                this.recordProxy.deleteRecords(this.record, {
                    scope: this,
                    success: function() {
                        this.purgeListeners();
                        this.window.close();
                    },
                    failure: function () { 
                        Ext.MessageBox.alert(_('Failed'), String.format(_('Could not delete {0}.'), this.i18nRecordName));
                        Ext.MessageBox.hide();
                    }
                });
            }
        });
    }
});

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/dialog/CredentialsDialog.js
/**
 * Tine 2.0
 * 
 * @package     Tine
 * @subpackage  Widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 * 
 */

Ext.namespace('Tine.widgets', 'Tine.widgets.dialog');

/**
 * Generic 'Credentials' dialog
 */
/**
 * @class Tine.widgets.dialog.CredentialsPanel
 * @extends Tine.widgets.dialog.EditDialog
 * @constructor
 * @param {Object} config The configuration options.
 */
Tine.widgets.dialog.CredentialsDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
    
    credentialsId: null,
    
    /**
     * @private
     */
    windowNamePrefix: 'CredentialsWindow_',
    loadRecord: false,
    tbarItems: [],
    evalGrants: false,
    
    /**
     * init record to edit
     * 
     * - overwritten: we don't have a record here 
     */
    initRecord: function() {
    },
    
    /**
     * returns dialog
     */
    getFormItems: function() {
        return {
            bodyStyle: 'padding:5px;',
            buttonAlign: 'right',
            labelAlign: 'top',
            border: false,
            layout: 'form',
            defaults: {
                xtype: 'textfield',
                anchor: '90%',
                listeners: {
                    scope: this,
                    specialkey: function(field, event) {
                        if (event.getKey() == event.ENTER) {
                            this.onApplyChanges({}, event, true);
                        }
                    }
                }
            },
            items: [{
                fieldLabel: _('Username'), 
                name: 'username',
                allowBlank: false
            },{
                fieldLabel: _('Password'), 
                name: 'password',
                inputType: 'password'
            }]
        };
    },
    
    /**
     * generic apply changes handler
     */
    onApplyChanges: function(button, event, closeWindow) {
        var form = this.getForm();
        if(form.isValid()) {
            this.loadMask.show();
            
            var values = form.getValues();

            var params = {
                method: this.appName + '.changeCredentials',
                password: values.password,
                username: values.username,
                id: this.credentialsId
            };
            
            Ext.Ajax.request({
                params: params,
                scope: this,
                success: function(_result, _request){
                    this.loadMask.hide();
                    this.fireEvent('update', _result);
                    
                    if (closeWindow) {
                        this.purgeListeners();
                        this.window.close();
                    }
                }
            });
            
        } else {
            Ext.MessageBox.alert(_('Errors'), _('Please fix the errors noted.'));
        }
    }
});

/**
 * credentials dialog popup / window
 */
Tine.widgets.dialog.CredentialsDialog.openWindow = function (config) {
    var window = Tine.WindowFactory.getWindow({
        width: 240,
        height: 180,
        name: Tine.widgets.dialog.CredentialsDialog.windowNamePrefix + Ext.id(),
        contentPanelConstructor: 'Tine.widgets.dialog.CredentialsDialog',
        contentPanelConstructorConfig: config,
        modal: true
    });
    return window;
};

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/dialog/PreferencesDialog.js
/*
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 * @todo        add filter toolbar
 * @todo        use proxy store?
 */

Ext.namespace('Tine.widgets');

Ext.namespace('Tine.widgets.dialog');

/**
 * 'Edit Preferences' dialog
 */
/**
 * @class Tine.widgets.dialog.Preferences
 * @extends Ext.FormPanel
 * @constructor
 * @param {Object} config The configuration options.
 */
Tine.widgets.dialog.Preferences = Ext.extend(Ext.FormPanel, {
    /**
     * @property window {Ext.Window|Ext.ux.PopupWindow|Ext.Air.Window}
     */
    /**
     * @property {Number} loadRequest 
     * transaction id of loadData request
     */
    /**
     * @property loadMask {Ext.LoadMask}
     */
    
    /**
     * @property {Locale.gettext} i18n
     */
    i18n: null,

    /**
     * @property {Tine.widgets.dialog.PreferencesCardPanel} prefsCardPanel
     */
    prefsCardPanel: null,
    
    /**
     * @property {Tine.widgets.dialog.PreferencesTreePanel} treePanel
     */
    treePanel: null,
    
    /**
     * @property {Object} prefPanels
     * here we store the pref panels for all apps
     */    
    prefPanels: {},

    /**
     * @property {boolean} adminMode
     * when adminMode is activated -> show defaults/forced values
     */    
    adminMode: false,

    /**
     * @property {Object} prefPanels
     * here we store the pref panels for all apps [admin mode]
     */    
    adminPrefPanels: {},
    
    // private
    bodyStyle:'padding:5px',
    layout: 'fit',
    cls: 'tw-editdialog',
    anchor:'100% 100%',
    buttonAlign: 'right',
    
    //private
    initComponent: function(){
        this.addEvents(
            /**
             * @event cancel
             * Fired when user pressed cancel button
             */
            'cancel',
            /**
             * @event saveAndClose
             * Fired when user pressed OK button
             */
            'saveAndClose',
            /**
             * @event update
             * @desc  Fired when the record got updated
             * @param {Json String} data data of the entry
             */
            'update'
        );
        
        this.i18n = new Locale.Gettext();
        this.i18n.textdomain('Tinebase');

        // init actions
        this.initActions();
        // init buttons and tbar
        this.initButtons();
        // get items for this dialog
        this.items = this.getItems();
        
        Tine.widgets.dialog.Preferences.superclass.initComponent.call(this);
    },
    
    /**
     * init actions
     * 
     * @todo only allow admin mode if user has admin right
     */
    initActions: function() {
        this.action_saveAndClose = new Ext.Action({
            text: _('Ok'),
            minWidth: 70,
            scope: this,
            handler: this.onSaveAndClose,
            iconCls: 'action_saveAndClose'
        });
    
        this.action_cancel = new Ext.Action({
            text: _('Cancel'),
            minWidth: 70,
            scope: this,
            handler: this.onCancel,
            iconCls: 'action_cancel'
        });

        this.action_switchAdminMode = new Ext.Action({
            text: _('Admin Mode'),
            minWidth: 70,
            scope: this,
            handler: this.onSwitchAdminMode,
            iconCls: 'action_adminMode',
            enableToggle: true
            //disabled: true
        });
    },
    
    /**
     * init buttons
     */
    initButtons: function() {
        this.buttons = [
            this.action_cancel,
            this.action_saveAndClose
        ];
       
        this.tbar = new Ext.Toolbar({
            items: [
                this.action_switchAdminMode
            ]
        });
    },
    
    /**
     * returns dialog
     * 
     * NOTE: when this method gets called, all initalisation is done.
     */
    getItems: function() {
    	this.prefsCardPanel = new Tine.widgets.dialog.PreferencesCardPanel({
            region: 'center'
        });
        this.treePanel = new Tine.widgets.dialog.PreferencesTreePanel({
            title: _('Applications'),
            region: 'west',
            width: 200,
            frame: true
        })
        return [{
        	xtype: 'panel',
            autoScroll: true,
            border: true,
            frame: true,
            layout: 'border',
            items: [
                this.treePanel,
                this.prefsCardPanel
            ]
        }];
    },
    
    /**
     * @private
     */
    onRender : function(ct, position){
        Tine.widgets.dialog.Preferences.superclass.onRender.call(this, ct, position);
        
        // recalculate height, as autoHeight fails for Ext.Window ;-(
        this.setHeight(Ext.fly(this.el.dom.parentNode).getHeight());
        
        this.window.setTitle(this.i18n._('Edit Preferences'));
        this.loadMask = new Ext.LoadMask(ct, {msg: _('Loading ...')});
        //this.loadMask.show();
    },
    
    /**
     * @private
     */
    onCancel: function(){
        this.fireEvent('cancel');
        this.purgeListeners();
        this.window.close();
    },

    /**
     * @private
     * 
     * TODO check if this is working correctly
     */
    onDestroy: function(){
        // delete panels
        for (var panelName in this.adminPrefPanels) {
            if (this.adminPrefPanels.hasOwnProperty(panelName)) {
                if (this.adminPrefPanels[panelName] !== null) {
                    this.adminPrefPanels[panelName].destroy();
                    this.adminPrefPanels[panelName] = null;
                }
            }
        }
        for (panelName in this.prefPanels) {
            if (this.prefPanels.hasOwnProperty(panelName)) {
                if (this.prefPanels[panelName] !== null) {
                    this.prefPanels[panelName].destroy();
                    this.prefPanels[panelName] = null;
                }
            }
        }
        this.prefsCardPanel.destroy();
        this.prefsCardPanel = null;
        
        Tine.widgets.dialog.Preferences.superclass.onDestroy.apply(this, arguments);
    },
    
    /**
     * @private
     */
    onSaveAndClose: function(button, event){
        this.onApplyChanges(button, event, true);
        this.fireEvent('saveAndClose');
    },
    
    /**
     * generic apply changes handler
     * 
     * @todo display alert message if there are changed panels with data from the other mode
     * @todo submit 'lock' info as well in admin mode
     */
    onApplyChanges: function(button, event, closeWindow) {
    	
    	this.loadMask.show();
    	
    	// get values from card panels
        var data = this.getValuesFromPanels();
    	
    	// save preference data
    	Ext.Ajax.request({
            scope: this,
            params: {
                method: 'Tinebase.savePreferences',
                data: Ext.util.JSON.encode(data),
                adminMode: (this.adminMode) ? 1 : 0
            },
            success: function(response) {
                this.loadMask.hide();
                
                // update registry
                this.updateRegistry(Ext.util.JSON.decode(response.responseText).results);
                
                if (closeWindow) {
                    this.purgeListeners();
                    this.window.close();
                }
            },
            failure: function (response) {
                Ext.MessageBox.alert(_('Errors'), _('Saving of preferences failed.'));    
            }
        });
    },
    
    /**
     * get values from card panels
     * 
     * @return {Object} with form data
     */
    getValuesFromPanels: function() {
        var panel, data = {};
        var panelsToSave = (this.adminMode) ? this.adminPrefPanels : this.prefPanels;

        for (panelName in panelsToSave) {
            if (panelsToSave.hasOwnProperty(panelName)) {
                panel = panelsToSave[panelName];
                if (panel !== null) {
                    data[panel.appName] = {};
                    for (var j=0; j < panel.items.length; j++) {
                        var item = panel.items.items[j];
                        if (item && item.name) {
                            if (this.adminMode) {
                                data[panel.appName][item.prefId] = {value: item.getValue(), name: item.name};
                                data[panel.appName][item.prefId].type = (Ext.getCmp(item.name + '_writable').getValue() == 1) ? 'default' : 'forced';
                            } else {
                                data[panel.appName][item.name] = {value: item.getValue()};
                            }
                        }
                    }
                }
            }
        }
        
        return data;
    },
    
    /**
     * update registry after saving of prefs
     * 
     * @param {Object} data
     */
    updateRegistry: function(data) {
        for (application in data) {
            if (data.hasOwnProperty(application)) {
                appPrefs = data[application];
                var registryValues = Tine[application].registry.get('preferences');
                var changed = false;
                for (var i=0; i < appPrefs.length; i++) {
                    if (registryValues.get(appPrefs[i].name) != appPrefs[i].value) {
                        registryValues.replace(appPrefs[i].name, appPrefs[i].value);
                        changed = true;
                    }
                }
                
                if (changed) {
                    Tine[application].registry.replace('preferences', registryValues);
                }
            }
        }
    },
    
    /**
     * onSwitchAdminMode
     * 
     * @private
     * 
     * @todo enable/disable apps according to admin right for applications
     */
    onSwitchAdminMode: function(button, event) {
    	this.adminMode = (!this.adminMode);
    	
        if (this.adminMode) {
        	this.prefsCardPanel.addClass('prefpanel_adminMode');
        } else {
        	this.prefsCardPanel.removeClass('prefpanel_adminMode');
        }
        
        // activate panel in card panel
        var selectedNode = this.treePanel.getSelectionModel().getSelectedNode();
        if (selectedNode) {
            this.showPrefsForApp(this.treePanel.getSelectionModel().getSelectedNode().id);
        }
        
        this.treePanel.checkGrants(this.adminMode);
    },

	/**
     * init app preferences store
     * 
     * @param {String} appName
     * 
     * @todo use generic json backend here?
     */
    initPrefStore: function(appName) {
    	this.loadMask.show();
    	
    	// set filter to get only default/forced values if in admin mode
    	var filter = (this.adminMode) ? [{field: 'account', operator: 'equals', value: {accountId: 0, accountType: 'anyone'}}] : '';
    	
        var store = new Ext.data.JsonStore({
            fields: Tine.Tinebase.Model.Preference,
            baseParams: {
                method: 'Tinebase.searchPreferencesForApplication',
                applicationName: appName,
                filter: Ext.util.JSON.encode(filter)
            },
            listeners: {
                load: this.onStoreLoad,
                scope: this
            },
            root: 'results',
            totalProperty: 'totalcount',
            id: 'id',
            remoteSort: false
        });
        
        store.load();
    },

    /**
     * called after a new set of preference Records has been loaded
     * 
     * @param  {Ext.data.Store} this.store
     * @param  {Array}          loaded records
     * @param  {Array}          load options
     */
    onStoreLoad: function(store, records, options) {
        var appName = store.baseParams.applicationName;
        
        var card = new Tine.widgets.dialog.PreferencesPanel({
            prefStore: store,
            appName: appName,
            adminMode: this.adminMode
        });
        
        card.on('change', function(appName) {
            // mark card as changed in tree
        	var node = this.treePanel.getNodeById(appName);
        	node.setText(node.text + '*');
        }, this);
        
        // add to panel registry
        if (this.adminMode) {
            this.adminPrefPanels[appName] = card;
        } else {
        	this.prefPanels[appName] = card;
        }
        
        this.activateCard(card, false);
        this.loadMask.hide();
    },
    
    /**
     * activateCard in preferences panel
     * 
     * @param {Tine.widgets.dialog.PreferencesPanel} panel
     * @param {boolean} exists
     */
    activateCard: function(panel, exists) {
    	if (!exists) {
            this.prefsCardPanel.add(panel);
            this.prefsCardPanel.layout.container.add(panel);
    	}
        this.prefsCardPanel.layout.setActiveItem(panel.id);
        panel.doLayout();    	
    },
    
    /**
     * showPrefsForApp 
     * - check stores (create new store if not exists)
     * - activate pref panel for app
     * 
     * @param {String} appName
     */
    showPrefsForApp: function(appName) {
        
    	var panel = (this.adminMode) ? this.adminPrefPanels[appName] : this.prefPanels[appName];

    	if (!this.adminMode) {
    		// check grant for pref and enable/disable button
			this.action_switchAdminMode.setDisabled(!Tine.Tinebase.common.hasRight('admin', appName));
    	}
    	
        // check stores/panels
        if (!panel) {
            // add new card + store
            this.initPrefStore(appName);
        } else {
        	this.activateCard(panel, true);
        }
    }
});

/**
 * Timetracker Edit Popup
 */
Tine.widgets.dialog.Preferences.openWindow = function (config) {
    //var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 800,
        height: 470,
        name: 'Preferences',
        contentPanelConstructor: 'Tine.widgets.dialog.Preferences',
        contentPanelConstructorConfig: config
    });
    return window;
};

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/dialog/PreferencesTreePanel.js
/*
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 * @todo        create generic app tree panel?
 * @todo        add button: set default value(s)
 */

Ext.namespace('Tine.widgets');

Ext.namespace('Tine.widgets.dialog');

/**
 * preferences application tree panel
 * 
 */
Tine.widgets.dialog.PreferencesTreePanel = Ext.extend(Ext.tree.TreePanel, {

    // presets
    iconCls: 'x-new-application',
    rootVisible: true,
    border: false,
    autoScroll: true,
    
    /**
     * initComponent
     * 
     */
    initComponent: function(){
        
        Tine.widgets.dialog.PreferencesTreePanel.superclass.initComponent.call(this);
        
        this.initTreeNodes();
        this.initHandlers();
        this.selectRoot.defer(200, this);
    },

    /**
     * select root node
     */
    selectRoot: function() {
    	this.fireEvent('click', this.getRootNode());
    },
    
    /**
     * initTreeNodes with Tinebase and apps prefs
     * 
     * @private
     */
    initTreeNodes: function() {
    	
    	// general preferences are tree root
        var treeRoot = new Ext.tree.TreeNode({
            text: _('General Preferences'),
            id: 'Tinebase',
            draggable: false,
            allowDrop: false,
            expanded: true
        });
        this.setRootNode(treeRoot);
        
        // add all apps
        var allApps = Tine.Tinebase.appMgr.getAll();

        // console.log(allApps);
        allApps.each(function(app) {
            var node = new Ext.tree.TreeNode({
                text: app.getTitle(),
                cls: 'file',
                id: app.appName,
                leaf: null
            });
    
            treeRoot.appendChild(node);
        }, this);
    },
    
    /**
     * initTreeNodes with Tinebase and apps prefs
     * 
     * @private
     */
    initHandlers: function() {
        this.on('click', function(node){
            // note: if node is clicked, it is not selected!
            node.getOwnerTree().selectPath(node.getPath());
            node.expand();
            
            // get parent pref panel
            var parentPanel = this.findParentByType(Tine.widgets.dialog.Preferences);

            // add panel to card panel to show prefs for chosen app
            parentPanel.showPrefsForApp(node.id);
            
        }, this);
        
        this.on('beforeexpand', function(_panel) {
            if(_panel.getSelectionModel().getSelectedNode() === null) {
                _panel.expandPath('/Tinebase');
                _panel.selectPath('/Tinebase');
            }
            _panel.fireEvent('click', _panel.getSelectionModel().getSelectedNode());
        }, this);
    },

    /**
     * check grants for tree nodes / apps
     * 
     * @param {Bool} adminMode
     */
    checkGrants: function(adminMode) {
        var root = this.getRootNode();
                
        root.eachChild(function(node) {
            // enable or disable according to admin rights / admin mode
            if (!Tine.Tinebase.common.hasRight('admin', node.id) && adminMode) {
                node.disable();
            } else {
                node.enable();
            }
        });
    }
});

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/dialog/PreferencesPanel.js
/*
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 * TODO         add pref description to input fields
 * TODO         add icons from apps
 */

Ext.namespace('Tine.widgets');

Ext.namespace('Tine.widgets.dialog');

/**
 * preferences card panel
 * -> this panel is filled with the preferences subpanels containing the pref stores for the apps
 * 
 */
Tine.widgets.dialog.PreferencesCardPanel = Ext.extend(Ext.Panel, {
    
    //private
    layout: 'card',
    border: false,
    frame: true,
    labelAlign: 'top',
    autoScroll: true,
    defaults: {
        anchor: '100%'
    },
    
    initComponent: function() {
        this.title = _('Preferences');
        Tine.widgets.dialog.PreferencesCardPanel.superclass.initComponent.call(this);
    }
});

/**
 * preferences panel with the preference input fields for an application
 * 
 * @todo add checkbox type
 */
Tine.widgets.dialog.PreferencesPanel = Ext.extend(Ext.Panel, {
    
	/**
	 * the prefs store
	 * @cfg {Ext.data.Store}
	 */
	prefStore: null,
	
    /**
     * @cfg {String} appName
     */
    appName: 'Tinebase',

    /**
     * @cfg {Boolean} adminMode activated?
     */
    adminMode: false,
    
    //private
    layout: 'form',
    border: true,
    labelAlign: 'top',
    autoScroll: true,
    defaults: {
        anchor: '95%',
        labelSeparator: ''
    },
    bodyStyle: 'padding:5px',
    
    initComponent: function() {
    	
        this.addEvents(
            /**
             * @event change
             * @param appName
             * Fired when a value is changed
             */
            'change'
        );    	
    	
        if (this.prefStore && this.prefStore.getCount() > 0) {
            
            this.items = [];
            this.prefStore.each(function(pref) {
            	            	
        	    // check if options available -> use combobox or textfield
                var fieldDef = {
                    fieldLabel: pref.get('label'),
                    name: pref.get('name'),
                    value: pref.get('value'),
                    listeners: {
                    	scope: this,
                    	change: function(field, newValue, oldValue) {
                    		// fire change event
                    		this.fireEvent('change', this.appName);
                    	}
                    },
                    prefId: pref.id,
                    description: pref.get('description')
                };
                
                // evaluate xtype
                var xtype = (pref.get('options') && pref.get('options').length > 0) ? 'combo' : 'textfield';
                if (xtype == 'combo' && this.adminMode) {
                    xtype = 'lockCombo';
                } else if (xtype == 'textfield' && this.adminMode) {
                    xtype = 'lockTextfield';
                }
                fieldDef.xtype = xtype;
                
                if (pref.get('options') && pref.get('options').length > 0) {
                	// add additional combobox config
                	fieldDef.store = pref.get('options');
                	fieldDef.mode = 'local';
                    fieldDef.forceSelection = true;
                    fieldDef.triggerAction = 'all';
                }
                
                if (this.adminMode) {
                	// set lock (value forced => hiddenFieldData = '0')
                	fieldDef.hiddenFieldData = (pref.get('type') == 'default') ? '1' : '0';
                	fieldDef.hiddenFieldId = pref.get('name') + '_writable';
                	//console.log(pref);
                } else {
                	fieldDef.disabled = (pref.get('type') == 'forced');
                }
                
                //console.log(fieldDef);
                try {
                    var fieldObj = Ext.ComponentMgr.create(fieldDef);
                    this.items.push(fieldObj);

                    // ugh a bit ugly
                    // what does that do??
                    pref.fieldObj = fieldObj;
                } catch (e) {
                	//console.log(e);
                    console.error('Unable to create preference field "' + pref.get('name') + '". Check definition!');
                    this.prefStore.remove(pref);
                }
            }, this);

        } else {
            this.html = '<div class="x-grid-empty">' + _('There are no preferences for this application.') + "</div>";
        }
        
        Ext.QuickTips.init();

        Tine.widgets.dialog.PreferencesPanel.superclass.initComponent.call(this);
    },
    
    /**
     * afterRender -> adds qtips to all elements
     * 
     * @private
     * 
     * @todo add qtip to label as well
     */
    afterRender: function() {
        Tine.widgets.dialog.PreferencesPanel.superclass.afterRender.call(this);
        
        if (this.items && this.items.items) {
            for (var i=0; i < this.items.items.length; i++) {
            	var field = this.items.items[i];
                Ext.QuickTips.register({
                    target: field,
                    title: field.fieldLabel,
                    text: field.description,
                    width: 200
                });        	
            }
        }
    }
});

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/container/ContainerSelect.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */

Ext.namespace('Tine.widgets', 'Tine.widgets.container');

/**
 * @class Tine.widgets.container.selectionComboBox
 * @package Tinebase
 * @subpackage Widgets
 * @extends Ext.form.ComboBox
 * 
 * Container select ComboBox widget
 */
Tine.widgets.container.selectionComboBox = Ext.extend(Ext.form.ComboBox, {
    /**
     * @cfg {array}
     * default container
     */
    defaultContainer: false,
    /**
     * @cfg {Number} how many chars of the containername to display
     */
    displayLength: 25,
    /**
     * @property {Object} currently displayed container
     */
    container: null,
    /**
     * @cfg {Number} list width
     */    
    listWidth: 400,
    /**
     * @cfg {String}
     */
    //itemName: 'record',
    /**
     * @cfg {string} containerName
     * name of container (singular)
     */
    containerName: 'container',
    /**
     * @cfg {string} containerName
     * name of container (plural)
     */
    containersName: 'containers',
    /**
     * @cfg {Boolean} hideTrigger2
     */
    hideTrigger2: true,
    /**
     * @cfg {String} startNode
     */
    startNode: 'all',
    
    trigger2width: 100,
    
    // private
    allowBlank: false,
    triggerAction: 'all',
    forceAll: true,
    lazyInit: false,
    readOnly:true,
    stateful: true,
    
    mode: 'local',
    valueField: 'id',
    displayField: 'name',
    
    /**
     * @private
     */
    initComponent: function(){
        if (! this.hideTrigger2) {
            if (this.triggerClass == 'x-form-arrow-trigger') {
                this.triggerClass = 'x-form-arrow-trigger-rectangle';
            }
            
            this.triggerConfig = {
                tag:'span', cls:'x-form-twin-triggers', cn:[
                {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + this.triggerClass},
                {tag:'span', cls:'tw-containerselect-trigger2', cn:[
                    {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger tw-containerselect-trigger2-bg"},
                    {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger tw-containerselect-trigger2"},
                    {tag: "div", style: {position: 'absolute', top: 0, left: '5px'}}
                ]}
            ]};
            
        }
        
        // prepare for personalNode remote search (startNode personalOf)
        this.store = new Ext.data.JsonStore({
            id: 'id',
            fields: Tine.Tinebase.Model.Container,
            baseParams: {
                method: 'Tinebase_Container.getContainer',
                application: this.appName,
                containerType: Tine.Tinebase.container.TYPE_PERSONAL
            },
            listeners: {
                scope: this,
                beforeload: function(store, options) {
                    if (! this.owner) {
                        // if owner is not set, take the owner from the record we already have
                        options.params.owner = this.store.getAt(0).get('account_grants').account_id;
                    } else {
                        options.params.owner = this.owner
                    }
                }
            }
        });
        
        this.otherRecord = new Tine.Tinebase.Model.Container({id: 'other', name: String.format(_('choose other {0}...'), this.containerName)}, 'other');
        //this.title = String.format(_('Recently used {0}:'), this.containersName);
        
        Tine.widgets.container.selectionComboBox.superclass.initComponent.call(this);
        
        if (this.defaultContainer) {
            this.container = this.defaultContainer;
            this.value = this.defaultContainer.name;
        }
        
        this.on('beforequery', this.onBeforeQuery, this);
    },
    
    onBeforeQuery: function(queryEvent) {
        // for startNode 'all' we open recents locally
        queryEvent.query = new Date().getTime();
        this.mode = this.startNode == 'all' ? 'local' : 'remote';
    },
    
    initTrigger : function(){
        if (! this.hideTrigger2) {
            var t1 = this.trigger.first();
            var t2 = this.trigger.last();
            this.trigger2 = t2;
            
            t1.on("click", this.onTriggerClick, this, {preventDefault:true});
            t2.on("click", this.onTrigger2Click, this, {preventDefault:true});
            
            t1.addClassOnOver('x-form-trigger-over');
            t1.addClassOnClick('x-form-trigger-click');
            
            t2.addClassOnOver('x-form-trigger-over');
            t2.addClassOnClick('x-form-trigger-click');
            
            
        } else {
            Tine.widgets.container.selectionComboBox.superclass.initTrigger.call(this);
        }
    },
    
    setTrigger2Text: function(text) {
        var trigger2 = this.trigger.last().last().update(text);
    },
    
    setTrigger2Disabled: function(bool) {
        if (bool) {
            this.trigger2.setOpacity(0.5);
            this.trigger2.un("click", this.onTrigger2Click, this, {preventDefault:true});
        } else {
            this.trigger2.setOpacity(1);
            this.trigger2.on("click", this.onTrigger2Click, this, {preventDefault:true});
        }
    },
    
    getTrigger2: function() {
        return this.trigger2;
    },
    
    onTrigger2Click: Ext.emptyFn,
    
    // private: only blur if dialog is closed
    onBlur: function() {
        if (!this.dlg) {
            return Tine.widgets.container.selectionComboBox.superclass.onBlur.apply(this, arguments);
        }
    },
    
    onSelect: function(record, index) {
        if (record == this.otherRecord) {
            this.onChoseOther();
        } else {
            Tine.widgets.container.selectionComboBox.superclass.onSelect.apply(this, arguments);
        }
    },
    
    /**
     * @private
     */
    onChoseOther: function() {
        this.collapse();
        this.dlg = new Tine.widgets.container.selectionDialog({
            //itemName: this.itemName,
            containerName: this.containerName,
            containersName: this.containersName,
            TriggerField: this
        });
    },
    
    /**
     * @private
     */
    onRender2: function(ct, position) {
        Tine.widgets.container.selectionComboBox.superclass.onRender.call(this, ct, position);
        
        var cls = 'x-combo-list';
        this.footer = this.list.createChild({cls:cls+'-ft'});
        this.button = new Ext.Button({
            text: String.format(_('choose other {0}...'), this.containerName),
            scope: this,
            handler: this.onChoseOther,
            renderTo: this.footer
        });
        this.assetHeight += this.footer.getHeight();
        
        this.getEl().on('mouseover', function(e, el) {
            this.qtip = new Ext.QuickTip({
                target: el,
                targetXY : e.getXY(),
                html: Ext.util.Format.htmlEncode(this.container.name) + 
                    '<i> (' + (this.container.type == Tine.Tinebase.container.TYPE_PERSONAL ?  _('personal') : _('shared')) + ')</i>'
            }).show();
        }, this);
        
        //if (this.hideTrigger2) {
        //    this.triggers[1].hide();
        //}
    },
    
    /**
     * @private
     */
    getValue: function(){
        return this.container.id;
    },
    
    /**
     * @private
     */
    setValue: function(container){
        // element which is allready in this.store 
        if (typeof(container) == 'string') {
            container = this.store.getById(container).data;
        }
        
        // dynamically add current container to store if not exists
        if (! this.store.getById(container.id)) {
            // we don't push arround container records yet...
            this.store.add(new Tine.Tinebase.Model.Container(container, container.id));
        }
        
        this.container = container;
        
        // make sure 'choose other' is the last item
        var other = this.store.getById('other');
        if (other) {
            this.store.remove(other);
        }
        this.store.add(this.otherRecord);
        
        Tine.widgets.container.selectionComboBox.superclass.setValue.call(this, container.id);
        
        if (container.account_grants) {
            this.setDisabled(! container.account_grants.deleteGrant);
        }
        
        if(this.qtip) {
            this.qtip.remove();
        }
        
        // IE has problems with sate saving. Might be, that our clone function is not working correclty yet.
        if (! Ext.isIE) {
            this.saveState();
        }
    },
    
    /**
     * @private
     * Recents are a bit more than a simple state...
     */
    getState: function() {
        var recents = [];
        this.store.each(function(container) {
            if (container.get('type') != 'internal') {
                recents.push(container.data);
            }
        }, this);

        return recents;
    },
    
    /**
     * @private
     */
    applyState : function(state, config){
        for (var container in state) {
            if(state.hasOwnProperty(container)) {
                this.store.add(new Tine.Tinebase.Model.Container(state[container], state[container].id));
            }
        }
    }
    
    
});
Ext.reg('tinewidgetscontainerselectcombo', Tine.widgets.container.selectionComboBox);

/**
 * This widget shows a modal container selection dialog
 * @class Tine.widgets.container.selectionDialog
 * @extends Ext.Component
 * @package Tinebase
 * @subpackage Widgets
 */
Tine.widgets.container.selectionDialog = Ext.extend(Ext.Component, {
	/**
     * @cfg {String}
     */
    //itemName: 'record',
    /**
     * @cfg {string} containerName
     * name of container (singular)
     */
    containerName: 'container',
    /**
     * @cfg {string} containerName
     * name of container (plural)
     */
    containersName: 'containers',
    /**
	 * @cfg {string}
	 * title of dialog
	 */
    title: null,
    /**
     * @cfg {Number}
     */
    windowHeight: 400,
    /**
     * @property {Ext.Window}
     */
    win: null,
    /**
     * @property {Ext.tree.TreePanel}
     */
    tree: null,
    
    /**
     * @private
     */
    initComponent: function(){
        Tine.widgets.container.selectionDialog.superclass.initComponent.call(this);
        
        this.title = this.title ? this.title : String.format(_('please select a {0}'), this.containerName);
        
        this.cancleAction = new Ext.Action({
            text: _('Cancel'),
            iconCls: 'action_cancel',
            minWidth: 70,
            handler: this.onCancel,
            scope: this
        });
        
        this.okAction = new Ext.Action({
            disabled: true,
            text: _('Ok'),
            iconCls: 'action_saveAndClose',
            minWidth: 70,
            handler: this.onOk,
            scope: this
        });
        
        // adjust window height
		if (Ext.getBody().getHeight(true) * 0.7 < this.windowHeight) {
			this.windowHeight = Ext.getBody().getHeight(true) * 0.7;
		}

        this.win = new Ext.Window({
            title: this.title,
            closeAction: 'close',
            modal: true,
            width: 375,
            height: this.windowHeight,
            minWidth: 375,
            minHeight: this.windowHeight,
            layout: 'fit',
            plain: true,
            bodyStyle: 'padding:5px;',
            buttonAlign: 'right',
            
            buttons: [
                this.cancleAction,
                this.okAction
            ]
        });
        
        this.tree = new Tine.widgets.container.TreePanel({
            containerName: this.TriggerField.containerName,
            containersName: this.TriggerField.containersName,
            appName: this.TriggerField.appName,
            defaultContainer: this.TriggerField.defaultContainer
        });
        
        this.tree.on('click', this.onTreeNodeClick, this);
        this.tree.on('dblclick', this.onTreeNoceDblClick, this);
        
        this.win.add(this.tree);
        
        // disable onBlur for the moment:
        
        this.win.show();
    },
    
    /**
     * @private
     */
    onTreeNodeClick: function(node) {
        this.okAction.setDisabled(node.attributes.containerType != 'singleContainer');
        if (! node.leaf ) {//&& ! node.isExpanded() && node.isExpandable()) {
            node.expand();
        }
    },
    
    /**
     * @private
     */
    onTreeNoceDblClick: function(node) {
        if (! this.okAction.isDisabled()) {
            this.onOk();
        }
    },
    
    /**
     * @private
     */
    onCancel: function() {
        this.onClose();
    },
    
    /**
     * @private
     */
    onClose: function() {
        this.win.close();
    },
    
    /**
     * @private
     */
    onOk: function() {
        var  node = this.tree.getSelectionModel().getSelectedNode();
        if (node) {
            this.TriggerField.setValue(node.attributes.container);
            this.TriggerField.fireEvent('select', this.TriggerField, node.attributes.container);
            if (this.TriggerField.blurOnSelect) {
                this.TriggerField.fireEvent('blur', this.TriggerField);
            }
            this.onClose();
        }
    }
});

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/container/GrantsDialog.js
/**
 * Tine 2.0
 * 
 * @package     Tine
 * @subpackage  Widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 * 
 */

Ext.namespace('Tine.widgets', 'Tine.widgets.container');

/**
 * Container Grants dialog
 */
/**
 * @class Tine.widgets.container.GrantsDialog
 * @extends Tine.widgets.dialog.EditDialog
 * @constructor
 * @param {Object} config The configuration options.
 */
Tine.widgets.container.GrantsDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
    
    /**
     * @cfg {Tine.Tinebase.container.models.container}
     * Container to manage grants for
     */
    grantContainer: null,
    
    /**
     * @cfg {string}
     * Name of container folders, e.g. Addressbook
     */
    containerName: null,
    
    /**
     * @private {Ext.data.JsonStore}
     */
    grantsStore: null,
    
    /**
     * @private
     */
    windowNamePrefix: 'ContainerGrantsWindow_',
    loadRecord: false,
    tbarItems: [],
    evalGrants: false,
    
    /**
     * @private
     */
    initComponent: function() {
        this.containerName = this.containerName ? this.containerName : _('Folder');

        this.grantsStore =  new Ext.data.JsonStore({
            baseParams: {
                method: 'Tinebase_Container.getContainerGrants',
                containerId: this.grantContainer.id
            },
            root: 'results',
            totalProperty: 'totalcount',
            id: 'id',
            fields: Tine.Tinebase.Model.Grant
        });
        this.grantsStore.load();
        
        Tine.widgets.container.GrantsDialog.superclass.initComponent.call(this);
    },
    
    /**
     * init record to edit
     * 
     * - overwritten: we don't have a record here 
     */
    initRecord: function() {
    },
    
    /**
     * returns dialog
     */
    getFormItems: function() {
        
        var columns = [
            new Ext.ux.grid.CheckColumn({
                header: _('Read'),
                dataIndex: 'readGrant',
                width: 55
            }),
            new Ext.ux.grid.CheckColumn({
                header: _('Add'),
                dataIndex: 'addGrant',
                width: 55
            }),
            new Ext.ux.grid.CheckColumn({
                header: _('Edit'),
                dataIndex: 'editGrant',
                width: 55
            }),
            new Ext.ux.grid.CheckColumn({
                header: _('Delete'),
                dataIndex: 'deleteGrant',
                width: 55
            })
        ];
        
        if (this.grantContainer.type == 'shared') {
            columns.push(new Ext.ux.grid.CheckColumn({
                header: _('Admin'),
                dataIndex: 'adminGrant',
                width: 55
            }));
        }
        
        return {
            bodyStyle: 'padding:5px;',
            buttonAlign: 'right',
            labelAlign: 'top',
            border: false,
            layout: 'fit',
            items: new Tine.widgets.account.ConfigGrid({
                accountPickerType: 'both',
                accountListTitle: _('Permissions'),
                configStore: this.grantsStore,
                hasAccountPrefix: true,
                configColumns: columns
            })
        };
    },
    
    /**
     * @private
     */
    onApplyChanges: function(button, event, closeWindow) {
        Ext.MessageBox.wait(_('Please wait'), _('Updating Grants'));
        
        var grants = [];
        this.grantsStore.each(function(_record){
            grants.push(_record.data);
        });
        
        Ext.Ajax.request({
            params: {
                method: 'Tinebase_Container.setContainerGrants',
                containerId: this.grantContainer.id,
                grants: Ext.util.JSON.encode(grants)
            },
            scope: this,
            success: function(_result, _request){
                var grants = Ext.util.JSON.decode(_result.responseText);
                this.grantsStore.loadData(grants, false);
                
                Ext.MessageBox.hide();
                if (closeWindow) {
                    this.purgeListeners();
                    this.window.close();
                }
            }
        });
    }
});

/**
 * grants dialog popup / window
 */
Tine.widgets.container.GrantsDialog.openWindow = function (config) {
    var window = Tine.WindowFactory.getWindow({
        width: 700,
        height: 450,
        name: Tine.widgets.container.GrantsDialog.windowNamePrefix + Ext.id(),
        contentPanelConstructor: 'Tine.widgets.container.GrantsDialog',
        contentPanelConstructorConfig: config,
        modal: true
    });
    return window;
};

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/container/ContainerTree.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */

Ext.namespace('Tine.widgets', 'Tine.widgets.container');

 /**
  * @class       Tine.containerTreePanel
  * @package     Tine
  * @subpackage  Widgets
  * @extends     Ext.tree.TreePanel
  * @param       {Object} config Configuration options
  * @description
  * <p>Utility class for generating container trees as used in the 
  * apps tree panel</p>
  * <p>This widget handles all container related actions like add/rename/delte 
  * and manager permissions<p>
  * <p>Example usage:</p>
  * <pre><code>
  var taskPanel =  new Tine.containerTreePanel({
        iconCls: 'TasksTreePanel',
        title: 'Tasks',
        appName: 'Tasks',
        containerName: 'to do list',
        containersName: 'to do lists',
        border: false
    });
  </code></pre>
  */
Tine.widgets.container.TreePanel = function(config) {
    Ext.apply(this, config);
    
    if (this.app) {
        this.appName = this.app.appName;
        
        if (this.recordClass) {
            this.containerName = this.app.i18n.n_hidden(this.recordClass.getMeta('containerName'), this.recordClass.getMeta('containersName'), 1);
            this.containersName = this.app.i18n._hidden(this.recordClass.getMeta('containersName'));
        }
    }
    Tine.widgets.container.TreePanel.superclass.constructor.call(this);
};

Ext.extend(Tine.widgets.container.TreePanel, Ext.tree.TreePanel, {
 	/**
     * @cfg {string} appName name of application
     */
    appName: '',
	/**
     * @cfg {bool} allowMultiSelection
     */
    allowMultiSelection: false,
    /**
     * @cfg {string} containerName name of container (singular)
     */
	containerName: 'container',
    /**
     * @cfg {string} containerName name of container (plural)
     */
    containersName: 'containers',
    /**
     * @cfg {array} extraItems additional items to display under all
     */
    extraItems: null,
    /**
     * @cfg {Number} how many chars of the containername to display
     */
    displayLength: 23,
    
	// presets
	iconCls: 'x-new-application',
	rootVisible: false,
	border: false,
    autoScroll: true,
	
	// holds treenode which got a contextmenu
	ctxNode: null,
	
	// private
	initComponent: function(){
        var translation = new Locale.Gettext();
        translation.textdomain('Tinebase');
		
        if (this.allowMultiSelection && ! this.selModel) {
            this.selModel = new Ext.tree.MultiSelectionModel();
        }
        
        if (this.selModel) {
            this.allowMultiSelection = typeof this.selModel.getSelectedNodes == 'function';
        }
		
        Tine.widgets.container.TreePanel.superclass.initComponent.call(this);
		this.addEvents(
            /**
             * @event containeradded
             * Fires when a container was added
             * @param {container} the new container
             */
            'containeradd',
            /**
             * @event containerdelete
             * Fires when a container got deleted
             * @param {container} the deleted container
             */
            'containerdelete',
            /**
             * @event containerrename
             * Fires when a container got renamed
             * @param {container} the renamed container
             */
            'containerrename',
			/**
             * @event containerpermissionchange
             * Fires when a container got renamed
             * @param {container} the container whose permissions where changed
             */
            'containerpermissionchange'
		);
			
		var treeRoot = new Ext.tree.TreeNode({
	        text: 'root',
	        draggable:false,
	        allowDrop:false,
	        id:'root'
	    });
	    
	    var initialTree = [{
	        text: String.format(translation._('All {0}'), this.containersName),
	        cls: "treemain",
	        containerType: 'all',
	        id: 'all',
	        children: [{
	            text: String.format(translation._('My {0}'), this.containersName),
	            cls: 'file',
	            containerType: Tine.Tinebase.container.TYPE_PERSONAL,
	            id: 'user',
	            leaf: null,
	            owner: Tine.Tinebase.registry.get('currentAccount')
	        }, {
	            text: String.format(translation._('Shared {0}'), this.containersName),
	            cls: 'file',
	            containerType: Tine.Tinebase.container.TYPE_SHARED,
                id: 'shared',
	            children: null,
	            leaf: null,
				owner: null
	        }, {
	            text: String.format(translation._('Other Users {0}'), this.containersName),
	            cls: 'file',
	            containerType: 'otherUsers',
                id: 'otherUsers',
	            children: null,
	            leaf: null,
				owner: null
	        }]
	    }];
	    
        if(this.extraItems !== null) {
            Ext.each(this.extraItems, function(_item){
            	initialTree[0].children.push(_item);
            });
        }
	    
	    this.loader = new Tine.widgets.container.TreeLoader({
            appName: this.appName,
	        dataUrl:'index.php',
            displayLength: this.displayLength,
	        baseParams: {
	            jsonKey: Tine.Tinebase.registry.get('jsonKey'),
                requestType : 'JSON',
				method: 'Tinebase_Container.getContainer',
				application: this.appName,
				containerType: Tine.Tinebase.container.TYPE_PERSONAL
	        }
	    });
		
		this.loader.on("beforeload", function(loader, node) {
			loader.baseParams.containerType = node.attributes.containerType;
			loader.baseParams.owner = node.attributes.owner ? node.attributes.owner.accountId : null;
	    }, this);
        
		this.initContextMenu();
		
        this.on('beforeclick', function(node, e) {
            
            // select clicked node
            if (! node.isSelected()) {
                node.getOwnerTree().getSelectionModel().select(node, e, e.ctrlKey);
            } else if (this.allowMultiSelection && node.getOwnerTree().getSelectionModel().getSelectedNodes().length > 1) {
                if (e.ctrlKey) {
                    node.unselect();
                    this.fireEvent('click', node.getOwnerTree().getSelectionModel().getSelectedNodes()[0], e);
                    return false;
                } else {
                    node.select();
                }
            }
            
            // expand (folders) automatically on select
            node.expand();
            
            if ( this.allowMultiSelection) {
                // recursivly unselect child nodes
                this.unselectChildNodes(node);
                
                // recursivly unselect parent nodes
                while(node = node.parentNode) {
                    if (node.isSelected()) {
                        node.unselect();
                    }
                }
            }
        }, this);
        
	    this.on('contextmenu', function(node, event){
			this.ctxNode = node;
			var container = node.attributes.container;
			var owner     = node.attributes.owner;
			switch (node.attributes.containerType) {
				case 'singleContainer':
					if (container.account_grants.adminGrant) {
						//console.log('GRANT_ADMIN for this container');
						this.contextMenuSingleContainer.showAt(event.getXY());
					}
					break;
				case Tine.Tinebase.container.TYPE_PERSONAL:
				    if (owner.accountId == Tine.Tinebase.registry.get('currentAccount').accountId) {
						//console.log('owner clicked his own folder');
						this.contextMenuUserFolder.showAt(event.getXY());
					}
					break;
				case Tine.Tinebase.container.TYPE_SHARED:
				    if(Tine.Tinebase.common.hasRight('admin', this.appName) || Tine.Tinebase.common.hasRight('manage_shared_folders', this.appName)) {
				        this.contextMenuUserFolder.showAt(event.getXY());
				    }
					break;
			}
		}, this);
		
		this.setRootNode(treeRoot);
	   
	    for(var i=0; i<initialTree.length; i++) {
           treeRoot.appendChild( new Ext.tree.AsyncTreeNode(initialTree[i]) );
        }
	},
    
    unselectChildNodes: function(node) {
        if (node.isExpandable() && node.isExpanded()) {
            for (var i=0; i<node.childNodes.length; i++) {
                if (node.childNodes[i].isExpandable()) {
                    this.unselectChildNodes(node.childNodes[i]);
                }
                node.childNodes[i].unselect();
            }
        }
    },
    
    /**
     * returns a filter plugin to be used in a grid
     */
    getFilterPlugin: function() {
        if (!this.filterPlugin) {
            var scope = this;
            this.filterPlugin = new Tine.widgets.grid.FilterPlugin({
                
                /**
                 * gets value of this container filter
                 */
                getValue: function() {
                    var selection =  scope.allowMultiSelection ? scope.getSelectionModel().getSelectedNodes() : [scope.getSelectionModel().getSelectedNode()];
                    
                    var filters = [];
                    Ext.each(selection, function(node) {
                        filters.push(this.node2Filter(node));
                    }, this);
                    
                    return filters.length == 1 ? filters[0] : {condition: 'OR', filters: filters};
                    
                    /*
                    var nodeAttributes = scope.getSelectionModel().getSelectedNode().attributes || {};
                    return [
                        {field: 'containerType', operator: 'equals', value: nodeAttributes.containerType ? nodeAttributes.containerType : 'all' },
                        {field: 'container',     operator: 'equals', value: nodeAttributes.container ? nodeAttributes.container.id : null       },
                        {field: 'owner',         operator: 'equals', value: nodeAttributes.owner ? nodeAttributes.owner.accountId : null        }
                    ];
                    */
                },
                
                node2Filter: function(node) {
                    var filter = {field: 'container_id'};
                    
                    switch (node.attributes.containerType) {
                        case 'singleContainer':
                            filter.operator = 'equals';
                            filter.value = node.attributes.container.id;
                            break;
                        case 'personal':
                            filter.operator = 'personalNode';
                            filter.value = node.attributes.owner.accountId;
                            break;
                        default:
                            filter.operator = 'specialNode'
                            filter.value = node.attributes.containerType;
                            break;
                    }
                    
                    return filter;
                },
                
                /**
                 * sets the selected container (node) of this tree
                 * 
                 * @param {Array} all filters
                 */
                setValue: function(filters) {
                    for (var i=0; i<filters.length; i++) {
                        if (filters[i].field == 'container_id') {
                            switch (filters[i].operator) {
                                case 'equals':
                                    var parts = filters[i].value.path.replace(/^\//, '').split('/');
                                    var userId, containerId;
                                    switch (parts[0]) {
                                        case 'personal':
                                            userId = parts[1];
                                            containerId = parts[2];
                                            
                                            if (userId == Tine.Tinebase.registry.get('currentAccount').accountId) {
                                                scope.selectPath('/root/all/user/' + containerId);
                                            } else {
                                                scope.selectPath('/root/all/otherUsers/' + containerId);
                                            }
                                            break;
                                        case 'shared':
                                            containerId = parts[1];
                                            scope.selectPath('/root/all/shared/' + containerId);
                                            break;
                                        default:
                                            console.error('no such container type');
                                            break;
                                            
                                    }
                                    break;
                                case 'specialNode':
                                    switch (filters[i].value) {
                                        case 'all':
                                            scope.selectPath('/root/all');
                                            break;
                                        case 'shared':
                                        case 'otherUsers':
                                        case 'internal':
                                            scope.selectPath('/root/all' + filters[i].value);
                                            break;
                                        default:
                                            //throw new 
                                            console.error('no such container_id spechial node');
                                            break;
                                    }
                                    break;
                                case 'personalNode':
                                    if (filters[i].value == Tine.Tinebase.registry.get('currentAccount').accountId) {
                                        scope.selectPath('/root/all/user');
                                    } else {
                                        //scope.expandPath('/root/all/otherUsers');
                                        scope.selectPath('/root/all/otherUsers/' + filters[i].value);
                                    }
                                    break;
                                default:
                                    console.error('no such container_id filter operator');
                                    break;
                            }
                        }
                    }
                    //console.log(filters);
                }
            });
            
            this.on('click', function(node){
                this.filterPlugin.onFilterChange();
            }, this);
        }
        
        return this.filterPlugin;
    },
    
    /**
     * returns object of selected container or null
     */
    getSelectedContainer: function() {
        var container = null;
        
        var node = this.getSelectionModel().getSelectedNode();
        var containerType = node.attributes && node.attributes.containerType;
        if (containerType == 'singleContainer' && node.attributes.container) {
            container = node.attributes.container;
        }
        
        return container;
    },
    
	// private
	afterRender: function() {
		Tine.widgets.container.TreePanel.superclass.afterRender.call(this);
		//console.log(this);
		this.expandPath('/root/all');
		this.selectPath('/root/all');
	},
    
	// private
	initContextMenu: function() {
        
        this.contextMenuUserFolder = Tine.widgets.tree.ContextMenu.getMenu({
            nodeName: this.containerName,
            actions: ['add'],
            scope: this,
            backend: 'Tinebase_Container',
            backendModel: 'Container'
        });
	    
	    this.contextMenuSingleContainer= Tine.widgets.tree.ContextMenu.getMenu({
            nodeName: this.containerName,
	    	actions: ['delete', 'rename', 'grants'],
            scope: this,
            backend: 'Tinebase_Container',
            backendModel: 'Container'
	    });
	}
});

/**
 * Helper class for {Tine.widgets.container.TreePanel}
 * 
 * @extends {Ext.tree.TreeLoader}
 * @param {Object} attr
 */
Tine.widgets.container.TreeLoader = Ext.extend(Ext.tree.TreeLoader, {
    /**
     * @cfg {Number} how many chars of the containername to display
     */
    displayLength: 25,
    
	/**
     * @private
     */
 	createNode: function(attr) {
		// map attributes from Tinebase_Container to attrs from library/ExtJS
		if (attr.name) {
            if (!attr.account_grants.account_id){
                // temporary workaround, for a Zend_Json::encode problem
                attr.account_grants = Ext.util.JSON.decode(attr.account_grants);
            }
            attr = {
                containerType: 'singleContainer',
                container: attr,
                text: attr.name,
                id: attr.id,
                cls: 'file',
                leaf: true
            };
        } else if (attr.accountDisplayName) {
            attr = {
                containerType: Tine.Tinebase.container.TYPE_PERSONAL,
                text: attr.accountDisplayName,
                id: attr.accountId,
                cls: 'folder',
                leaf: false,
                owner: attr
            };
        }
                
        attr.qtip = Ext.util.Format.htmlEncode(attr.text);
        attr.text = Ext.util.Format.htmlEncode(Ext.util.Format.ellipsis(attr.text, this.displayLength));
        
        // cruide calendar hack (one day before beta release ;-) )
        if (this.appName == 'Calendar') {
            attr.listeners = {
                append: function(tree, node, appendedNode, index) {
                    if (appendedNode.attributes.containerType == 'singleContainer') {
                        var container = appendedNode.attributes.container;
                        // dynamically initialize colorMgr if needed
                        if (! Tine.Calendar.colorMgr) {
                            Tine.Calendar.colorMgr = new Tine.Calendar.ColorManager({});
                        }
                        var colorSet = Tine.Calendar.colorMgr.getColor(container);
                        appendedNode.ui.render = appendedNode.ui.render.createSequence(function() {
                            //Ext.DomHelper.insertAfter(this.iconNode, {tag: 'span', html: '&nbsp;&bull;&nbsp', style: {color: colorSet.color}})
                            Ext.DomHelper.insertAfter(this.iconNode, {tag: 'span', html: '&nbsp;&#9673;&nbsp', style: {color: colorSet.color}})
                            //Ext.DomHelper.insertAfter(this.iconNode, {tag: 'span', html: '&nbsp;&#x2b24;&nbsp', style: {color: colorSet.color}})
                        }, appendedNode.ui);
                    }
                }
            }
        }
        
		// apply baseAttrs, nice idea Corey!
        if(this.baseAttrs){
            Ext.applyIf(attr, this.baseAttrs);
        }
        if(this.applyLoader !== false){
            attr.loader = this;
        }
        if(typeof attr.uiProvider == 'string'){
           attr.uiProvider = this.uiProviders[attr.uiProvider] || eval(attr.uiProvider);
        }
        return(attr.leaf ?
                        new Ext.tree.TreeNode(attr) :
                        new Ext.tree.AsyncTreeNode(attr));
    }
 });

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/customfields/CustomfieldsPanel.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.ns('Tine.widgets', 'Tine.widgets.customfields');

/**
 * Customfields panel
 */
Tine.widgets.customfields.CustomfieldsPanel = Ext.extend(Ext.Panel, {
    
    /**
     * @cfg {Tine.Tinebase.data.Record} recordClass
     * the recordClass this customfields panel is for
     */
    recordClass: null,
    
    //private
    layout: 'form',
    border: true,
    frame: true,
    labelAlign: 'top',
    autoScroll: true,
    defaults: {
        anchor: '100%',
        labelSeparator: ''
    },
    
    initComponent: function() {
        this.title = _('Custom Fields');
        
        var cfStore = this.getCustomFieldDefinition();
        if (cfStore) {
            this.items = [];
            cfStore.each(function(def) {
                var fieldDef = {
                    fieldLabel: def.get('label'),
                    name: 'customfield_' + def.get('name'),
                    xtype: def.get('type')
                };
                
                try {
                    var fieldObj = Ext.ComponentMgr.create(fieldDef);
                    this.items.push(fieldObj);
                    
                    // ugh a bit ugly
                    def.fieldObj = fieldObj;
                } catch (e) {
                    console.error('unable to create custom field "' + def.get('name') + '". Check definition!');
                    cfStore.remove(def);
                }
                
            }, this);
            
            this.formField = new Tine.widgets.customfields.CustomfieldsPanelFormField({
                cfStore: cfStore
            });
            
            this.items.push(this.formField);
            
        } else {
            this.html = '<div class="x-grid-empty">' + _('There are no custom fields yet') + "</div>";
        }
        
        Tine.widgets.customfields.CustomfieldsPanel.superclass.initComponent.call(this);
        
        // added support for defered rendering as a quick hack: it would be better to 
        // let cfpanel be a plugin of editDialog
        this.on('render', function() {
            // fill data from record into form wich is not done due to defered rendering
            this.setAllCfValues(this.quickHack.record.get('customfields'));
        }, this);
        
    },
    
    getCustomFieldDefinition: function() {
        var appName = this.recordClass.getMeta('appName');
        var modelName = this.recordClass.getMeta('modelName');
        if (Tine[appName].registry.containsKey('customfields')) {
            var allCfs = Tine[appName].registry.get('customfields');
            var cfStore = new Ext.data.JsonStore({
                fields: Tine.Tinebase.Model.Customfield,
                data: allCfs
            });
            
            cfStore.filter('model', appName + '_Model_' + modelName);
            
            if (cfStore.getCount() > 0) {
                return cfStore;
            }
        }
    },
    
    setAllCfValues: function(customfields) {
        // check if all cfs are already rendered
        var allRendered = false;
        this.items.each(function(item) {
            allRendered |= item.rendered;
        }, this);
        
        if (! allRendered) {
            this.setAllCfValues.defer(100, this, [customfields]);
        } else {
            this.formField.setValue(customfields);
        }
    }
});

/**
 * @private Helper class to have customfields processing in the standard form/record cycle
 */
Tine.widgets.customfields.CustomfieldsPanelFormField = Ext.extend(Ext.form.Field, {
    /**
     * @cfg {Ext.data.store} cfObject
     * Custom field Objects
     */
    cfStore: null,
    
    name: 'customfields',
    hidden: true,
    labelSeparator: '',
    /**
     * @private
     *
    initComponent: function() {
        Tine.widgets.customfields.CustomfieldsPanelFormField.superclass.initComponent.call(this);
        //this.hide();
    },*/
    
    /**
     * returns cf data of the current record
     */
    getValue: function() {
        var values = new Tine.widgets.customfields.Cftransport();
        this.cfStore.each(function(def) {
            values[def.get('name')] = def.fieldObj.getValue();
        }, this);
        
        return values;
    },
    
    /**
     * sets cfs from data
     */
    setValue: function(values){
        if (values) {
            this.cfStore.each(function(def) {
                def.fieldObj.setValue(values[def.get('name')]);
            });
        }
    }

});

/**
 * helper class to workaround String Casts in record class
 * 
 * @class Tine.widgets.customfields.Cftransport
 * @extends Object
 */
Tine.widgets.customfields.Cftransport = Ext.extend(Object , {
    toString: function() {
        return Ext.util.JSON.encode(this);
    }
});

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/customfields/CustomfieldsCombo.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.ns('Tine.widgets', 'Tine.widgets.customfields');

/**
 * Customfields panel
 */
Tine.widgets.customfields.CustomfieldsCombo = Ext.extend(Ext.form.ComboBox, {
    
    typeAhead: false,
    forceSelection: true,
    mode: 'local',
    triggerAction: 'all',    
    
    
	initComponent: function() {
        
        Tine.widgets.customfields.CustomfieldsCombo.superclass.initComponent.call(this);

    },
    
    
   	stateEvents: ['select'],
 	getState: function() { return this.getValue(); },
	applyState: function(state) { this.setValue(state); }
});



// file: /var/www/tine20build/tine20/Tinebase/js/widgets/tree/Loader.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
Ext.namespace('Tine.widgets', 'Tine.widgets.tree');

/**
 * generic tree loader for tine trees
 * - calls json method with a filter to return children of a node
 * 
 * @class Tine.widgets.tree.Loader
 * @extends Ext.tree.TreeLoader
 */
Tine.widgets.tree.Loader = Ext.extend(Ext.tree.TreeLoader, {
    /**
     * @cfg {Number} how many chars of the containername to display
     */
    displayLength: 25,
    
    /**
     * @cfg {application}
     */
    app: null,
    
    /**
     * 
     * @cfg {String} method
     */
    method: null,
    
    /**
     * 
     * @cfg {Array} of filter objects for search method 
     */
    filter: null,

    // trick parent
    url: true,
    
    /**
     * request data
     * 
     * @param {} node
     * @param {} callback
     * @private
     */
    requestData: function(node, callback){
        if(this.fireEvent("beforeload", this, node, callback) !== false){
            
            this.transId = Ext.Ajax.request({
                params: {
                    method: this.method,
                    filter: Ext.util.JSON.encode(this.filter)
                },
                success: this.handleResponse,
                // TODO do we need this function any longer?
                failure: this.handleFailure,
                scope: this,
                argument: {callback: callback, node: node},
                exceptionHandler: this.onRequestFailed
            });
        } else {
            // if the load is cancelled, make sure we notify
            // the node that we are done
            if(typeof callback == "function"){
                callback();
            }
        }
    },
    
    /**
     * process response
     * 
     * @param {} response
     * @param {} node
     * @param {} callback
     */
    processResponse : function(response, node, callback){
        var data = Ext.util.JSON.decode(response.responseText);
        var o = data.results;
        
        try {
            node.beginUpdate();
            for(var i = 0, len = o.length; i < len; i++){
                var n = this.createNode(o[i]);
                if(n){
                    node.appendChild(n);
                }
            }
            node.endUpdate();
            if(typeof callback == "function"){
                callback(this, node);
            }
        }catch(e){
            this.handleFailure(response);
        }
    }    
 });

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/tree/ContextMenu.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
Ext.namespace('Tine.widgets', 'Tine.widgets.tree');

/**
 * returns generic tree context menu with
 * - create/add
 * - rename
 * - delete
 * - edit grants
 * 
 * ctxNode class var is required in calling class
 */
Tine.widgets.tree.ContextMenu = {
	
    /**
     * create new Ext.menu.Menu with actions
     * 
     * @param {} config has the node name, actions, etc.
     * @return {}
     */
	getMenu: function(config) {
        
        /***************** define action handlers *****************/
        var handler = {
            /**
             * create
             */
            addNode: function() {
                Ext.MessageBox.prompt(String.format(_('New {0}'), config.nodeName), String.format(_('Please enter the name of the new {0}:'), config.nodeName), function(_btn, _text) {
                    if( this.ctxNode && _btn == 'ok') {
                        if (! _text) {
                            Ext.Msg.alert(String.format(_('No {0} added'), config.nodeName), String.format(_('You have to supply a {0} name!'), config.nodeName));
                            return;
                        }
                        Ext.MessageBox.wait(_('Please wait'), String.format(_('Creating {0}...' ), config.nodeName));
                        var parentNode = this.ctxNode;
                        
                        var params = {
                            method: config.backend + '.add' + config.backendModel,
                            name: _text
                        };
                        
                        // TODO try to generalize this
                        if (config.backendModel == 'Container') {
                            params.application = this.appName;
                            params.containerType = parentNode.attributes.containerType;
                        } else if (config.backendModel == 'Folder') {
                            params.parent = parentNode.attributes.globalname;
                            params.accountId = parentNode.attributes.account_id;
                        }
                        
                        Ext.Ajax.request({
                            params: params,
                            scope: this,
                            success: function(_result, _request){
                                var nodeData = Ext.util.JSON.decode(_result.responseText);
                                var newNode = this.loader.createNode(nodeData);
                                parentNode.appendChild(newNode);
                                if (config.backendModel == 'Container') {
                                    this.fireEvent('containeradd', nodeData);
                                }
                                Ext.MessageBox.hide();
                            }
                        });
                        
                    }
                }, this);
            },
            
            /**
             * delete
             */
            deleteNode: function() {
                if (this.ctxNode) {
                    var node = this.ctxNode;
                    Ext.MessageBox.confirm(_('Confirm'), String.format(_('Do you really want to delete the {0} "{1}"?'), config.nodeName, node.text), function(_btn){
                        if ( _btn == 'yes') {
                            Ext.MessageBox.wait(_('Please wait'), String.format(_('Deleting {0} "{1}"' ), config.nodeName , node.text));
                            
                            var params = {
                                method: config.backend + '.delete' + config.backendModel
                            }
                            
                            if (config.backendModel == 'Container') {
                                params.containerId = node.attributes.container.id
                            } else if (config.backendModel == 'Folder') {
                                params.folder = node.attributes.globalname;
                                params.accountId = node.attributes.account_id;
                            } else {
                                // use default json api style
                                params.ids = [node.id];
                                params.method = params.method + 's';
                            }
                            
                            Ext.Ajax.request({
                                params: params,
                                scope: this,
                                success: function(_result, _request){
                                    if(node.isSelected()) {
                                        this.getSelectionModel().select(node.parentNode);
                                        this.fireEvent('click', node.parentNode, Ext.EventObject.setEvent());
                                    }
                                    node.remove();
                                    if (config.backendModel == 'Container') {
                                        this.fireEvent('containerdelete', node.attributes.container);
                                    }
                                    Ext.MessageBox.hide();
                                }
                            });
                        }
                    }, this);
                }
            },
            
            /**
             * rename
             */
            renameNode: function() {
                if (this.ctxNode) {
                    var node = this.ctxNode;
                    Ext.MessageBox.show({
                        title: 'Rename ' + config.nodeName,
                        msg: String.format(_('Please enter the new name of the {0}:'), config.nodeName),
                        buttons: Ext.MessageBox.OKCANCEL,
                        value: node.text,
                        fn: function(_btn, _text){
                            if (_btn == 'ok') {
                                if (! _text) {
                                    Ext.Msg.alert(String.format(_('Not renamed {0}'), config.nodeName), String.format(_('You have to supply a {0} name!'), config.nodeName));
                                    return;
                                }
                                Ext.MessageBox.wait(_('Please wait'), String.format(_('Updating {0} "{1}"'), config.nodeName, node.text));
                                
                                var params = {
                                    method: config.backend + '.rename' + config.backendModel,
                                    newName: _text
                                };
                                
                                // TODO try to generalize this
                                if (config.backendModel == 'Container') {
                                    params.containerId = node.attributes.container.id;
                                } else if (config.backendModel == 'Folder') {
                                    params.oldGlobalName = node.attributes.globalname;
                                    params.accountId = node.attributes.account_id;
                                }
                                
                                Ext.Ajax.request({
                                    params: params,
                                    scope: this,
                                    success: function(_result, _request){
                                        var container = Ext.util.JSON.decode(_result.responseText);
                                        node.setText(_text);
                                        if (config.backendModel == 'Container') {
                                            this.fireEvent('containerrename', container);
                                        }
                                        Ext.MessageBox.hide();
                                    }
                                });
                            }
                        },
                        scope: this,
                        prompt: true,
                        icon: Ext.MessageBox.QUESTION
                    });
                }
            },
            
            /**
             * manage permissions
             * 
             */
            managePermissions: function() {
                if (this.ctxNode) {
                    var node = this.ctxNode;
                    var window = Tine.widgets.container.GrantsDialog.openWindow({
                        title: String.format(_('Manage Permissions for {0} "{1}"'), config.nodeName, Ext.util.Format.htmlEncode(node.attributes.container.name)),
                        containerName: config.nodeName,
                        grantContainer: node.attributes.container
                    });
                }
            },
            
            /**
             * reload node
             */
            reloadNode: function() {
                if (this.ctxNode) {
                    var tree = this;
                    this.ctxNode.reload(function(node) {
                        node.expand();
                        node.select();
                        // update grid
                        tree.filterPlugin.onFilterChange();
                    });                    
                }
            }
        }
        
        /****************** create ITEMS array ****************/
        
        var items = [];
        for (var i=0; i < config.actions.length; i++) {
            switch(config.actions[i]) {
                case 'add':
                    items.push(new Ext.Action({
                        text: String.format(_('Add {0}'), config.nodeName),
                        iconCls: 'action_add',
                        handler: handler.addNode,
                        scope: config.scope
                    }));
                    break;
                case 'delete':
                    var i18n = new Locale.Gettext();
                    i18n.textdomain('Tinebase');
                    items.push(new Ext.Action({
                        text: String.format(i18n.n_('Delete {0}', 'Delete {0}', 1), config.nodeName),
                        iconCls: 'action_delete',
                        handler: handler.deleteNode,
                        scope: config.scope
                    }));
                    break;
                case 'rename':
                    items.push(new Ext.Action({
                        text: String.format(_('Rename {0}'), config.nodeName),
                        iconCls: 'action_rename',
                        handler: handler.renameNode,
                        scope: config.scope
                    }));
                    break;
                case 'grants':
                    items.push(new Ext.Action({
                        text: _('Manage permissions'),
                        iconCls: 'action_managePermissions',
                        handler: handler.managePermissions,
                        scope: config.scope
                    }));
                    break;
                case 'reload':
                    items.push(new Ext.Action({
                        text: String.format(_('Reload {0}'), config.nodeName),
                        iconCls: 'x-tbar-loading',
                        handler: handler.reloadNode,
                        scope: config.scope
                    }));
                    break;
                default:
                    // add custom actions
                    items.push(new Ext.Action(config.actions[i]));
            }
        }

        /******************* return menu **********************/
        
        return new Ext.menu.Menu({
		    items: items
		});
	}
};

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/grid/DetailsPanel.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Tine.widgets', 'Tine.widgets.grid');

/**
 * details panel
 * 
 * @class Tine.widgets.grid.DetailsPanel
 * @extends Ext.Panel
 */
Tine.widgets.grid.DetailsPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {Number}
     * default Heights
     */
    defaultHeight: 125,
    
    /**
     * @property {Tine.Tinebase.widgets.app.GridPanel}
     */
    grid: null,

    /**
     * @property {}
     */
    record: null,
    
    border: false,
    autoScroll: true,
    layout: 'fit',
    
    updateDetails: function(record, body) {
        this.tpl.overwrite(body, record.data);
    },
    
    showDefault: function(body) {
        if (this.defaultTpl) {
            this.defaultTpl.overwrite(body);
        }
    },
    
    showMulti: function(sm, body) {
        if (this.multiTpl) {
            this.multiTpl.overwrite(body);
        }
    },
    
    /**
     * 
     * @param grid
     */
    doBind: function(grid) {
        this.grid = grid;
        
        grid.getSelectionModel().on('selectionchange', function(sm) {
            this.onDetailsUpdate(sm);
        }, this);
        
        grid.store.on('load', function(store) {
            this.onDetailsUpdate(grid.getSelectionModel());
        }, this);
    },
    
    /**
     * 
     * @param sm selection model
     */
    onDetailsUpdate: function(sm) {
        var count = sm.getCount();
        if (count === 0 || sm.isFilterSelect) {
            this.showDefault(this.body);
            this.record = null;
        } else if (count === 1) {
            this.record = sm.getSelected();
            this.updateDetails(this.record, this.body);
        } else if (count > 1) {
            this.record = sm.getSelected();
        	this.showMulti(sm, this.body);
        }
    },
    
    getLoadMask: function() {
        if (! this.loadMask) {
            this.loadMask = new Ext.LoadMask(this.el);
        }
        
        return this.loadMask;
    }
    
});
// file: /var/www/tine20build/tine20/Tinebase/js/widgets/grid/FilterModel.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */

Ext.namespace('Tine.widgets', 'Tine.widgets.grid');

/**
 * Model of filter
 * 
 * @constructor
 */
Tine.widgets.grid.FilterModel = function(config) {
    Ext.apply(this, config);
    Tine.widgets.grid.FilterModel.superclass.constructor.call(this);
    
    this.addEvents(
      /**
       * @event filtertrigger
       * is fired when user request to update list by filter
       * @param {Tine.widgets.grid.FilterToolbar}
       */
      'filtertrigger'
    );
    
};

Ext.extend(Tine.widgets.grid.FilterModel, Ext.Component, {
    /**
     * @cfg {String} label for the filter
     */
    label: '',
    
    /**
     * @cfg {String} name of th field to filter
     */
    field: '',
    
    /**
     * @cfg {string} type of value
     */
    valueType: 'string',
    
    /**
     * @cfg {string} default value
     */
    defaultValue: null,
    
    /**
     * @cfg {Array} valid operators
     */
    operators: null,
    
    /**
     * @cfg {String} name of the default operator
     */
    defaultOperator: null,
    
    /**
     * @private
     */
    initComponent: function() {
        Tine.widgets.grid.FilterModel.superclass.initComponent.call(this);
        this.isFilterModel = true;
        
        if (! this.operators) {
            this.operators = [];
        }
        
        
        if (this.defaultOperator === null) {
            switch (this.valueType) {
                
                case 'date':
                    this.defaultOperator = 'within';
                    break;
                case 'account':
                case 'group':
                case 'user':
                case 'bool':
                case 'number':
                case 'percentage':
                    this.defaultOperator = 'equals';
                    break;
                case 'string':
                default:
                    this.defaultOperator = 'contains';
                    break;
            }
        }
        
        if (this.defaultValue === null) {
            switch (this.valueType) {
                case 'string':
                    this.defaultValue = '';
                    break;
                case 'bool':
                    this.defaultValue = '1';
                    break;
                case 'percentage':
                    this.defaultValue = '0';
                    break;
                case 'date':
                case 'account':
                case 'group':
                case 'user':
                case 'number':
                default:
                    break;
            }
        }
    },
    
    /**
     * operator renderer
     * 
     * @param {Ext.data.Record} filter line
     * @param {Ext.Element} element to render to 
     */
    operatorRenderer: function (filter, el) {
        var operatorStore = new Ext.data.JsonStore({
            fields: ['operator', 'label'],
            data: [
                {operator: 'contains',   label: _('contains')},
                {operator: 'equals',     label: _('is equal to')},
                {operator: 'greater',    label: _('is greater than')},
                {operator: 'less',       label: _('is less than')},
                {operator: 'not',        label: _('is not')},
                {operator: 'in',         label: _('is in')},
                {operator: 'before',     label: _('is before')},
                {operator: 'after',      label: _('is after')},
                {operator: 'within',     label: _('is within')},
                {operator: 'startswith', label: _('starts with')},
                {operator: 'endswith',   label: _('ends with')}
            ]
        });

        // filter operators
        if (this.operators.length == 0) {
            switch (this.valueType) {
                case 'string':
                    this.operators.push('contains', 'equals', 'startswith', 'endswith', 'not');
                    break;
                case 'date':
                    this.operators.push('equals', 'before', 'after', 'within');
                    break;
                case 'number':
                case 'percentage':
                    this.operators.push('equals', 'greater', 'less');
                    break;
                default:
                    this.operators.push(this.defaultOperator);
                    break;
            }
        }
        
        if (this.operators.length > 0) {
            operatorStore.each(function(operator) {
                if (this.operators.indexOf(operator.get('operator')) < 0 ) {
                    operatorStore.remove(operator);
                }
            }, this);
        }
        
        if (operatorStore.getCount() > 1) {
            var operator = new Ext.form.ComboBox({
                filter: filter,
                width: 80,
                id: 'tw-ftb-frow-operatorcombo-' + filter.id,
                mode: 'local',
                lazyInit: false,
                emptyText: _('select a operator'),
                forceSelection: true,
                typeAhead: true,
                triggerAction: 'all',
                store: operatorStore,
                displayField: 'label',
                valueField: 'operator',
                value: filter.get('operator') ? filter.get('operator') : this.defaultOperator,
                renderTo: el
            });
            operator.on('select', function(combo, newRecord, newKey) {
                if (combo.value != combo.filter.get('operator')) {
                    this.onOperatorChange(combo.filter, combo.value);
                }
            }, this);
        } else {
            var operator = new Ext.form.Label({
                filter: filter,
                width: 100,
                style: {margin: '0px 10px'},
                getValue: function() { return operatorStore.getAt(0).get('operator'); },
                text : operatorStore.getAt(0).get('label'),
                //hideLabel: true,
                //readOnly: true,
                renderTo: el
            });
        }
        
        return operator;
    },
    
    /**
     * called on operator change of a filter row
     * @private
     */
    onOperatorChange: function(filter, newOperator) {
        filter.set('operator', newOperator);
        filter.set('value', '');
        
        // for date filters we need to rerender the value section
        if (this.valueType == 'date') {
            var valueType = newOperator == 'within' ? 'withinCombo' : 'datePicker';
            
            if (valueType == 'withinCombo') {
                filter.datePicker.hide();
                filter.withinCombo.show();
                filter.formFields.value = filter.withinCombo;
            } else {
                filter.withinCombo.hide();
                filter.datePicker.show();
                filter.formFields.value = filter.datePicker;
            }
        }
        //console.log('operator change');
    },
    
    /**
     * value renderer
     * 
     * @param {Ext.data.Record} filter line
     * @param {Ext.Element} element to render to 
     */
    valueRenderer: function(filter, el) {
        var value;
        
        switch (this.valueType) {
            case 'date':
                value = this.dateValueRenderer(filter, el);
                break;
            case 'percentage':
                value = new Ext.ux.PercentCombo({
                    filter: filter,
                    width: 200,
                    id: 'tw-ftb-frow-valuefield-' + filter.id,
                    value: filter.data.value ? filter.data.value : this.defaultValue,
                    renderTo: el
                });
                break;
            case 'user':
                value = new Tine.widgets.AccountpickerField({
                    filter: filter,
                    width: 200,
                    id: 'tw-ftb-frow-valuefield-' + filter.id,
                    value: filter.data.value ? filter.data.value : this.defaultValue,
                    renderTo: el
                });
                break;
            case 'bool':
                value = new Ext.form.ComboBox({
                    filter: filter,
                    width: 200,
                    id: 'tw-ftb-frow-valuefield-' + filter.id,
                    value: filter.data.value ? filter.data.value : this.defaultValue,
                    renderTo: el,
                    mode: 'local',
                    forceSelection: true,
                    triggerAction: 'all',
                    store: [
                        [0, Locale.getTranslationData('Question', 'no').replace(/:.*/, '')], 
                        [1, Locale.getTranslationData('Question', 'yes').replace(/:.*/, '')]
                    ]
                });
                break;
            case 'string':
            case 'number':
            default:
                // @todo: we need a Ext.ux.form.ClearableTextField
                //        which in contrast to a TriggerField displays
                //        the trigger in the area of the field and not with
                //        extra space right of it!
                value = new Ext.form.TextField({
                    //hideTrigger: true,
                    //triggerClass: 'x-form-clear-trigger',
                    filter: filter,
                    width: 200,
                    id: 'tw-ftb-frow-valuefield-' + filter.id,
                    value: filter.data.value ? filter.data.value : this.defaultValue,
                    renderTo: el,
                    listeners: {
                        scope: this,
                        specialkey: function(field, e){
                            if(e.getKey() == e.ENTER){
                                //field.trigger.setVisible(field.getValue().length > 0);
                                this.onFiltertrigger();
                            }
                        }/*,
                        change: function() {
                            //console.log('change');
                        }*/
                    }/*,
                    onTriggerClick: function() {
                        value.setValue(null);
                        //value.trigger.hide();
                        this.fireEvent('change');
                    }*/
                });
                /*
                value.on('specialkey', function(field, e){
                     if(e.getKey() == e.ENTER){
                         this.onFiltertrigger();
                     }
                }, this);
                */
                break;
        }
        
        return value;
    },
    
    /**
     * called on value change of a filter row
     * @private
     */
    onValueChange: function(filter, newValue) {
        filter.set('value', newValue);
        //console.log('value change');
    },
    
    /**
     * render a date value
     * 
     * we place a picker and a combo in the dom element and hide the one we don't need yet
     */
    dateValueRenderer: function(filter, el) {
        var operator = filter.get('operator') ? filter.get('operator') : this.defaultOperator;
        var valueType = operator == 'within' ? 'withinCombo' : 'datePicker';
        
        var pastOps = [
            ['dayThis',         _('today')], 
            ['dayLast',         _('yesterday')], 
            ['weekThis',        _('this week')], 
            ['weekLast',        _('last week')],
            ['weekBeforeLast',  _('the week before last')],
            ['monthThis',       _('this month')],
            ['monthLast',       _('last month')],
            ['quarterThis',     _('this quarter')],
            ['quarterLast',     _('last quarter')],
            ['yearThis',        _('this year')],
            ['yearLast',        _('last year')]
        ];
        
        var futureOps = [
            ['dayNext',         _('tomorrow')], 
            ['weekNext',        _('next week')], 
            ['monthNext',       _('next month')],
            ['quarterNext',     _('next quarter')],
            ['yearNext',        _('next year')]
        ];
        
        var comboOps = this.pastOnly ? pastOps : futureOps.concat(pastOps);
        var comboValue = 'weekThis';
        if (filter.data.value && filter.data.value.toString().match(/^[a-zA-Z]+$/)) {
            comboValue = filter.data.value.toString();
        } else if (this.defaultValue && this.defaultValue.toString().match(/^[a-zA-Z]+$/)) {
            comboValue = this.defaultValue.toString();
        }
        
        filter.withinCombo = new Ext.form.ComboBox({
            hidden: valueType != 'withinCombo',
            filter: filter,
            width: 200,
            value: comboValue,
            renderTo: el,
            mode: 'local',
            lazyInit: false,
            forceSelection: true,
            typeAhead: true,
            triggerAction: 'all',
            store: comboOps
        });

        var pickerValue = '';
        if (Ext.isDate(filter.data.value)) {
            pickerValue = filter.data.value;
        } else if (Ext.isDate(Date.parseDate(filter.data.value, Date.patterns.ISO8601Long))) {
            pickerValue = Date.parseDate(filter.data.value, Date.patterns.ISO8601Long);
        } else if (Ext.isDate(this.defaultValue)) {
            pickerValue = this.defaultValue;
        }
        
        filter.datePicker = new Ext.form.DateField({
            hidden: valueType != 'datePicker',
            filter: filter,
            width: 200,
            value: pickerValue,
            renderTo: el
        });
        
        // upps, how to get a var i only know the name of???
        return filter[valueType];
    },
    
    /**
     * @private
     */
    onFiltertrigger: function() {
        this.fireEvent('filtertrigger', this);
    }
});

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/grid/FilterPlugin.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Tine.widgets', 'Tine.widgets.grid');

/**
 * @class Tine.widgets.grid.FilterPlugin
 * @extends Ext.util.Observable
 * <p>Base class for all grid filter plugins.</p>
 * @constructor
 */
Tine.widgets.grid.FilterPlugin = function(config) {
    config = config || {};
    Ext.apply(this, config);
    
    this.addEvents(
        /**
         * @event change
         * Fired when the filter changed.
         * @param {Tine.widgets.grid.FilterPlugin} this
         */
        'change'
    );
    
    Tine.widgets.grid.FilterPlugin.superclass.constructor.call(this);
};

Ext.extend(Tine.widgets.grid.FilterPlugin, Ext.util.Observable, {
    
    /**
     * @property {Ext.data.Store} store
     */
    store: null,
    
    /**
     * @property {String} xtype
     */
    xtype: 'filterplugin',
    
    /**
     * main method which must return the filter object of this filter
     * 
     * @return {Object}
     */
    getValue: Ext.emptyFn,
    
    /**
     * main method which must set the filter from given data
     * 
     * @param {Array} all filters
     */
    setValue: Ext.emptyFn,
    
    /**
     * plugin method of Ext.grid.GridPanel
     * 
     * @oaran {Ext.grid.GridPanel} grid
     */
    init: function(grid) {
        this.store = grid.store;
        this.doBind();
    },
    
    /**
     * binds this plugin to the grid store
     */
    doBind: function() {
        this.store.on('beforeload', this.onBeforeLoad, this);
        this.store.on('load', this.onLoad, this);
    },
    
    /**
     * fires our change event
     */
    onFilterChange: function() {
        if (this.store) {
            this.store.load({});
        }
        
        this.fireEvent('change', this);
    },
    
    /**
     * called before store loads
     */
    onBeforeLoad: function(store, options) {
        options = options || {};
        options.params = options.params || {};
        var filter = options.params.filter ? options.params.filter : [];
        
        var value = this.getValue();
        if (value && Ext.isArray(filter)) {
            value = Ext.isArray(value) ? value : [value];
            for (var i=0; i<value.length; i++) {
                filter.push(value[i]);
            }
        }
    },
    
    /**
     * called after store data loaded
     */
    onLoad: function(store, options) {
        if (Ext.isArray(store.proxy.jsonReader.jsonData.filter)) {
            
            // filter plugin has to 'pick' its records
            this.setValue(store.proxy.jsonReader.jsonData.filter);
        }
    }
});

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/grid/FilterButton.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Tine.widgets', 'Tine.widgets.grid');

/**
 * @class Tine.widgets.grid.FilterButton
 * @extends Ext.Button
 * <p>Toggle Button to be used as filter</p>
 * @constructor
 */
Tine.widgets.grid.FilterButton = function(config) {
    config = config || {};
    Ext.apply(this, config);
    
    Tine.widgets.grid.FilterButton.superclass.constructor.call(this);
    Ext.applyIf(this, new Tine.widgets.grid.FilterPlugin());
};

Ext.extend(Tine.widgets.grid.FilterButton, Ext.Button, {
    /**
     * @cfg {String} field the filed to filter
     */
    field: null,
    /**
     * @cfg {String} operator operator of filter (defualts 'equals')
     */
    operator: 'equals',
    /**
     * @cfg {Bool} invert true if loging should be inverted (defaults false)
     */
    invert: false,
    
    /**
     * @private only toggle actions make sense as filters!
     */
    enableToggle: true,
    
    /**
     * @private
     */
    getValue: function() {
        return {field: this.field, operator: this.operator, value: this.invert ? !this.pressed : this.pressed};
    },
    
    /**
     * @private
     */
    setValue: function(filters) {
        for (var i=0; i<filters.length; i++) {
            if (filters[i].field == this.field) {
                this.toggle(this.invert ? !filters[i].value : !!filters[i].value);
                break;
            }
        }
    },
    
    /**
     * @private
     */
    handler: function() {
        this.onFilterChange();
    }
});
// file: /var/www/tine20build/tine20/Tinebase/js/widgets/grid/ExportButton.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 * TODO use Ext.ux.file.Download
 */
 
Ext.namespace('Tine.widgets', 'Tine.widgets.grid');

/**
 * @class Tine.widgets.grid.ExportButton
 * @extends Ext.Button
 * <p>export button</p>
 * @constructor
 */
Tine.widgets.grid.ExportButton = function(config) {
    config = config || {};
    Ext.apply(this, config);
    
    Tine.widgets.grid.ExportButton.superclass.constructor.call(this);
};

Ext.extend(Tine.widgets.grid.ExportButton, Ext.Action, {	
    /**
     * @cfg {String} icon class
     */
    iconCls: 'action_export',
    /**
     * @cfg {String} format of export (default: csv)
     */
    format: 'csv',
    /**
     * @cfg {String} export function (for example: Timetracker.exportTimesheets)
     */
    exportFunction: null,
    /**
     * @cfg {Tine.Tinebase.widgets.grid.FilterSelectionModel} sm
     */
    sm: null,
    /**
     * @cfg {Tine.Tinebase.widgets.app.GridPanel} gridPanel
     * use this alternativly to sm
     */
    gridPanel: null,
    
    /**
     * do export
     */
    doExport: function() {
        // get selection model
        if (!this.sm) {
            this.sm = this.gridPanel.grid.getSelectionModel();
        }
        
        // return if no rows are selected
        if (this.sm.getCount() == 0) {
            return false;
        }
        
    	var filterSettings = this.sm.getSelectionFilter();
    	
        var form = Ext.getBody().createChild({
            tag:'form',
            method:'post',
            cls:'x-hidden'
        });
        
        Ext.Ajax.request({
            isUpload: true,
            form: form,
            // @todo replace icon with loading icon ...
            /*
            beforerequest: function() {
            	// replace icon
            	this.iconCls: 
            },
            */
            params: {
                method: this.exportFunction,
                requestType: 'HTTP',
                _filter: Ext.util.JSON.encode(filterSettings),
                _format: this.format
            },
            success: function() {
                form.remove();
            },
            failure: function() {
                form.remove();
            }
        });
    },
    
    /**
     * @private
     * 
     * @todo add on click handler -> call export function with grid selected ids
     */
    handler: function() { 	
        this.doExport();
    }
});


// file: /var/www/tine20build/tine20/Tinebase/js/widgets/grid/FilterToolbar.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
Ext.namespace('Tine.widgets', 'Tine.widgets.grid');

/**
 * @class Tine.widgets.grid.FilterToolbar
 * @extends Ext.Panel
 * 
 * <br>Usage:<br>
     <pre><code>
     tb = new Tine.widgets.grid.FilterToolbar({
         filterModels: [
            {name: 'Full Name', field: 'n_fn', defaultOperator: 'contains'},
            {name: 'Container', field: 'container_id', operatorRenderer: function() {...}, valueRenderer: function() {...}},
            {name: 'Contact', field: 'quicksearch'}
         ],
         defaultFilter: 'quicksearch',
         filters: [
            {field: 'n_fn', operator: 'contains', value: 'Smith'},
            {field: 'container_id', operator: 'equals', value: 4}
        ]
     });
    </code></pre>
 * @constructor
 * @param {Object} config
 */
Tine.widgets.grid.FilterToolbar = function(config) {
    Ext.apply(this, config);
    Tine.widgets.grid.FilterToolbar.superclass.constructor.call(this);
    
    // become filterPlugin
    Ext.applyIf(this, new Tine.widgets.grid.FilterPlugin());
    
};

Ext.extend(Tine.widgets.grid.FilterToolbar, Ext.Panel, {
    
    /**
     * @cfg {Array} array of filter models (possible filters in this toolbar)
     */
    filterModels: null,
    
    /**
     * @cfg {String} fieldname of default filter
     */
    defaultFilter: null,
    
    /**
     * @cfg {Bool} allowSaving (defaults to false)
     */
    allowSaving: false,
    
    border: false,
    monitorResize: true,
    region: 'north',
    
    record: Ext.data.Record.create([
        {name: 'field'},
        {name: 'operator'},
        {name: 'value'}
    ]),
    
    frowIdPrefix: 'tw-ftb-frowid-',
    
    /**
     * @private
     */
    initTemplates : function() {
        var ts = this.templates || {};
        if(!ts.master) {
            ts.master = new Ext.Template(
                '<div class="tw-filtertoolbar x-toolbar x-small-editor" hidefocus="true">',
                    '<table style="width: auto;" border="0" cellpadding="0" cellspacing="0">',
                         '{tbody}', 
                     '</table>',
                '</div>'
            );
        }
        if(!ts.filterrow){
            ts.filterrow = new Ext.Template(
                '<tr id="{id}" class="fw-ftb-frow">',
                    '<td class="tw-ftb-frow-pbutton"></td>',
                    '<td class="tw-ftb-frow-mbutton"></td>',
                    '<td class="tw-ftb-frow-prefix">{prefix}</td>',
                    '<td class="tw-ftb-frow-field">{field}</td>',
                    '<td class="tw-ftb-frow-operator" width="90px" >{operator}</td>',
                    '<td class="tw-ftb-frow-value">{value}</td>',
                    '<td class="tw-ftb-frow-searchbutton"></td>',
                    //'<td class="tw-ftb-frow-deleteallfilters"></td>',
                    //'<td class="tw-ftb-frow-savefilterbutton"></td>',
                '</tr>'
            );
        }
        
        for(var k in ts){
            var t = ts[k];
            if(t && typeof t.compile == 'function' && !t.compiled){
                t.disableFormats = true;
                t.compile();
            }
        }

        this.templates = ts;
    },
    
    /**
     * @private
     */
    initActions: function() {
        this.actions = {
            addFilterRow: new Ext.Button({
                //disabled: true,
                tooltip: _('add new filter'),
                iconCls: 'action_addFilter',
                scope: this,
                handler: this.addFilter
            }),
            removeAllFilters: new Ext.Button({
                tooltip: _('reset all filters'),
                iconCls: 'action_delAllFilter',
                scope: this,
                handler: this.deleteAllFilters
            }),
            startSearch: new Ext.Button({
                text: _('start search'),
                iconCls: 'action_startFilter',
                scope: this,
                handler: function() {
                    this.onFiltertrigger();
                }
            }),
            saveFilter: new Ext.Button({
                tooltip: _('save filter'),
                iconCls: 'action_saveFilter',
                scope: this,
                handler: this.onSaveFilter
            })
        };
    },
    
    /**
     * @private
     */
    onRender: function(ct, position) {
        Tine.widgets.grid.FilterToolbar.superclass.onRender.call(this, ct, position);
        
        // only get app and enable saving if this.store is available (that is not the case in the activities panel)
        // at this point the plugins are initialised
        if (! this.app && this.store) {
            this.app = Tine.Tinebase.appMgr.get(this.store.proxy.recordClass.getMeta('appName'));
        }
        
        // automaticly enable saving
        if (this.app && this.app.getMainScreen().filterPanel) {
            this.allowSaving = true;
        }
        
        // render static table
        this.renderTable();
        
        // render each filter row into table
        this.filterStore.each(function(filter) {
            this.renderFilterRow(filter);
        }, this);
        
        // render static action buttons
        for (action in this.actions) {
            this.actions[action].hidden = true;
            this.actions[action].render(this.el);
        }
        
        // wrap search button an set it always mouse-overed
        this.searchButtonWrap = this.actions.startSearch.getEl().wrap();
        this.searchButtonWrap.addClass('x-btn-over');
        
        // arrange static action buttons
        this.onFilterRowsChange();
    },
    
    /**
     * renders static table
     * @private
     */
    renderTable: function() {
        var ts = this.templates;
        var tbody = '';
        
        this.filterStore.each(function(filter){
            tbody += ts.filterrow.apply({
                id: this.frowIdPrefix + filter.id
            });
        }, this);
        
        this.tableEl = ts.master.overwrite(this.bwrap, {tbody: tbody}, true);
    },
    
    /**
     * renders the filter specific stuff of a single filter row
     * 
     * @param {Ext.data.Record} el representing a filter tr tag
     * @private
     */
    renderFilterRow: function(filter) {
        filter.formFields = {};
        var filterModel = this.getFilterModel(filter.get('field'));

        var fRow = this.el.child('tr[id='+ this.frowIdPrefix + filter.id + ']');
        
        // field
        filter.formFields.field = new Ext.form.ComboBox({
            filter: filter,
            width: 240,
            id: 'tw-ftb-frow-fieldcombo-' + filter.id,
            mode: 'local',
            lazyInit: false,
            emptyText: _('select a field'),
            forceSelection: true,
            typeAhead: true,
            triggerAction: 'all',
            store: this.fieldStore,
            displayField: 'label',
            valueField: 'field',
            value: filterModel.field,
            renderTo: fRow.child('td[class=tw-ftb-frow-field]'),
            validator: this.validateFilter.createDelegate(this)
        });
        filter.formFields.field.on('select', function(combo, newRecord, newKey) {
            if (combo.value != combo.filter.get('field')) {
                this.onFieldChange(combo.filter, combo.value);
            }
        }, this);
        
        // operator
        filter.formFields.operator = filterModel.operatorRenderer(filter, fRow.child('td[class=tw-ftb-frow-operator]'));
        
        // value
        filter.formFields.value = filterModel.valueRenderer(filter, fRow.child('td[class=tw-ftb-frow-value]'));
        
        filter.deleteRowButton = new Ext.Button({
            id: 'tw-ftb-frow-deletebutton-' + filter.id,
            tooltip: _('Delete this filter'),
            filter: filter,
            iconCls: 'action_delThisFilter',
            renderTo: fRow.child('td[class=tw-ftb-frow-mbutton]'),
            scope: this,
            handler: function(button) {
                this.deleteFilter(button.filter);
            }
        });
    },
    
    /**
     * validate if type ahead is in our filter store
     * @return {Bool}
     */
    validateFilter: function(value) {
        return this.fieldStore.query('label', value).getCount() != 0;
    },
    
    /**
     * @private
     */
    arrangeButtons: function() {
        var numFilters = this.filterStore.getCount();
        var firstId = this.filterStore.getAt(0).id;
        var lastId = this.filterStore.getAt(numFilters-1).id;
        
        this.filterStore.each(function(filter){
            var tr = this.el.child('tr[id='+ this.frowIdPrefix + filter.id + ']');
            
            // prefix
            tr.child('td[class=tw-ftb-frow-prefix]').dom.innerHTML = _('and');
            //filter.deleteRowButton.setVisible(filter.id != lastId);
                
            if (filter.id == lastId) {
                // move add filter button
                tr.child('td[class=tw-ftb-frow-pbutton]').insertFirst(this.actions.addFilterRow.getEl());
                this.actions.addFilterRow.show();
                // move start search button
                tr.child('td[class=tw-ftb-frow-searchbutton]').insertFirst(this.searchButtonWrap);
                this.actions.startSearch.show();
                // move delete all filters
                // tr.child('td[class=tw-ftb-frow-deleteallfilters]').insertFirst(this.actions.removeAllFilters.getEl());
                this.actions.removeAllFilters.setVisible(numFilters > 1);
                // move save filter button
                // tr.child('td[class=tw-ftb-frow-savefilterbutton]').insertFirst(this.actions.saveFilter.getEl());
                this.actions.saveFilter.setVisible(this.allowSaving && numFilters > 1);
            }
            
            if (filter.id == firstId) {
                tr.child('td[class=tw-ftb-frow-prefix]').dom.innerHTML = _('Show');
                
                // hack for the save/delete all btns which are now in the first row
                if (Ext.isSafari) {
                    this.actions.removeAllFilters.getEl().applyStyles('float: left');
                } else {
                    this.actions.saveFilter.getEl().applyStyles('display: inline');
                    this.actions.removeAllFilters.getEl().applyStyles('display: inline');
                }
                
                tr.child('td[class=tw-ftb-frow-searchbutton]').insertFirst(this.actions.saveFilter.getEl());
                tr.child('td[class=tw-ftb-frow-searchbutton]').insertFirst(this.actions.removeAllFilters.getEl());
                
                //tr.child('td[class=tw-ftb-frow-pmbutton]').insertFirst(this.actions.removeAllFilters.getEl());
                //this.actions.removeAllFilters.setVisible(numFilters > 1);
            }
        }, this);
    },
    
    /**
     * called  when a filter action is to be triggered (start new search)
     * @private
     */
    onFiltertrigger: function() {
        if (! this.supressEvents) {
            this.onFilterChange();            
        }
    },
    
    /**
     * called on field change of a filter row
     * @private
     */
    onFieldChange: function(filter, newField) {
        filter.set('field', newField);
        filter.set('operator', '');
        filter.set('value', '');
        
        filter.formFields.operator.destroy();
        filter.formFields.value.destroy();
        
        var filterModel = this.getFilterModel(filter.get('field'));
        var fRow = this.el.child('tr[id='+ this.frowIdPrefix + filter.id + ']');
        
        var opEl = fRow.child('td[class=tw-ftb-frow-operator]');
        var valEl = fRow.child('td[class=tw-ftb-frow-value]');
        
        filter.formFields.operator = filterModel.operatorRenderer(filter, opEl);
        filter.formFields.value = filterModel.valueRenderer(filter, valEl);
    },
    
    /**
     * @private
     */
    initComponent: function() {
        Tine.widgets.grid.FilterToolbar.superclass.initComponent.call(this);
        
        this.initTemplates();
        this.initActions();
        
        // init filters
        if (this.filters.length < 1) {
            this.filters = [{field: this.defaultFilter}];
        }
        this.filterStore = new Ext.data.JsonStore({
            fields: this.record,
            data: this.filters
        });

        // init filter models
        this.filterModelMap = {};
        for (var i=0; i<this.filterModels.length; i++) {
            var fm = this.filterModels[i];
            if (! fm.isFilterModel) {
                var modelConfig = fm;
                fm = new Tine.widgets.grid.FilterModel(modelConfig);
            }
            // store reference in internal map
            this.filterModelMap[fm.field] = fm;
            
            // register trigger events
            fm.on('filtertrigger', this.onFiltertrigger, this);
        }
        
        // init filter selection
        this.fieldStore = new Ext.data.JsonStore({
            fields: ['field', 'label'],
            data: this.filterModels
        });
    },
    
    /**
     * called when a filter row gets added/deleted
     * @private
     */
    onFilterRowsChange: function() {
        this.arrangeButtons();
        if (! this.supressEvents) {
            var size = this.tableEl.getSize();
            
            //this.setSize(size.width, size.height);
            //this.syncSize();
            this.fireEvent('bodyresize', this, size.width, size.height);
        }
    },
    
    /**
     * returns filterModel
     * 
     * @param {String} fieldName
     * @return {Tine.widgets.grid.FilterModel}
     */
    getFilterModel: function(fieldName) {
        return this.filterModelMap[fieldName];   
    },
    
    /**
     * adds a new filer row
     */
    addFilter: function(filter) {
        if (! filter || arguments[1]) {
            filter = new this.record({
                field: this.defaultFilter
            });
        }
        this.filterStore.add(filter);
        
        var fRow = this.templates.filterrow.insertAfter(this.el.child('tr[class=fw-ftb-frow]:last'),{
            id: 'tw-ftb-frowid-' + filter.id
        }, true);
        
        this.renderFilterRow(filter);
        this.onFilterRowsChange();

        return filter;
    },
    
    /**
     * resets a filter
     * @param {Ext.Record} filter to reset
     */
    resetFilter: function(filter) {
        
    },
    
    /**
     * deletes a filter
     * @param {Ext.Record} filter to delete
     */
    deleteFilter: function(filter) {
        var fRow = this.el.child('tr[id=tw-ftb-frowid-' + filter.id + ']');
        //var isLast = this.filterStore.getAt(this.filterStore.getCount()-1).id == filter.id;
        var isLast = this.filterStore.getCount() == 1;
        this.filterStore.remove(this.filterStore.getById(filter.id));
        
        if (isLast) {
            // add a new first row
            var firstFilter = this.addFilter();
            
            // save buttons somewhere
        	for (action in this.actions) {
	            this.actions[action].hide();
	            this.el.insertFirst(action == 'startSearch' ? this.searchButtonWrap : this.actions[action].getEl());
	        }
        }
        fRow.remove();
        
        if (!this.supressEvents) {
            this.onFilterRowsChange();
            this.onFiltertrigger();
        }
    },
    
    /**
     * deletes all filters
     */
    deleteAllFilters: function() {
        this.supressEvents = true;
        
        this.filterStore.each(function(filter) {
            this.deleteFilter(filter);
        },this);
        
        this.supressEvents = false;
        this.onFiltertrigger();
        this.onFilterRowsChange();
    },
    
    /**
     * @todo generalise TA quick hack ;-)
     */
    getValue: function() {
        var filters = [];
        var ta_filters = [];
        this.filterStore.each(function(filter) {
            var line = {};
            for (formfield in filter.formFields) {
                line[formfield] = filter.formFields[formfield].getValue();
            }
            if (line.field.match(/^timeaccount_/)) {
                line.field = line.field.replace(/^timeaccount_/, '');
                ta_filters.push(line);
            } else {
                filters.push(line);
            }
        }, this);
        if (ta_filters.length > 0) {
            filters.push({field: 'timeaccount_id', operator: 'AND', value: ta_filters});
        }
        return filters;
    },
    
    setValue: function(filters) {
        this.supressEvents = true;
        
        var oldFilterCount = this.filterStore.getCount();
        var skipFilter = [];
        
        var filterData, filter, existingFilterPos, existingFilter;
        
        /**** foreign timeaccount_id hack ****/
        for (var i=0; i<filters.length; i++) {
            filterData = filters[i];
            
            if (filterData.field.match(/^timeaccount_/)) {
                filters.remove(filters[i]);
                
                var taFilters = filterData.value;
                for (var j=taFilters.length -1; j>=0; j--) {
                    taFilters[j].field = 'timeaccount_' + taFilters[j].field;
                    filters.splice(i, 0, taFilters[j]);
                }

                break;
            }
        }
        /**** end of foreign timeaccount_id hack ****/
        
        for (var i=0; i<filters.length; i++) {
            filterData = filters[i];
            
            if (this.filterModelMap[filterData.field]) {
                filter = new this.record(filterData);
                
                // check if this filter is already in our store
                existingFilterPos = this.filterStore.find('field', filterData.field);
                existingFilter = existingFilterPos >= 0 ? this.filterStore.getAt(existingFilterPos) : null;
                
                // we can't detect resolved records, sorry ;-(
                if (existingFilter && existingFilter.formFields.operator.getValue() == filter.get('operator') && existingFilter.formFields.value.getValue() == filter.get('value')) {
                    skipFilter.push(existingFilterPos);
                } else {
                    this.addFilter(filter);
                }
            }
        }
        
        for (var i=oldFilterCount-1; i>=0; i--) {
            if (skipFilter.indexOf(i) < 0) {
                this.deleteFilter(this.filterStore.getAt(i));
            }
        }
        
        this.supressEvents = false;
        this.onFilterRowsChange();
        
    },
    
    onSaveFilter: function() {
        var name = '';
        Ext.MessageBox.prompt(_('save filter'), _('Please enter a name for the filter'), function(btn, value) {
            if (btn == 'ok') {
                if (! value) {
                    Ext.Msg.alert(_('Filter not Saved'), _('You have to supply a name for the filter!'));
                    return;
                } else if (value.length > 40) {
                    Ext.Msg.alert(_('Filter not Saved'), _('You have to supply a shorter name! Names of saved filters can only be up to 40 characters long.'));
                    return;
                }
                Ext.Msg.wait(_('Please Wait'), _('Saving filter'));
                
                var model = this.store.reader.recordType.getMeta('appName') + '_Model_' + this.store.reader.recordType.getMeta('modelName');
                
                Ext.Ajax.request({
                    params: {
                        method: 'Tinebase_PersistentFilter.save',
                        filterData: Ext.util.JSON.encode(this.getAllFilterData()),
                        name: value,
                        model: model
                    },
                    scope: this,
                    success: function(result) {
                        if (typeof this.app.getMainScreen().getTreePanel().getPersistentFilterNode == 'function') {
                            var persistentFilterNode = this.app.getMainScreen().getTreePanel().getPersistentFilterNode();
                            
                            if (persistentFilterNode && persistentFilterNode.isExpanded()) {
                                var filter = Ext.util.JSON.decode(result.responseText);
                                
                                if (! persistentFilterNode.findChild('id', filter.id)) {
                                    var newNode = persistentFilterNode.getOwnerTree().loader.createNode(filter);
                                    persistentFilterNode.appendChild(newNode);
                                }
                                
                            }
                        }
                        Ext.Msg.hide();
                    }
                });
            }
        }, this, false, name);
    },
    
    /**
     * gets filter data of all filter plugins
     * 
     * NOTE: As we can't find all filter plugins directly we need a litte hack 
     *       to get their data
     *       
     *       We register ourselve as latest beforeload.
     *       In the options.filter we have the filters then.
     */
    getAllFilterData: function() {
        this.store.on('beforeload', this.storeOnBeforeload, this);
        this.store.load();
        this.store.un('beforeload', this.storeOnBeforeload, this);
        
        return this.allFilterData;
    },
    
    storeOnBeforeload: function(store, options) {
        this.allFilterData = options.params.filter;
        this.store.fireEvent('loadexception');
        return false;
    }
    
});

Ext.reg('tinewidgetsfiltertoolbar', Tine.widgets.grid.FilterToolbar);
// file: /var/www/tine20build/tine20/Tinebase/js/widgets/grid/FilterSelectionModel.js
/*
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Tine.Tinebase.widgets.grid');

/**
 * a row selection model capable to return filters
 * @constructor
 * @class Tine.Tinebase.widgets.grid.FilterSelectionModel
 * @extends Ext.grid.RowSelectionModel
 */
Tine.Tinebase.widgets.grid.FilterSelectionModel = Ext.extend(Ext.grid.RowSelectionModel, {
    /**
     * @cfg {Ext.data.Store}
     */
    store: null,
    
    /**
     * @property {Bool}
     */
    isFilterSelect: false,
    
    /**
     * Returns filterData representing current selection
     * 
     * @return {Array} filterData
     */
    getSelectionFilter: function() {
        if(! this.isFilterSelect) {
            return this.getFilterOfRowSelection();
        } else {
            /* cruide hack lets save it as comment, maybe we need it some time ;-)
            var opts = {}
            for (var i=0; i<this.store.events.beforeload.listeners.length; i++) {
                if (this.store.events.beforeload.listeners[i].scope.xtype == 'filterplugin') {
                    this.store.events.beforeload.listeners[i].fireFn.call(this.store.events.beforeload.listeners[i].scope, this.store, opts);
                }
            }
            //console.log(opts.params.filter);
            return opts.params.filter;
            */
            var filterData = this.getAllFilterData();
            return filterData;
        }
    },
    
    /**
     * gets filter data of all filter plugins
     * 
     * NOTE: As we can't find all filter plugins directly we need a litte hack 
     *       to get their data
     *       
     *       We register ourselve as latest beforeload.
     *       In the options.filter we have the filters then.
     */
    getAllFilterData: function() {
        this.store.on('beforeload', this.storeOnBeforeload, this);
        this.store.load();
        this.store.un('beforeload', this.storeOnBeforeload, this);
        
        return this.allFilterData;
    },
    
    storeOnBeforeload: function(store, options) {
        this.allFilterData = options.params.filter;
        this.store.fireEvent('loadexception');
        return false;
    },
    
    /**
     * selects all rows 
     * @param {Bool} onlyPage select only rows from current page
     * @return {Void}
     */
    selectAll: function(onlyPage) {
        this.isFilterSelect = !onlyPage;
        
        Tine.Tinebase.widgets.grid.FilterSelectionModel.superclass.selectAll.call(this);
    },
    
    /**
     * @private
     */
    onRefresh : function(){
        this.clearSelections(true);
        Tine.Tinebase.widgets.grid.FilterSelectionModel.superclass.onRefresh.call(this);
    },
    
    /**
     * @private
     */
    onRemove : function(v, index, r){
        this.clearSelections(true);
        Tine.Tinebase.widgets.grid.FilterSelectionModel.superclass.onRemove.call(this, v, index, r);
    },
    
    /**
     * Deselects a row.
     * @param {Number} row The index of the row to deselect
     */
    deselectRow : function(index, preventViewNotify) {
        this.isFilterSelect = false;
        Tine.Tinebase.widgets.grid.FilterSelectionModel.superclass.deselectRow.call(this, index, preventViewNotify);
    },
    
    /**
     * Clears all selections.
     */
    clearSelections: function(silent) {
        this.suspendEvents();
        this.isFilterSelect = false;
        
        Tine.Tinebase.widgets.grid.FilterSelectionModel.superclass.clearSelections.call(this);
        
        this.resumeEvents();
        if (! silent) {
            this.fireEvent('selectionchange', this);
        }
    },
    
    /**
     * toggle selection
     */
    toggleSelection: function() {
        if (this.isFilterSelect) {
            this.clearSelections();
        } else {
            this.suspendEvents();
            
            var index;
            this.store.each(function(record) {
                index = this.store.indexOf(record);
                if (this.isSelected(index)) {
                    this.deselectRow(index);
                } else {
                    this.selectRow(index, true);
                }
            }, this);
            
            this.resumeEvents();
            this.fireEvent('selectionchange', this);
        }
    },
    
    /**
     * Returns number of selected rows
     * 
     * @return {Number}
     */
    getCount: function() {
        if(! this.isFilterSelect) {
            return Tine.Tinebase.widgets.grid.FilterSelectionModel.superclass.getCount.call(this);
        } else {
            return this.store.getTotalCount();
        }
    },
   
    /**
     * converts a 'normal' row selection into a filter
     * 
     * @private
     * @return {Array} filterData
     */
    getFilterOfRowSelection: function() {
        //var idProperty = this.store.fields.getMeta('idProperty');
        var idProperty = this.store.reader.meta.id;
        var ids = [];
        this.each(function(record) {
            ids.push(record.id);
        });
        return [{field: idProperty, operator: 'in', value: ids}];
    }
});
// file: /var/www/tine20build/tine20/Tinebase/js/widgets/grid/PersistentFilterPicker.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
Ext.namespace('Tine.widgets', 'Tine.widgets.grid');

Tine.widgets.grid.PersistentFilterPicker = Ext.extend(Ext.tree.TreePanel, {
    
    /**
     * @cfg {application}
     */
    app: null,
    /**
     * @cfg {String} filterMountId
     * mount point of persitant filter folder
     */
    filterMountId: '/',
    
    /**
     * @private
     */
    autoScroll: true,
    border: false,
    rootVisible: false,

    /**
     * returns persistent filter tree node
     * 
     * @return {Ext.tree.AsyncTreeNode}
     */
    getPersistentFilterNode: function() {
        return this.filterNode;
    },
    
    /**
     * @private
     */
    initComponent: function() {
        this.loader = new Tine.widgets.grid.PersistentFilterLoader({
            app: this.app,
            filter: this.filter
        });
        
        if (! this.root) {
            this.root = new Ext.tree.TreeNode({
                id: '/',
                leaf: false,
                expanded: true
            });
        }
        
        Tine.widgets.grid.PersistentFilterPicker.superclass.initComponent.call(this);
        
        this.on('click', function(node) {
            if (node.attributes.isPersistentFilter) {
                node.select();
                this.onFilterSelect();
            } else if (node.id == '_persistentFilters') {
                node.expand();
                return false;
            }
        }, this);
        
        this.on('contextmenu', this.onContextMenu, this);
    },
    
    /**
     * @private
     */
    afterRender: function() {
        Tine.widgets.grid.PersistentFilterPicker.superclass.afterRender.call(this);
        
        this.filterNode = new Ext.tree.AsyncTreeNode({
            text: _('My saved filters'),
            id: '_persistentFilters',
            leaf: false,
            expanded: false
        });
        
        this.getNodeById(this.filterMountId).appendChild(this.filterNode);
    },
    
    /**
     * load grid from saved filter
     * 
     * NOTE: As all filter plugins add their data on the stores beforeload event
     *       we need a litte hack to only present a filterid.
     *       
     *       When a filter is selected, we register ourselve as latest beforeload,
     *       remove all filter data and paste our filter id. To ensure we are
     *       always the last listener, we directly remove the listener afterwards
     */
    onFilterSelect: function() {
        var store = this.app.getMainScreen().getContentPanel().store;
        store.on('beforeload', this.storeOnBeforeload, this);
        store.load();
        
        if (typeof this.app.getMainScreen().getTreePanel().activate == 'function') {
            this.app.getMainScreen().getTreePanel().activate(0);
        }
    },
    
    storeOnBeforeload: function(store, options) {
        options.params.filter = this.getSelectionModel().getSelectedNode().id;
        store.un('beforeload', this.storeOnBeforeload, this);
    },
    
    onContextMenu: function(node, e) {
        if (! node.attributes.isPersistentFilter) {
            return;
        }
        
        var menu = new Ext.menu.Menu({
            items: [{
                text: _('Delete Filter'),
                iconCls: 'action_delete',
                scope: this,
                handler: function() {
                    Ext.MessageBox.confirm(_('Confirm'), String.format(_('Do you really want to delete the Filter "{0}"?'), node.text), function(_btn){
                        if ( _btn == 'yes') {
                            Ext.MessageBox.wait(_('Please wait'), String.format(_('Deleting Filter "{0}"' ), this.containerName , node.text));
                            
                            Ext.Ajax.request({
                                params: {
                                    method: 'Tinebase_PersistentFilter.delete',
                                    filterId: node.id
                                },
                                scope: this,
                                success: function(){
                                    node.unselect();
                                    node.remove();
                                    Ext.MessageBox.hide();
                                }
                            });
                        }
                    }, this);
                }
            }]
        });
        menu.showAt(e.getXY());
    }
    
});

Tine.widgets.grid.PersistentFilterLoader = Ext.extend(Tine.widgets.tree.Loader, {

	method: 'Tinebase_PersistentFilter.search',
	
	/**
     * @private
     * 
     * @todo generalize this?
     */
    createNode: function(attr) {
        var isPersistentFilter = !!attr.model && !!attr.filters,
        node = isPersistentFilter ? {
            isPersistentFilter: isPersistentFilter,
            text: attr.name,
            id: attr.id,
            leaf: attr.leaf === false ? attr.leaf : true,
            filter: attr
        } : attr;
        return Tine.widgets.grid.PersistentFilterLoader.superclass.createNode.call(this, node);
    }
 });

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/tags/TagsPanel.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Tine.widgets', 'Tine.widgets.tags');

/**
 * Class for a single tag panel
 */
Tine.widgets.tags.TagPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String} app Application which uses this panel
     */
    app: '',
    /**
     * @cfg {String} recordId Id of record this panel is displayed for
     */
    recordId: '',
    /**
     * @cfg {Array} tags Initial tags
     */
    tags: [],
    /**
     * @var {Ext.data.JsonStore}
     * Holds tags of the record this panel is displayed for
     */
    recordTagsStore: null,
    /**
     * @var {Ext.data.JsonStore} Store for available tags
     */
    availableTagsStore: false,
    /**
     * @var {Ext.form.ComboBox} live search field to search tags to add
     */
    searchField: null,
    
    iconCls: 'action_tag',
    layout: 'fit',
    bodyStyle: 'padding: 2px 2px 2px 2px',
    collapsible: true,
    border: false,
    
    /**
     * @private
     */
    initComponent: function(){
        this.title =  _('Tags');
        // init recordTagsStore
        this.tags = [];
        this.recordTagsStore = new Ext.data.JsonStore({
            id: 'id',
            fields: Tine.Tinebase.Model.Tag,
            data: this.tags
        });
        
        // init availableTagsStore
        this.availableTagsStore = new Ext.data.JsonStore({
            id: 'id',
            root: 'results',
            totalProperty: 'totalCount',
            fields: Tine.Tinebase.Model.Tag,
            baseParams: {
                method: 'Tinebase.searchTags',
                filter: Ext.util.JSON.encode({
                    application: this.app,
                    grant: 'use'
                }),
                paging : Ext.util.JSON.encode({})
            }
        });
        
        this.initSearchField();
        
        this.bottomBar = new Ext.Toolbar({
            style: 'border: 0px;',
            items:[
                this.searchField, '->',
                new Ext.Button({
                    text: '',
                    iconCls: 'action_add',
                    tooltip: _('Add a new personal tag'),
                    scope: this,
                    handler: function() {
                        Ext.Msg.prompt(_('Add New Personal Tag'),
                                       _('Please note: You create a personal tag. Only you can see it!') + ' <br />' + _('Enter tag name:'), 
                            function(btn, text) {
                                if (btn == 'ok'){
                                    this.onTagAdd(text);
                                }
                            }, 
                        this, false, this.searchField.lastQuery);
                    }
                })
            ]
        });
        
        var tagTpl = new Ext.XTemplate(
            '<tpl for=".">',
               '<div class="x-widget-tag-tagitem" id="{id}">',
                    '<div class="x-widget-tag-tagitem-color" style="background-color: {color};">&#160;</div>', 
                    '<div class="x-widget-tag-tagitem-text" ext:qtip="', 
                        '{[this.encode(values.name)]}', 
                        '<tpl if="type == \'personal\' ">&nbsp;<i>(' + _('personal') + ')</i></tpl>',
                        '</i>&nbsp;[{occurrence}]',
                        '<tpl if="description != null && description.length &gt; 1"><hr>{[this.encode(values.description)]}</tpl>" >',
                        
                        '&nbsp;{[this.encode(values.name)]}',
                    '</div>',
                '</div>',
            '</tpl>' ,{
                encode: function(value) {
                    return Ext.util.Format.htmlEncode(value);
                }
            }
        );
        
        this.dataView = new Ext.DataView({
            store: this.recordTagsStore,
            tpl: tagTpl,
            autoHeight:true,
            multiSelect: true,
            overClass:'x-widget-tag-tagitem-over',
            selectedClass:'x-widget-tag-tagitem-selected',
            itemSelector:'div.x-widget-tag-tagitem',
            emptyText: _('No Tags to display')
        });
        this.dataView.on('contextmenu', function(dataView, selectedIdx, node, event){
            if (!this.dataView.isSelected(selectedIdx)) {
                this.dataView.clearSelections();
                this.dataView.select(selectedIdx);
            }
            event.preventDefault();
            
            var selectedTags = this.dataView.getSelectedRecords();
            var selectedTag = selectedTags.length == 1 ? selectedTags[0] : null;
            
            var allowDelete = true;
            for (var i=0; i<selectedTags.length; i++) {
                if (selectedTags[i].get('type') == 'shared') {
                    allowDelete = false;
                }
            }
            
            var menu = new Ext.menu.Menu({
                items: [
                    new Ext.Action({
                        scope: this,
                        text: Tine.Tinebase.tranlation.ngettext('Detach tag', 'Detach tags', selectedTags.length),
                        iconCls: 'x-widget-tag-action-detach',
                        handler: function() {
                            for (var i=0,j=selectedTags.length; i<j; i++){
                                this.recordTagsStore.remove(selectedTags[i]);
                            }
                        }
                    }),
                    '-',
                    {
                        text: _('Edit tag'),
                        disabled: !(selectedTag && allowDelete),
                        menu: {
                            items: [
                                new Ext.Action({
                                    text: _('Rename Tag'),
                                    selectedTag: selectedTag,
                                    scope: this,
                                    handler: function(action) {
                                        var tag = action.selectedTag;
                                        Ext.Msg.prompt(_('Rename Tag') + ' "'+ tag.get('name') +'"', _('Please enter a new name:'), function(btn, text){
                                            if (btn == 'ok'){
                                                tag.set('name', text);
                                                this.onTagUpdate(tag);
                                            }
                                        }, this, false, tag.get('name'));
                                    }
                                }),
                                new Ext.Action({
                                    text: _('Edit Description'),
                                    selectedTag: selectedTag,
                                    scope: this,
                                    handler: function(action) {
                                        var tag = action.selectedTag;
                                        Ext.Msg.prompt(_('Description for tag') + ' "'+ tag.get('name') +'"', _('Please enter new description:'), function(btn, text){
                                            if (btn == 'ok'){
                                                tag.set('description', text);
                                                this.onTagUpdate(tag);
                                            }
                                        }, this, 30, tag.get('description'));
                                    }
                                }),
                                new Ext.Action({     
                                    text: _('Change Color'),
                                    scope: this,
                                    menu: new Ext.menu.ColorMenu({
                                        value: selectedTag ? selectedTag.get('color') : '#FFFFFF',
                                        scope: this,
                                        listeners: {
                                            select: function(menu, color) {
                                                color = '#' + color;
                                                
                                                if (selectedTag.get('color') != color) {
                                                    selectedTag.set('color', color);
                                                    this.onTagUpdate(selectedTag);
                                                }
                                            },
                                            scope: this
                                        }
                                    })                                        
                                })                                    
                            ]
                        }
                    },
                    new Ext.Action({
                        disabled: !allowDelete,
                        scope: this,
                        text: Tine.Tinebase.tranlation.ngettext('Delete Tag', 'Delete Tags', selectedTags.length),
                        iconCls: 'action_delete',
                        handler: function() {
                            var tagsToDelete = [];
                            for (var i=0,j=selectedTags.length; i<j; i++){
                                // don't request to delete non existing tags
                                if (selectedTags[i].id.length > 20) {
                                    tagsToDelete.push(selectedTags[i].id);
                                }
                            }
                            
                            // @todo use correct strings: Realy -> Really / disapear -> disappear
                            Ext.MessageBox.confirm(
                                Tine.Tinebase.tranlation.ngettext('Realy Delete Selected Tag?', 'Realy Delete Selected Tags?', selectedTags.length), 
                                Tine.Tinebase.tranlation.ngettext('the selected tag will be deleted and disapear for all entries', 
                                                        'The selected tags will be removed and disapear for all entries', selectedTags.length), 
                                function(btn) {
                                    if (btn == 'yes'){
                                        Ext.MessageBox.wait(_('Please wait a moment...'), Tine.Tinebase.tranlation.ngettext('Deleting Tag', 'Deleting Tags', selectedTags.length));
                                        Ext.Ajax.request({
                                            params: {
                                                method: 'Tinebase.deleteTags', 
                                                ids: Ext.util.JSON.encode(tagsToDelete)
                                            },
                                            success: function(_result, _request) {
                                                // reset avail tag store
                                                this.availableTagsStore.lastOptions = null;
                                                
                                                for (var i=0,j=selectedTags.length; i<j; i++){
                                                    this.recordTagsStore.remove(selectedTags[i]);
                                                }
                                                Ext.MessageBox.hide();
                                            },
                                            failure: function ( result, request) { 
                                                Ext.MessageBox.alert(_('Failed'), _('Could not delete Tag(s).')); 
                                            },
                                            scope: this 
                                        });
                                    }
                            }, this);
                        }
                    })
                ]
            });
            menu.showAt(event.getXY());
        },this);
        
        this.formField = {
            layout: 'form',
            items: new Tine.widgets.tags.TagFormField({
                recordTagsStore: this.recordTagsStore
            })
        };
        
        this.items = [{
            xtype: 'panel',
            layout: 'fit',
            bbar: this.bottomBar,
            items: [
                this.dataView,
                this.formField
            ]
        }];
        Tine.widgets.tags.TagPanel.superclass.initComponent.call(this);
    },
    /**
     * @private
     */
    onRender: function(ct, position) {
        Tine.widgets.tags.TagPanel.superclass.onRender.call(this, ct, position);
        //this.dataView.el.on('keypress', function(){console.log('arg')});
        //this.body.on('keydown', this.onKeyDown, this);
        //this.relayEvents(this.body, ['keypress']);
        //this.on('keypress', function(){console.log('arg')});
    },
    /**
     * @private
     */
    onResize : function(w,h){
        Tine.widgets.tags.TagPanel.superclass.onResize.call(this, w, h);
        // maximize search field and let space for add button
        if (this.searchField.rendered && w) {
            
            w = this.getSize().width - 12;
            this.searchField.setWidth(w);
            this.searchField.syncSize();
        }
    },
    
    /**
     * @private
     */
    onTagAdd: function(tagName) {
        if (tagName.length < 3) {
            Ext.Msg.show({
               title: _('Notice'),
               msg: _('The minimum tag length is three.'),
               buttons: Ext.Msg.OK,
               animEl: 'elId',
               icon: Ext.MessageBox.INFO
            });
        } else {
            var isAttached = false;
            this.recordTagsStore.each(function(tag){
                if(tag.data.name == tagName) {
                    isAttached = true;
                }
            },this);
            
            if (!isAttached) {
                var tagToAttach = false;
                this.availableTagsStore.each(function(tag){
                    if(tag.data.name == tagName) {
                        tagToAttach = tag;
                    }
                }, this);
                
                if (!tagToAttach) {
                    tagToAttach = new Tine.Tinebase.Model.Tag({
                        name: tagName,
                        type: 'personal',
                        description: '',
                        color: '#FFFFFF'
                    });
                    
                    if (! Ext.isIE) {
                    	this.el.mask();
                    }
                    Ext.Ajax.request({
                        params: {
                            method: 'Tinebase.saveTag', 
                            tag: Ext.util.JSON.encode(tagToAttach.data)
                        },
                        success: function(_result, _request) {
                            var tagData = Ext.util.JSON.decode(_result.responseText);
                            var newTag = new Tine.Tinebase.Model.Tag(tagData, tagData.id);
                            this.recordTagsStore.add(newTag);
                            
                            // reset avail tag store
                            this.availableTagsStore.lastOptions = null;
                            this.el.unmask();
                        },
                        failure: function ( result, request) {
                            Ext.MessageBox.alert(_('Failed'), _('Could not create tag.')); 
                            this.el.unmask();
                        },
                        scope: this 
                    });
                } else {
                    this.recordTagsStore.add(tagToAttach);
                }
            }
        }
    },
    onTagUpdate: function(tag) {
        if (tag.get('name').length < 3) {
            Ext.Msg.show({
               title: _('Notice'),
               msg: _('The minimum tag length is three.'),
               buttons: Ext.Msg.OK,
               animEl: 'elId',
               icon: Ext.MessageBox.INFO
            });
        } else {
            this.el.mask();
            Ext.Ajax.request({
                params: {
                    method: 'Tinebase.saveTag', 
                    tag: Ext.util.JSON.encode(tag.data)
                },
                success: function(_result, _request) {
                    // reset avail tag store
                    this.availableTagsStore.lastOptions = null;
                    this.el.unmask();
                },
                failure: function ( result, request) {
                    Ext.MessageBox.alert(_('Failed'), _('Could not update tag.')); 
                    this.el.unmask();
                },
                scope: this 
            });
        }
    },
    /**
     * @private
     */
    initSearchField: function() {
        var tpl = new Ext.XTemplate(
            '<tpl for="."><div class="x-combo-list-item" ext:qtip="', 
                '{[this.encode(values.name)]}', 
                '<tpl if="type == \'personal\' ">&nbsp;<i>(' + _('personal') + ')</i></tpl>',
                '</i>&nbsp;[{occurrence}]',
                '<tpl if="description != null && description.length &gt; 1"><hr>{[this.encode(values.description)]}</tpl>">',
                
                '{[this.encode(values.name)]} <tpl if="type == \'personal\' "><i>(' + _('personal') + ')</i></tpl>',
            '</div></tpl>',{
                encode: function(value) {
                    return Ext.util.Format.htmlEncode(value);
                }
            }
        );
        
        this.searchField = new Ext.form.ComboBox({
            store: this.availableTagsStore,
            mode: 'local',
            //width: 170,
            enableKeyEvents: true,
            displayField:'name',
            typeAhead: true,
            emptyText: _('Enter tag name'),
            loadingText: _('Searching...'),
            typeAheadDelay: 10,
            minChars: 1,
            hideTrigger:false,
            triggerAction: 'all',
            forceSelection: true,
            tpl: tpl
            //expand: function(){}
        });
        
        // load data once
        this.searchField.on('focus', function(searchField){
            if (! searchField.store.lastOptions) {
                // hack to supress selecting the first item from the freshly
                // retrieved store
                searchField.hasFocus = false;
                this.availableTagsStore.load({
                    scope: this,
                    callback: function() {
                        searchField.hasFocus = true;
                    }
                });
            }
        }, this);
        
        this.searchField.on('select', function(searchField, selectedTag){
            if(this.recordTagsStore.getById(selectedTag.id) === undefined) {
                this.recordTagsStore.add(selectedTag);
            }
            searchField.emptyText = '';
            searchField.clearValue();
        },this);
        
        /*
        // filter invalid
        this.searchField.on('beforequery', function(qe) {
            var query = qe.query;
            if (this.searchField.store.find('name', query) < 0) {
                console.log(query);
            }
            //var val = searchField.el.dom.value;
        }, this);
        */
        /*
        this.searchField.on('specialkey', function(searchField, e){
             if(e.getKey() == e.ENTER){
                var value = searchField.getValue();
                
                }
                searchField.emptyText = '';
                searchField.clearValue();
             }
        }, this);
        */
        
        // workaround extjs bug:
        this.searchField.on('blur', function(searchField){
            searchField.emptyText = _('Enter tag name');
            searchField.clearValue();
        },this);
    }
});

/**
 * @private Helper class to have tags processing in the standard form/record cycle
 */
Tine.widgets.tags.TagFormField = Ext.extend(Ext.form.Field, {
    /**
     * @cfg {Ext.data.JsonStore} recordTagsStore a store where the record tags are in.
     */
    recordTagsStore: null,
    
    name: 'tags',
    hidden: true,
    labelSeparator: '',
    /**
     * @private
     */
    initComponent: function() {
        Tine.widgets.tags.TagFormField.superclass.initComponent.call(this);
        //this.hide();
    },
    /**
     * returns tags data of the current record
     */
    getValue: function() {
        var value = [];
        this.recordTagsStore.each(function(tag){
            if(tag.id.length > 5) {
                //if we have a valid id we just return the id
                value.push(tag.id);
            } else {
                //it's a new tag and will be saved on the fly
                value.push(tag.data);
            }
        });
        return value;
    },
    /**
     * sets tags from an array of tag data objects (not records)
     */
    setValue: function(value){
        this.recordTagsStore.loadData(value);
    }

});

/**
 * Dialog for editing a tag itself
 */
Tine.widgets.tags.TagEditDialog = Ext.extend(Ext.Window, {
    width: 200,
    height: 300,
    layout: 'fit',
    margins: '0px 5px 0px 5px',
    
    initComponent: function() {
        this.items = new Ext.form.FormPanel({
            defaults: {
                xtype: 'textfield',
                anchor: '100%'
            },
            labelAlign: 'top',
            items: [
                {
                    name: 'name',
                    fieldLabel: 'Name'
                },
                {
                    name: 'description',
                    fieldLabel: _('Description')
                },
                {
                    name: 'color',
                    fieldLabel: _('Color')
                }
            ]
            
        });
        Tine.widgets.tags.TagEditDialog.superclass.initComponent.call(this);
    }
});

Tine.widgets.tags.EditDialog = Ext.extend(Ext.Window, {
    layout:'border',
    width: 640,
    heigh: 480,
    
    initComponent: function() {
        this.items = [
        {
            region: 'west',
            split: true
        },
        {
            region: 'center',
            split: true
        }
        ];
        Tine.widgets.tags.EditDialog.superclass.call(this);
    }
});
// file: /var/www/tine20build/tine20/Tinebase/js/widgets/tags/TagCombo.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Tine.widgets', 'Tine.widgets.tags');

Tine.widgets.tags.TagCombo = Ext.extend(Ext.ux.form.ClearableComboBox, {
    /**
     * @cfg {Tine.Tinebase.Application} app
     */
    app: null,
    
    /**
     * @cfg {Bool} findGlobalTags true to find global tags during search (default: true)
     */
    findGlobalTags: true,
    
    id: 'TagCombo',
    emptyText: null,
    typeAhead: true,
    //editable: false,
    mode: 'remote',
    triggerAction: 'all',
    displayField:'name',
    valueField:'id',
    width: 100,
    
    /**
     * @private
     */
    initComponent: function() {
        this.emptyText = this.emptyText ? this.emptyText : _('tag name');
        
        this.store = new Ext.data.JsonStore({
            id: 'id',
            root: 'results',
            totalProperty: 'totalCount',
            fields: Tine.Tinebase.Model.Tag,
            baseParams: {
                method: 'Tinebase.searchTags',
                filter: Ext.util.JSON.encode({
                    application: this.app ? this.app.appName : ''
                }),
                paging : Ext.util.JSON.encode({})
            }
        });
        Tine.widgets.tags.TagCombo.superclass.initComponent.call(this);
        
        this.on('select', function(){
            var v = this.getValue();
            if(String(v) !== String(this.startValue)){
                this.fireEvent('change', this, v, this.startValue);
            }
        }, this);
    },
    
    setValue: function(value) {
        if(typeof value === 'object' && Object.prototype.toString.call(value) === '[object Object]') {
            this.store.loadData({results: [value]});
            value = value.id;
        }
        Tine.widgets.tags.TagCombo.superclass.setValue.call(this, value);
    }
});
// file: /var/www/tine20build/tine20/Tinebase/js/widgets/tags/TagFilter.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */

Ext.namespace('Tine.widgets', 'Tine.widgets.tags');

Tine.widgets.tags.TagFilter = Ext.extend(Tine.widgets.grid.FilterModel, {
    /**
     * @cfg {Tine.Tinebase.Application} app
     */
    app: null,
    
    field: 'tag',
    
    /**
     * @private
     */
    initComponent: function() {
        Tine.widgets.tags.TagFilter.superclass.initComponent.call(this);
        
        this.label = _('Tag');
        this.operators = ['equals'];
        
        
    },
    /**
     * value renderer
     * 
     * @param {Ext.data.Record} filter line
     * @param {Ext.Element} element to render to 
     */
    valueRenderer: function(filter, el) {
        // value
        var value = new Tine.widgets.tags.TagCombo({
            app: this.app,
            filter: filter,
            width: 200,
            id: 'tw-ftb-frow-valuefield-' + filter.id,
            value: filter.data.value ? filter.data.value : this.defaultValue,
            renderTo: el
        });
        value.on('specialkey', function(field, e){
             if(e.getKey() == e.ENTER){
                 this.onFiltertrigger();
             }
        }, this);
        //value.on('select', this.onFiltertrigger, this);
        
        return value;
    }
});


// file: /var/www/tine20build/tine20/Tinebase/js/widgets/app/JsonBackend.js
/*
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Tine.Tinebase.widgets.app');

/**
 * Generic JSON Backdend for an model/datatype of an application
 * 
 * @class Tine.Tinebase.widgets.app.JsonBackend
 * @extends Ext.data.DataProxy
 * @constructor 
 */
Tine.Tinebase.widgets.app.JsonBackend = function(config) {
    Tine.Tinebase.widgets.app.JsonBackend.superclass.constructor.call(this);
    Ext.apply(this, config);
    
    this.jsonReader = new Ext.data.JsonReader({
        id: this.idProperty,
        root: 'results',
        totalProperty: 'totalcount'
    }, this.recordClass);
};

Ext.extend(Tine.Tinebase.widgets.app.JsonBackend, Ext.data.DataProxy, {
    /**
     * @cfg {String} appName
     * internal/untranslated app name (required)
     */
    appName: null,
    /**
     * @cfg {String} modelName
     * name of the model/record  (required)
     */
    modelName: null,
    /**
     * @cfg {Ext.data.Record} recordClass
     * record definition class  (required)
     */
    recordClass: null,
    /**
     * @cfg {String} idProperty
     * property of the id of the record
     */
    idProperty: 'id',
    
    /**
     * loads a single 'full featured' record
     * 
     * @param   {Ext.data.Record} record
     * @param   {Object} options
     * @return  {Number} Ext.Ajax transaction id
     * @success {Ext.data.Record}
     */
    loadRecord: function(record, options) {
        options = options || {};
        options.params = options.params || {};
        options.beforeSuccess = function(response) {
            return [this.recordReader(response)];
        };
        
        var p = options.params;
        p.method = this.appName + '.get' + this.modelName;
        p.id = record.get(this.idProperty); 
        
        return this.request(options);
    },
    
    /**
     * searches all (lightweight) records matching filter
     * 
     * @param   {Object} filter
     * @param   {Object} paging
     * @param   {Object} options
     * @return  {Number} Ext.Ajax transaction id
     * @success {Object} root:[recrods], totalcount: number
     */
    searchRecords: function(filter, paging, options) {
        options = options || {};
        options.params = options.params || {};
        
        var p = options.params;
        
        p.method = this.appName + '.search' + this.modelName + 's';
        p.filter = Ext.util.JSON.encode(filter);
        p.paging = Ext.util.JSON.encode(paging);
        
        options.beforeSuccess = function(response) {
            return [this.jsonReader.read(response)];
        };
        
        // increase timeout as this can take a longer (1 minute)
        options.timeout = 60000;
                
        return this.request(options);
    },
    
    /**
     * saves a single record
     * 
     * @param   {Ext.data.Record} record
     * @param   {Object} options
     * @return  {Number} Ext.Ajax transaction id
     * @success {Ext.data.Record}
     */
    saveRecord: function(record, options) {
        options = options || {};
        options.params = options.params || {};
        options.beforeSuccess = function(response) {
            return [this.recordReader(response)];
        };
        
        var p = options.params;
        p.method = this.appName + '.save' + this.modelName;
        p.recordData = Ext.util.JSON.encode(record.data);
        
        return this.request(options);
    },
    
    /**
     * deletes multiple records identified by their ids
     * 
     * @param   {Array} records Array of records or ids
     * @param   {Object} options
     * @return  {Number} Ext.Ajax transaction id
     * @success 
     */
    deleteRecords: function(records, options) {
        options = options || {};
        options.params = options.params || {};
        options.params.method = this.appName + '.delete' + this.modelName + 's';
        options.params.ids = Ext.util.JSON.encode(this.getRecordIds(records));
        
        return this.request(options);
    },

    /**
     * deletes multiple records identified by a filter
     * 
     * @param   {Object} filter
     * @param   {Object} options
     * @return  {Number} Ext.Ajax transaction id
     * @success 
     */
    deleteRecordsByFilter: function(filter, options) {
        options = options || {};
        options.params = options.params || {};
        options.params.method = this.appName + '.delete' + this.modelName + 'sByFilter';
        options.params.filter = Ext.util.JSON.encode(filter);
        
        // increase timeout as this can take a long time (5 mins)
        options.timeout = 300000;
        
        return this.request(options);
    },
    
    /**
     * updates multiple records with the same data
     * 
     * @param   {Array} filter filter data
     * @param   {Object} updates
     * @return  {Number} Ext.Ajax transaction id
     * @success
     */
    updateRecords: function(filter, updates, options) {
        options = options || {};
        options.params = options.params || {};
        options.params.method = this.appName + '.updateMultiple' + this.modelName + 's';
        options.params.filter = Ext.util.JSON.encode(filter);
        options.params.values = Ext.util.JSON.encode(updates);
        
        options.beforeSuccess = function(response) {
            return [Ext.util.JSON.decode(response.responseText)];
        };
        
        return this.request(options);
    },
    
    /**
     * returns an array of ids
     * 
     * @private 
     * @param  {Ext.data.Record|Array}
     * @return {Array} of ids
     */
    getRecordIds : function(records) {
        var ids = [];
        
        if (! Ext.isArray(records)) {
            records = [records];
        }
        
        for (var i=0; i<records.length; i++) {
            ids.push(records[i].id ? records[i].id : records.id);
        }
        
        return ids;
    },
    
    /**
     * reqired method for Ext.data.Proxy, used by store
     * @todo read the specs and implement success/fail handling
     * @todo move reqest to searchRecord
     */
    load : function(params, reader, callback, scope, arg){
        if(this.fireEvent("beforeload", this, params) !== false){
            
            // move paging to own object
            var paging = {
                sort:  params.sort,
                dir:   params.dir,
                start: params.start,
                limit: params.limit
            };
            
            this.searchRecords(params.filter, paging, {
                scope: this,
                success: function(records) {
                    callback.call(scope||this, records, arg, true);
                }
            });
            
        } else {
            callback.call(scope||this, null, arg, false);
        }
    },
    
    /**
     * returns reader
     * 
     * @return {Ext.data.DataReader}
     */
    getReader: function() {
        return this.jsonReader;
    },
    
    /**
     * reads a single 'fully featured' record from json data
     * 
     * NOTE: You might want to overwride this method if you have a more complex record
     * 
     * @param  XHR response
     * @return {Ext.data.Record}
     */
    recordReader: function(response) {
        var recordData = Ext.util.JSON.decode('{results: [' + response.responseText + ']}');
        var data = this.jsonReader.readRecords(recordData);
        
        var record = data.records[0];
        var recordId = record.get(record.idProperty);
        
        record.id = recordId ? recordId : 0;
        
        return record;
    },
    
    /**
     * is request still loading?
     * 
     * @param  {Number} Ext.Ajax transaction id
     * @return {Bool}
     */
    isLoading: function(tid) {
        return Ext.Ajax.isLoading(tid);
    },
    
    /**
     * performs an Ajax request
     */
    request: function(options) {
        
        var requestOptions = {
            scope: this,
            params: options.params,
            success: function(response) {
                if (typeof options.success == 'function') {
                    var args = [];
                    if (typeof options.beforeSuccess == 'function') {
                        args = options.beforeSuccess.call(this, response);
                    }
                    
                    options.success.apply(options.scope, args);
                }
            },
            failure: function (response) {
                if (typeof options.failure == 'function') {
                    var args = [];
                    if (typeof options.beforeFailure == 'function') {
                        args = options.beforeFailure.call(this, response);
                    }
                
                    options.failure.apply(options.scope, args);
                }
            }
        };
        
        if (options.timeout) {
            requestOptions.timeout = options.timeout;
        }
        
        if (typeof options.exceptionHandler == 'function') {
            requestOptions.exceptionHandler = function(response) {
                options.exceptionHandler.call(options.scope, response, options);
            };
        }
        
        return Ext.Ajax.request(requestOptions);
    }
});

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/app/MainScreen.js
/*
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.ns('Tine.Tinebase.widgets.app');

Tine.Tinebase.widgets.app.MainScreen = function(config) {
    Ext.apply(this, config);
    
    this.addEvents(
        /**
         * @event beforeshow
         * Fires before the component is shown. Return false to stop the show.
         * @param {Ext.Component} this
         */
        'beforeshow',
        /**
         * @event show
         * Fires after the component is shown.
         * @param {Ext.Component} this
         */
        'show'
    );
    Tine.Tinebase.widgets.app.MainScreen.superclass.constructor.call(this);
};

Ext.extend(Tine.Tinebase.widgets.app.MainScreen, Ext.util.Observable, {
    /**
     * @cfg {Tine.Tinebase.Application} app
     * instance of the app object (required)
     */
    app: null,
    
    /**
     * @property {Ext.Panel} treePanel
     */
    /**
     * @property {Tine.widgets.app.GridPanel} gridPanel 
     */
    /**
     * @property {Ext.Toolbar} actionToolbar
     */
    
    /**
     * shows/activates this app mainscreen
     * 
     * @return {Tine.Tinebase.widgets.app.MainScreen} this
     */
    show: function() {
        if(this.fireEvent("beforeshow", this) !== false){
            this.setTreePanel();
            this.setContentPanel();
            this.setToolbar();
            this.updateMainToolbar();
            
            this.fireEvent('show', this);
        }
        return this;
    },
    
    onHide: function() {
        
    },
    
    /**
     * sets tree panel in mainscreen
     */
    setTreePanel: function() {
        if(!this.treePanel) {
            this.treePanel = new Tine[this.app.appName].TreePanel({app: this.app});
        }
        
        if(!this.filterPanel && Tine[this.app.appName].FilterPanel) {
            this.filterPanel = new Tine[this.app.appName].FilterPanel({
                app: this.app,
                treePanel: this.treePanel
            });
        }
        
        if (this.filterPanel) {
            var containersName = 'not found';
            if (this.treePanel.recordClass) {
                var containersName = this.app.i18n.n_hidden(this.treePanel.recordClass.getMeta('containerName'), this.treePanel.recordClass.getMeta('containersName'), 50);
            }
            
            this.leftTabPanel = new Ext.TabPanel({
                border: false,
                activeItem: 0,
                layoutOnTabChange: true,
                autoScroll: true,
                items: [{
                    title: containersName,
                    layout: 'fit',
                    items: this.treePanel,
                    autoScroll: true
                }, {
                    title: _('Saved filter'),
                    layout: 'fit',
                    items: this.filterPanel,
                    autoScroll: true
                }],
                getPersistentFilterNode: this.filterPanel.getPersistentFilterNode.createDelegate(this.filterPanel)
            
            });
            
            Tine.Tinebase.MainScreen.setActiveTreePanel(this.leftTabPanel, true);
        } else {
            Tine.Tinebase.MainScreen.setActiveTreePanel(this.treePanel, true);
        }
    },
    
    getTreePanel: function() {
        if (this.leftTabPanel) {
            return this.leftTabPanel;
        } else {
            return this.treePanel;
        }
    },
    
    /**
     * sets content panel in mainscreen
     */
    setContentPanel: function() {
        if(!this.gridPanel) {
            var plugins = [];
            if (typeof(this.treePanel.getFilterPlugin) == 'function') {
                plugins.push(this.treePanel.getFilterPlugin());
            }
            
            this.gridPanel = new Tine[this.app.appName].GridPanel({
                app: this.app,
                plugins: plugins
            });
        }
        
        Tine.Tinebase.MainScreen.setActiveContentPanel(this.gridPanel, true);
        this.gridPanel.store.load();
    },
    
    getContentPanel: function() {
        return this.gridPanel;
    },
    
    /**
     * sets toolbar in mainscreen
     */
    setToolbar: function() {
        if(!this.actionToolbar) {
            this.actionToolbar = this.gridPanel.actionToolbar;
        }
        
        Tine.Tinebase.MainScreen.setActiveToolbar(this.actionToolbar, true);
    },
    
    /**
     * updates main toolbar
     */
    updateMainToolbar : function() {
        //if (! 'platform' in window) { // waits for more prism
            var menu = Ext.menu.MenuMgr.get('Tinebase_System_AdminMenu');
            menu.removeAll();
    
            var adminButton = Ext.getCmp('tineMenu').items.get('Tinebase_System_AdminButton');
            adminButton.setIconClass('TasksTreePanel');
            adminButton.setDisabled(true);
        //}
    }
    
});
// file: /var/www/tine20build/tine20/Tinebase/js/widgets/app/GridPanel.js
/*
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Tine.Tinebase.widgets.app');

Tine.Tinebase.widgets.app.GridPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {Tine.Tinebase.Application} app
     * instance of the app object (required)
     */
    app: null,
    /**
     * @cfg {Object} gridConfig
     * Config object for the Ext.grid.GridPanel
     */
    gridConfig: {},
    /**
     * @cfg {Ext.data.Record} recordClass
     * record definition class  (required)
     */
    recordClass: null,
    /**
     * @cfg {Ext.data.DataProxy} recordProxy
     */
    recordProxy: null,
    /**
     * @cfg {Array} actionToolbarItems
     * additional items for actionToolbar
     */
    actionToolbarItems: [],
    /**
     * @cfg {Tine.widgets.grid.FilterToolbar} filterToolbar
     */
    filterToolbar: null,
    /**
     * @cfg {Array} contextMenuItems
     * additional items for contextMenu
     */
    contextMenuItems: [],
    /**
     * @cfg {Bool} evalGrants
     * should grants of a grant-aware records be evaluated (defaults to true)
     */
    evalGrants: true,
    /**
     * @cfg {Bool} filterSelectionDelete
     * is it allowed to deleteByFilter?
     */
    filterSelectionDelete: false,
    /**
     * @cfg {Object} defaultSortInfo
     */
    defaultSortInfo: {},
    /**
     * @cfg {Object } defaultPaging 
     */
    defaultPaging: {
        start: 0,
        limit: 50
    },
    /**
     * @cfg {Tine.widgets.grid.DetailsPanel} detailsPanel
     * if set, it becomes rendered in region south 
     */
    detailsPanel: null,
    /**
     * @cfg {Array} i18nDeleteQuestion 
     * spechialised strings for deleteQuestion
     */
    i18nDeleteQuestion: null,
    /**
     * @cfg {String} i18nAddRecordAction 
     * spechialised strings for add action button
     */
    i18nAddActionText: null,
    /**
     * @cfg {String} i18nEditRecordAction 
     * spechialised strings for edit action button
     */
    i18nEditActionText: null,
    /**
     * @cfg {Array} i18nDeleteRecordAction 
     * spechialised strings for delete action button
     */
    i18nDeleteActionText: null,
    
    /**
     * @property {Ext.Tollbar} actionToolbar
     */
    actionToolbar: null,
    /**
     * @property {Ext.Menu} contextMenu
     */
    contextMenu: null,
    
    /**
     * @cfg {function} 
     */
    getViewRowClass: null,
    
    /**
     * @private
     */
    layout: 'border',
    border: false,
    
    /**
     * extend standart initComponent chain
     * @private
     */
    initComponent: function(){
        // init some translations
        this.i18nRecordName = this.app.i18n.n_hidden(this.recordClass.getMeta('recordName'), this.recordClass.getMeta('recordsName'), 1);
        this.i18nRecordsName = this.app.i18n._hidden(this.recordClass.getMeta('recordsName'));
        this.i18nContainerName = this.app.i18n.n_hidden(this.recordClass.getMeta('containerName'), this.recordClass.getMeta('containersName'), 1);
        this.i18nContainersName = this.app.i18n._hidden(this.recordClass.getMeta('containersName'));
        
        // init actions with actionToolbar and contextMenu
        this.initActions();
        // init store
        this.initStore();
        // init (ext) grid
        this.initGrid();
        
        this.initLayout();
        
        // for some reason IE looses split height when outer layout is layouted
        if (Ext.isIE6 || Ext.isIE7) {
            this.on('show', function() {
                if (this.layout.rendered && this.detailsPanel) {
                    var height = this.detailsPanel.getSize().height;
                    this.layout.south.split.setCurrentSize(height);
                }
            }, this);
        }

        Tine.Tinebase.widgets.app.GridPanel.superclass.initComponent.call(this);
    },
    
    /**
     * @private
     * 
     * NOTE: Order of items matters! Ext.Layout.Border.SplitRegion.layout() does not
     *       fence the rendering correctly, as such it's impotant, so have the ftb
     *       defined after all other layout items
     */
    initLayout: function() {
        this.items = [{
            region: 'center',
            xtype: 'panel',
            layout: 'fit',
            border: false,
            tbar: this.pagingToolbar,
            items: this.grid
        }];
        
        // add detail panel
        if (this.detailsPanel) {
            this.items.push({
                region: 'south',
                border: false,
                collapsible: true,
                collapseMode: 'mini',
                split: true,
                layout: 'fit',
                height: this.detailsPanel.defaultHeight ? this.detailsPanel.defaultHeight : 125,
                items: this.detailsPanel
                
            });
            this.detailsPanel.doBind(this.grid);
        }
        
        // add filter toolbar
        if (this.filterToolbar) {
            this.items.push(this.filterToolbar);
            this.filterToolbar.on('bodyresize', function(ftb, w, h) {
                if (this.filterToolbar.rendered && this.layout.rendered) {
                    this.layout.layout();
                }
            }, this);
        }
    },
    
    /**
     * init actions with actionToolbar, contextMenu and actionUpdater
     * 
     * @private
     */
    initActions: function() {
        this.action_editInNewWindow = new Ext.Action({
            requiredGrant: 'readGrant',
            text: this.i18nEditActionText ? this.app.i18n._hidden(this.i18nEditActionText) : String.format(_('Edit {0}'), this.i18nRecordName),
            disabled: true,
            actionType: 'edit',
            handler: this.onEditInNewWindow,
            iconCls: 'action_edit',
            scope: this
        });
        
        this.action_addInNewWindow = new Ext.Action({
            requiredGrant: 'addGrant',
            actionType: 'add',
            text: this.i18nAddActionText ? this.app.i18n._hidden(this.i18nAddActionText) : String.format(_('Add {0}'), this.i18nRecordName),
            handler: this.onEditInNewWindow,
            iconCls: this.app.appName + 'IconCls',
            scope: this
        });
        
        // note: unprecise plural form here, but this is hard to change
        this.action_deleteRecord = new Ext.Action({
            requiredGrant: 'deleteGrant',
            allowMultiple: true,
            singularText: this.i18nDeleteActionText ? i18nDeleteActionText[0] : String.format(Tine.Tinebase.tranlation.ngettext('Delete {0}', 'Delete {0}', 1), this.i18nRecordName),
            pluralText: this.i18nDeleteActionText ? i18nDeleteActionText[1] : String.format(Tine.Tinebase.tranlation.ngettext('Delete {0}', 'Delete {0}', 1), this.i18nRecordsName),
            translationObject: this.i18nDeleteActionText ? this.app.i18n : Tine.Tinebase.tranlation,
            text: this.i18nDeleteActionText ? this.i18nDeleteActionText[0] : String.format(Tine.Tinebase.tranlation.ngettext('Delete {0}', 'Delete {0}', 1), this.i18nRecordName),
            handler: this.onDeleteRecords,
            disabled: true,
            iconCls: 'action_delete',
            scope: this
        });
        
        this.actions = [
            this.action_addInNewWindow,
            this.action_editInNewWindow,
            this.action_deleteRecord
        ];
        
        this.actionToolbar = new Ext.Toolbar({
            split: false,
            height: 26,
            items: this.actions.concat(this.actionToolbarItems)
        });
        
        this.contextMenu = new Ext.menu.Menu({
            items: this.actions.concat(this.contextMenuItems)
        });
        
        // pool together all our actions, so that we can hand them over to our actionUpdater
        for (var all=this.actionToolbarItems.concat(this.contextMenuItems), i=0; i<all.length; i++) {
            if(this.actions.indexOf(all[i]) == -1) {
                this.actions.push(all[i]);
            }
        }
        
    },
    
    /**
     * init store
     * @private
     */
    initStore: function() {
        this.store = new Ext.data.Store({
            fields: this.recordClass,
            proxy: this.recordProxy,
            reader: this.recordProxy.getReader(),
            remoteSort: true,
            sortInfo: this.defaultSortInfo,
            listeners: {
                scope: this,
                'update': this.onStoreUpdate,
                'beforeload': this.onStoreBeforeload,
                'load': this.onStoreLoad
            }
        });
    },
    
    /**
     * init ext grid panel
     * @private
     */
    initGrid: function() {
        // init sel model
        this.selectionModel = new Tine.Tinebase.widgets.grid.FilterSelectionModel({
            store: this.store
        });
        this.selectionModel.on('selectionchange', function(sm) {
            Tine.widgets.actionUpdater(sm, this.actions, this.recordClass.getMeta('containerProperty'), !this.evalGrants);
            
        }, this);
        
        // we allways have a paging toolbar
        this.pagingToolbar = new Ext.ux.grid.PagingToolbar({
            pageSize: 50,
            store: this.store,
            displayInfo: true,
            displayMsg: Tine.Tinebase.tranlation._('Displaying records {0} - {1} of {2}').replace(/records/, this.i18nRecordsName),
            emptyMsg: String.format(Tine.Tinebase.tranlation._("No {0} to display"), this.i18nRecordsName),
            displaySelectionHelper: true,
            sm: this.selectionModel
        });
        // mark next grid refresh as paging-refresh
        this.pagingToolbar.on('beforechange', function() {
            this.grid.getView().isPagingRefresh = true;
        }, this);
        this.pagingToolbar.on('render', function() {
            //Ext.fly(this.pagingToolbar.el.dom).createChild({cls:'x-tw-selection-info', html: '<b>100 Selected</b>'});
            //console.log('h9er');
            //this.pagingToolbar.addFill();
            //this.pagingToolbar.add('sometext');
        }, this);
        
        // init view
        var view =  new Ext.grid.GridView({
            getRowClass: this.getViewRowClass,
            autoFill: true,
            forceFit:true,
            ignoreAdd: true,
            emptyText: String.format(Tine.Tinebase.tranlation._("No {0} where found. Please try to change your filter-criteria, view-options or the {1} you search in."), this.i18nRecordsName, this.i18nContainersName),
            onLoad: Ext.emptyFn,
            listeners: {
                beforerefresh: function(v) {
                    v.scrollTop = v.scroller.dom.scrollTop;
                },
                refresh: function(v) {
                    // on paging-refreshes (prev/last...) we don't preserve the scroller state
                    if (v.isPagingRefresh) {
                        v.scrollToTop();
                        v.isPagingRefresh = false;
                    } else {
                        v.scroller.dom.scrollTop = v.scrollTop;
                    }
                }
            }
        });
        
        // which grid to use?
        var Grid = this.gridConfig.quickaddMandatory ? Ext.ux.grid.QuickaddGridPanel : Ext.grid.GridPanel;
        
        this.gridConfig.store = this.store;
        
        // activate grid header menu for column selection
        this.gridConfig.plugins = this.gridConfig.plugins ? this.gridConfig.plugins : [];
        this.gridConfig.plugins.push(new Ext.ux.grid.GridViewMenuPlugin({}));
        this.gridConfig.enableHdMenu = false;
        
        this.grid = new Grid(Ext.applyIf(this.gridConfig, {
            border: false,
            store: this.store,
            sm: this.selectionModel,
            view: view
        }));
        
        // init various grid / sm listeners
        this.grid.on('keydown',     this.onKeyDown,     this);
        this.grid.on('rowclick',    this.onRowClick,    this);
        this.grid.on('rowdblclick', this.onRowDblClick, this);
        
        this.grid.on('rowcontextmenu', function(grid, row, e) {
            e.stopEvent();
            if(!grid.getSelectionModel().isSelected(row)) {
                grid.getSelectionModel().selectRow(row);
            }
            
            this.contextMenu.showAt(e.getXY());
        }, this);
        
    },
    
    /**
     * called when the store gets updated, e.g. from editgrid
     */
    onStoreUpdate: function(store, record, operation) {
        switch (operation) {
            case Ext.data.Record.EDIT:
                this.recordProxy.saveRecord(record, {
                    scope: this,
                    success: function(updatedRecord) {
                        store.commitChanges();
                        // update record in store to prevent concurrency problems
                        record.data = updatedRecord.data;
                        
                        // reloading the store feels like oldschool 1.x
                        // maybe we should reload if the sort critera changed, 
                        // but even this might be confusing
                        //store.load({});
                    }
                });
                break;
            case Ext.data.Record.COMMIT:
                //nothing to do, as we need to reload the store anyway.
                break;
        }
    },
    
    /**
     * called before store queries for data
     */
    onStoreBeforeload: function(store, options) {
        options.params = options.params || {};
        
        // allways start with an empty filter set!
        // this is important for paging and sort header!
        options.params.filter = [];
        
        // fix nasty paging tb
        Ext.applyIf(options.params, this.defaultPaging);
    },
    
    /**
     * called after a new set of Records has been loaded
     * 
     * @param  {Ext.data.Store} this.store
     * @param  {Array}          loaded records
     * @param  {Array}          load options
     * @return {Void}
     */
    onStoreLoad: function(store, records, options) {
        // we always focus the first row so that keynav starts in the grid
        if (this.store.getCount() > 0) {
            this.grid.getView().focusRow(0);
        }
    },
    
    /**
     * key down handler
     * @private
     */
    onKeyDown: function(e){
        if (e.ctrlKey) {
            switch (e.getKey()) {
                case e.A:
                    // select only current page
                    this.grid.getSelectionModel().selectAll(true);
                    e.preventDefault();
                    break;
                case e.E:
                    if (this.action_editInNewWindow && !this.action_editInNewWindow.isDisabled()) {
                        this.onEditInNewWindow.call(this, {
                            actionType: 'edit'
                        });
                        e.preventDefault();
                    }
                    break;
                case e.N:
                    if (this.action_addInNewWindow && !this.action_addInNewWindow.isDisabled()) {
                        this.onEditInNewWindow.call(this, {
                            actionType: 'add'
                        });
                        e.preventDefault();
                    }
                    break;
                
            }
        } else {
            switch (e.getKey()) {
                case e.DELETE:
                    if (!this.grid.editing && !this.grid.adding && !this.action_deleteRecord.isDisabled()) {
                        this.onDeleteRecords.call(this);
                    }
                    break;
            }
        }
    },
    
    /**
     * row click handler
     */
    onRowClick: function(grid, row, e) {
        /* @todo check if we need this in IE
        // hack to get percentage editor working
        var cell = Ext.get(grid.getView().getCell(row,1));
        var dom = cell.child('div:last');
        while (cell.first()) {
            cell = cell.first();
            cell.on('click', function(e){
                e.stopPropagation();
                grid.fireEvent('celldblclick', grid, row, 1, e);
            });
        }
        */
        
        // fix selection of one record if shift/ctrl key is not pressed any longer
        if(e.button === 0 && !e.shiftKey && !e.ctrlKey) {
            var sm = grid.getSelectionModel();
            sm.clearSelections();
            sm.selectRow(row, false);
            grid.view.focusRow(row);
        }
    },
    
    /**
     * row doubleclick handler
     * 
     * @param {} grid
     * @param {} row
     * @param {} e
     */
    onRowDblClick: function(grid, row, e) {
        this.onEditInNewWindow.call(this, {actionType: 'edit'});
    }, 
    
    /**
     * generic edit in new window handler
     */
    onEditInNewWindow: function(button, event) {
        var record; 
        if (button.actionType == 'edit') {
            if (! this.action_editInNewWindow || this.action_editInNewWindow.isDisabled()) {
                // if edit action is disabled or not available, we also don't open a new window
                return false;
            }
            var selectedRows = this.grid.getSelectionModel().getSelections();
            record = selectedRows[0];
        } else {
            record = new this.recordClass(this.recordClass.getDefaultData(), 0);
        }
        
        var popupWindow = Tine[this.app.appName][this.recordClass.getMeta('modelName') + 'EditDialog'].openWindow({
            record: record,
            listeners: {
                scope: this,
                'update': function(record) {
                    this.store.load({});
                }
            }
        });
    },
    
    /**
     * generic delete handler
     */
    onDeleteRecords: function(btn, e) {
        var sm = this.grid.getSelectionModel();
        
        if (sm.isFilterSelect && ! this.filterSelectionDelete) {
            Ext.MessageBox.show({
                title: _('Not Allowed'), 
                msg: _('You are not allowed to delete all pages at once'),
                buttons: Ext.Msg.OK,
                icon: Ext.MessageBox.INFO
            });
            
            return;
        }
        var records = sm.getSelections();
        
        var i18nItems    = this.app.i18n.n_hidden(this.recordClass.getMeta('recordName'), this.recordClass.getMeta('recordsName'), records.length);
        var i18nQuestion = this.i18nDeleteQuestion ?
            this.app.i18n.n_hidden(this.i18nDeleteQuestion[0], this.i18nDeleteQuestion[1], records.length) :
            Tine.Tinebase.tranlation.ngettext('Do you really want to delete the selected record', 'Do you really want to delete the selected records', records.length);
            
        Ext.MessageBox.confirm(_('Confirm'), i18nQuestion, function(btn) {
            if(btn == 'yes') {
                if (! this.deleteMask) {
                    var message = String.format(_('Deleting {0}'), i18nItems)
                    if (sm.isFilterSelect) {
                        message = message + _(' ... This may take a long time!');
                    } 
                    this.deleteMask = new Ext.LoadMask(this.grid.getEl(), {msg: message});
                }
                this.deleteMask.show();
                
                var options = {
                    scope: this,
                    success: function() {
                        this.deleteMask.hide();
                        this.onAfterDelete();
                    },
                    failure: function () {
                        this.deleteMask.hide();
                        Ext.MessageBox.alert(_('Failed'), String.format(_('Could not delete {0}.'), i18nItems)); 
                    }
                };
                
                if (sm.isFilterSelect && this.filterSelectionDelete) {
                    this.recordProxy.deleteRecordsByFilter(sm.getSelectionFilter(), options);
                } else {
                    this.recordProxy.deleteRecords(records, options);
                }
            }
        }, this);
    },
    
    /**
     * do something after deletion of records
     * - reload the store
     */
    onAfterDelete: function() {
        this.store.load({});
    }
});

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/GroupSelect.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */

Ext.namespace('Tine.widgets', 'Tine.widgets.group');

/**
 * @class Tine.widgets.group.selectionComboBox
 * @package Tinebase
 * @subpackage Widgets
 * @extends Ext.form.ComboBox
 * 
 * Group select ComboBox widget
 */
Tine.widgets.group.selectionComboBox = Ext.extend(Ext.form.ComboBox, {
    
    
	group: null,
    
    valueField: 'id',
    displayField: 'name',
    triggerAction: 'all',
    allowBlank: false,
    editable: false,

    // private
    initComponent: function(){
    	this.group = new Tine.Tinebase.Model.Group({}, 0);
        
    	this.store =  new Ext.data.JsonStore({
            baseParams: {
                method: 'Admin.getGroups',
                filter: '',
                sort: 'name',
                dir: 'asc',
                start: 0,
                limit: 50
            },
            root: 'results',
            totalProperty: 'totalcount',
            id: 'id',
            fields: Tine.Tinebase.Model.Group     
        });
                        
        Tine.widgets.group.selectionComboBox.superclass.initComponent.call(this, arguments);
    },

    // private
    getValue: function() {
    	return this.group.id;
    },

    /**
     * 
     */
    setValue: function(group) {
        if (group.hasOwnProperty('id') && typeof group.get != 'function') {
            group = new Tine.Tinebase.Model.Group(group, group.id);
        } else {
            group = this.store.getById(group);
        }
        this.group = group;
        this.value = group.id;
        this.setRawValue(group.get('name'));
    }
    
});

/************** isn't used at the moment / build window with search function etc. later on ****************/

/**
 * This widget shows a modal group selection dialog
 * @class Tine.widgets.group.selectionDialog
 * @extends Ext.Component
 * @package Tinebase
 * @subpackage Widgets
 */
Tine.widgets.group.selectionDialog = Ext.extend(Ext.Component, {
	/**
	 * @cfg {string}
	 * title of dialog
	 */
    title: null,

    // private
    
    initComponent: function(){
        this.title = this.title ? this.title : _('Please Select a Group');
        Tine.widgets.group.selectionDialog.superclass.initComponent.call(this);
        
		var windowHeight = 400;
		if (Ext.getBody().getHeight(true) * 0.7 < windowHeight) {
			windowHeight = Ext.getBody().getHeight(true) * 0.7;
		}

        var w = new Ext.Window({
            title: this.title,
            modal: true,
            width: 375,
            height: windowHeight,
            minWidth: 375,
            minHeight: windowHeight,
            layout: 'fit',
            plain: true,
            bodyStyle: 'padding:5px;',
            buttonAlign: 'center',
            items: groupsGridPanel
        });
                                
        w.show();
    }
});

Ext.namespace('Tine.Admin.Model');
Tine.Admin.Model.Group = Ext.data.Record.create([
    {name: 'id'},
    {name: 'name'},
    {name: 'description'}
    // @todo add accounts array to group model?
]);

// file: /var/www/tine20build/tine20/Tinebase/js/widgets/CountryCombo.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Tine.widgets');

/**
 * Widget for country selection
 */
Tine.widgets.CountryCombo = Ext.extend(Ext.form.ComboBox, {
    fieldLabel: 'Country',
    displayField:'translatedName',
    valueField:'shortName',
    typeAhead: true,
    forceSelection: true,
    mode: 'local',
    triggerAction: 'all',
    emptyText:'Select a country...',
    selectOnFocus:true,
    
    /**
     * @private
     */
    initComponent: function() {
        this.store = this.getCountryStore();
        Tine.widgets.CountryCombo.superclass.initComponent.call(this);
        
        this.on('focus', function(searchField){
            // initial load
            if (this.getCountryStore().getCount() == 0) {
                searchField.hasFocus = false;
                this.getCountryStore().load({
                    scope: this,
                    callback: function() {
                        searchField.hasFocus = true;
                    }
                });
            }
        }, this);
        
        this.on('select', function(searchField){
            searchField.selectText();
        },this);
    },
    /**
     * @private store has static content
     */
    getCountryStore: function(){
        var store = Ext.StoreMgr.get('Countries');
        if(!store) {
            store = new Ext.data.JsonStore({
                baseParams: {
                    method:'Tinebase.getCountryList'
                },
                root: 'results',
                id: 'shortName',
                fields: ['shortName', 'translatedName'],
                remoteSort: false
            });
            Ext.StoreMgr.add('Countries', store);
        }
        if (Tine.Tinebase.registry.get('CountryList')) {
            store.loadData(Tine.Tinebase.registry.get('CountryList'));
        }
        
        return store;
    },
    /**
     * @private
     * expand after store load, as this is ommited by the initial load hack
     */
    onTriggerClick: function(){
        if (this.getCountryStore().getCount() == 0) {
            this.getCountryStore().load({
                scope: this,
                callback: function() {
                    Tine.widgets.CountryCombo.superclass.onTriggerClick.call(this);
                }
            });
        } else {
            Tine.widgets.CountryCombo.superclass.onTriggerClick.call(this);
        }
        
    }
});

Ext.reg('widget-countrycombo', Tine.widgets.CountryCombo);
// file: /var/www/tine20build/tine20/Tinebase/js/widgets/GridPicker.js
/**
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 * includes the contact search and picker panel and a small contacts grid
 * 
 * @todo generalise for more different object types
 * @todo add translations
 * 
 * @deprecated -> replaced by contact search combobox
 * @todo remove it!
 */
 
Ext.namespace('Tine.widgets');
Tine.widgets.GridPicker = Ext.extend(Ext.Panel, {
    /**
     * @cfg {Int} pickerWidth
     */
    pickerWidth: 200,
    
    /**
     * @cfg pickerType one of 'contact', ...
     * 
     * @todo more to add
     */
    pickerType: 'contact',
    
    /**
     * @cfg{String} pickerTypeDefault - default: 'contact'
     */
    pickerTypeDefault: 'contact',    

    /**
     * @cfg{String} autoExpand columnn - default: 'n_fileas'
     */
    autoExpand: 'n_fileas',    
    
    /**
     * @cfg {String} title for the record list
     */
    recordListTitle: '',
    
    /**
     * @cfg {Ext.data.JsonStore} gridStore
     */
    gridStore: null,
    
    /**
     * @cfg {Ext.grid.ColumnModel} columnModel
     */
    columnModel: null,    
    
    /**
     * @cfg {array} bbarItems
     */
    bbarItems: [],

    /**
     * @cfg {Array} Array of column's config objects where the config options are in
     */
    configColumns: [],
    
    picker: null,
    gridPanel: null,
    
    layout: 'border',
    border: false,

    /**
     * @private
     */
    initComponent: function(){
        this.action_removeRecord = new Ext.Action({
            text: _('remove record'),
            disabled: true,
            scope: this,
            handler: this.removeRecord,
            iconCls: 'action_deleteContact'
        });
    	
        this.gridStore.sort(this.recordPrefix + 'name', 'asc');
                
        /* picker */
        this.picker = new Tine.widgets.PickerPanel({
            selectType: this.pickerType,
            selectTypeDefault: this.pickerTypeDefault,
            enableBbar: true
        });
        this.picker.on('recorddblclick', function(record){
            this.addRecord(record);   
        }, this);
                
        /* selection model */
        var rowSelectionModel = new Ext.grid.RowSelectionModel({
            multiSelect:true
        });
        
        rowSelectionModel.on('selectionchange', function(selectionModel) {
            this.action_removeRecord.setDisabled(selectionModel.getCount() < 1);
        }, this);
        
        // add bbarItems
        // @todo use each() here?
        var gridBbarItems = [ this.action_removeRecord ];
        gridBbarItems.push(this.bbarItems);
                
        /* grid panel */
        this.gridPanel = new Ext.grid.EditorGridPanel({
            title: this.recordListTitle,
            store: this.gridStore,
            cm: this.columnModel,
            autoSizeColumns: false,
            selModel: rowSelectionModel,
            enableColLock:false,
            loadMask: true,
            plugins: this.configColumns,
            autoExpandColumn: this.autoExpand,
            bbar: gridBbarItems,
            border: false
        });
        
        this.items = this.getGridLayout();
        
        Tine.widgets.GridPicker.superclass.initComponent.call(this);
        /*
        this.on('afterlayout', function(container){
            var height = container.ownerCt.getSize().height;
            this.setHeight(height);
            this.items.each(function(item){
                item.setHeight(height);
            });
        },this);
        */
    },
    
    /**
     * @private Layout
     */
    getGridLayout: function() {
        return [{
            layout: 'fit',
            region: 'west',
            border: false,
            split: true,
            width: this.pickerWidth,
            items: this.picker
        },{
            layout: 'fit',
            region: 'center',
            border: false,
            items: this.gridPanel
        }];
    },
    
    /**
     * add given record to this.configStore
     * 
     * @param {Tine.model.record}
     */
    addRecord: function(record) {
        var recordIndex = this.getRecordIndex(record);
        if (recordIndex === -1) {
            var newRecord = {};
            newRecord = record.data.data;
            newRecord.relation_type = 'customer';
            
            var newData = [newRecord];
        	            
        	//console.log(newData);
        	
        	this.gridStore.loadData(newData, true);
        	
        	//console.log(this.gridStore);
        }
        this.gridPanel.getSelectionModel().selectRow(this.getRecordIndex(record));
    },
    
    /**
     * removes currently in this.configGridPanel selected rows
     */    
    removeRecord: function() {
        var selectedRows = this.gridPanel.getSelectionModel().getSelections();
        for (var i = 0; i < selectedRows.length; ++i) {
            this.gridStore.remove(selectedRows[i]);
        }
    },
    
    /**
     * returns index of given record in this.configStore
     * 
     * @param {Ext.data.Record}
     */
    getRecordIndex: function(record) {

    	return id ? this.gridStore.indexOfId(record.data.id) : false;
    	
    	/*
        var id = false;
        this.configStore.each(function(item){
            if ( item.data[this.recordPrefix + 'type'] == 'user' && record.data.type == 'user' &&
                    item.data[this.recordPrefix + 'id'] == record.data.id) {
                id = item.id;
            } else if (item.data[this.recordPrefix + 'type'] == 'group' && record.data.type == 'group' &&
                    item.data[this.recordPrefix + 'id'] == record.data.id) {
                id = item.id;
            }
        }, this);
        return id ? this.configStore.indexOfId(id) : false;
        */
    }
    
});

/**
 * Record picker panel
 * 
 * @class Tine.widgets.PickerPanel
 * @package Tinebase
 * @subpackage Widgets
 * @extends Ext.TabPanel
 * 
 * <p> This widget supplies a picker panel to be used in related widgets.</p>
 */
 
Tine.widgets.PickerPanel = Ext.extend(Ext.TabPanel, {
    /**
     * @cfg {String} one of 'contact'
     * selectType
     */
    selectType: 'contact',
    
    /**
     * @cfg {Ext.Action}
     * selectAction
     */
    selectAction: false,

    /**
     * @cfg {bool}
     * multiSelect
     */
    multiSelect: false,
    
    /**
     * @cfg {bool}
     * enable bottom toolbar
     */
    enableBbar: true,
    
    /**
     * @cfg {Ext.Toolbar}
     * optional bottom bar, defaults to 'add record' which fires 'recorddblclick' event
     */ 
    bbar: null,
        
    /**
     * @cfg {string}
     * request method
     */ 
    requestMethod: 'Addressbook.searchContacts',

    /**
     * @cfg {string}
     * request sort and display field
     */ 
    displayField: 'n_fileas',
    
    activeTab: 0,
    defaults:{autoScroll:true},
    border: true,
    split: true,
    width: 300,
    height: 300,
    collapsible: false,
    
    //private
    initComponent: function(){
        this.addEvents(
            /**
             * @event recorddblclick
             * Fires when an record is dbl clicked
             * @param {Ext.Record} dbl clicked record
             */
            'recorddblclick',
            /**
             * @event recordselectionchange
             * Fires when record selection changes
             * @param {Ext.Record} dbl clicked record or undefined if none
             */
            'recordselectionchange'
        );
        
        this.actions = {
            addRecord: new Ext.Action({
                text: 'add record',
                disabled: false,
                scope: this,
                handler: function(){
                    var record = this.searchPanel.getSelectionModel().getSelected();
                    this.fireEvent('recorddblclick', record);
                },
                // @todo add the right icon
                iconCls: 'action_addContact'
            })
        };

        this.ugStore = new Ext.data.SimpleStore({
            //fields: this.recordModel
        	fields: Tine.Tinebase.PickerRecord
        });
        
        this.ugStore.setDefaultSort(this.displayField, 'asc');
        
        // get search data
        this.loadData = function() {
            var searchString = Ext.getCmp('Tinebase_Records_SearchField').getRawValue();
            
            if (this.requestParams && this.requestParams.filter.query == searchString || searchString.length < 1) {
                return;
            }
            this.requestParams = { 
                method: this.requestMethod,
                filter: Ext.util.JSON.encode([{
                    operator: 'contains',
                    field: 'query',
                    value: searchString
                }, {
                    field: 'containerType', 
                    operator: 'equals', 
                    value: 'all' 
                }]),
                paging: Ext.util.JSON.encode({
                    dir: 'asc', 
                    start: 0, 
                    limit: 50,
                    sort: this.displayField
                }) 
            };

            Ext.getCmp('Tinebase_Records_Grid').getStore().removeAll();
                        
            Ext.Ajax.request({
                params: this.requestParams,
                success: function(response, options){
                    var data = Ext.util.JSON.decode(response.responseText);
                    var toLoad = [];
                    for (var i=0; i<data.results.length; i++){                        
                        var item = (data.results[i]);
                        toLoad.push(new Tine.Tinebase.PickerRecord({
                            id: item.id,
                            name: item.n_fileas,
                            data: item
                        }));
                    }
                    if (toLoad.length > 0) {
                        var grid = Ext.getCmp('Tinebase_Records_Grid');
                        
                        grid.getStore().add(toLoad);
                        
                        //console.log(grid.getStore());
                        
                        // select first result and focus row
                        grid.getSelectionModel().selectFirstRow();                                
                        grid.getView().focusRow(0);
                    }
                }
            });
        };
        
        var columnModel = new Ext.grid.ColumnModel([
            {
                resizable: false,
                sortable: false, 
                id: 'name', 
                header: 'Name', 
                dataIndex: 'name', 
                width: 70
            }
        ]);
        
        //columnModel.defaultSortable = true; // by default columns are sortable
        
        this.quickSearchField = new Ext.ux.SearchField({
            id: 'Tinebase_Records_SearchField',
            emptyText: _('enter searchfilter')
        }); 
        this.quickSearchField.on('change', function(){
            this.loadData();
        }, this);
                
        this.Toolbar = new Ext.Toolbar({
            items: [
                this.quickSearchField
            ]
        });
        
        if (this.enableBbar && !this.bbar) {
            this.bbar = new Ext.Toolbar({
                items: [this.actions.addRecord]
            });
        }
        
        //console.log(this.bbar);

        this.searchPanel = new Ext.grid.GridPanel({
            title: _('Search'),
            id: 'Tinebase_Records_Grid',
            store: this.ugStore,
            cm: columnModel,
            enableColumnHide:false,
            enableColumnMove:false,
            autoSizeColumns: false,
            selModel: new Ext.grid.RowSelectionModel({multiSelect:this.multiSelect}),
            enableColLock:false,
            loadMask: true,
            autoExpandColumn: 'name',
            tbar: this.Toolbar,
            //bbar: this.bbar,
            border: false
        });
        
        this.searchPanel.on('rowdblclick', function(grid, row, event) {
            var record = this.searchPanel.getSelectionModel().getSelected();
            this.fireEvent('recorddblclick', record);
        }, this);
        
        // on keypressed("enter") event to add record
        this.searchPanel.on('keydown', function(event){
             if(event.getKey() == event.ENTER){
                var record = this.searchPanel.getSelectionModel().getSelected();
                this.fireEvent('recorddblclick', record);
             }
        }, this);
        
        /*
        this.searchPanel.getSelectionModel().on('selectionchange', function(sm){
            var record = sm.getSelected();
            this.actions.addRecord.setDisabled(!record);
            this.fireEvent('recordselectionchange', record);
        }, this);
        */
        
        this.items = [this.searchPanel, {
           title: _('Browse'),
           html: _('Browse'),
           disabled: true
        }];
        
        Tine.widgets.PickerPanel.superclass.initComponent.call(this);
        /*
        this.on('resize', function(){
            this.quickSearchField.setWidth(this.getSize().width - 3);
        }, this);
        */
    }
});
// file: /var/www/tine20build/tine20/Tinebase/js/widgets/ActivitiesPanel.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 */
 
Ext.namespace('Tine.widgets', 'Tine.widgets.activities');

/************************* panel *********************************/

/**
 * Class for a single activities panel
 */
Tine.widgets.activities.ActivitiesPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String} app Application which uses this panel
     */
    app: '',
    
    /**
     * @cfg
     */
    showAddNoteForm: true,
    
    /**
     * @cfg {Array} notes Initial notes
     */
    notes: [],
    
    /**
     * the translation object
     */
    translation: null,

    /**
     * @var {Ext.data.JsonStore}
     * Holds activities of the record this panel is displayed for
     */
    recordNotesStore: null,
    
    title: null,
    iconCls: 'notes_noteIcon',
    layout: 'hfit',
    bodyStyle: 'padding: 2px 2px 2px 2px',
    autoScroll: true,
    
    /**
     * event handler
     */
    handlers: {
    	
    	/**
    	 * add a new note
    	 * 
    	 */
    	addNote: function(_button, _event) { 
            //var note_type_id = Ext.getCmp('note_type_combo').getValue();
    		var note_type_id = _button.typeId;
            var noteTextarea = Ext.getCmp('note_textarea');
            var note = noteTextarea.getValue();
            
            if (note_type_id && note) {
                notesStore = Ext.StoreMgr.lookup('NotesStore');
                var newNote = new Tine.Tinebase.Model.Note({note_type_id: note_type_id, note: note});
                notesStore.insert(0, newNote);
                
                // clear textarea
                noteTextarea.setValue('');
                noteTextarea.emptyText = noteTextarea.emptyText;
            }
        }    	
    },
    
    /**
     * init activities data view
     */
    initActivitiesDataView: function()
    {
        var ActivitiesTpl = new Ext.XTemplate(
            '<tpl for=".">',
               '<div class="x-widget-activities-activitiesitem" id="{id}">',
                    '<div class="x-widget-activities-activitiesitem-text"',
                    '   ext:qtip="{[this.encode(values.note)]} - {[this.render(values.creation_time, "timefull")]} - {[this.render(values.created_by, "user")]}" >', 
                        '{[this.render(values.note_type_id, "icon")]}&nbsp;{[this.render(values.creation_time, "timefull")]}<br/>',
                        '{[this.encode(values.note)]}<hr color="#aaaaaa">',
                    '</div>',
                '</div>',
            '</tpl>' ,{
                encode: function(value) {
                    return Ext.util.Format.htmlEncode(value);
                },
                render: function(value, type) {
                    switch (type) {
                        case 'icon':
                            return Tine.widgets.activities.getTypeIcon(value);
                        case 'user':
                            if (!value) {
                                value = Tine.Tinebase.registry.map.currentAccount.accountDisplayName;
                            }
                            var username = value;
                            return '<i>' + username + '</i>';
                        case 'time':
                            if (!value) {
                                return '';
                            }
                            return value.format(Locale.getTranslationData('Date', 'medium'));
                        case 'timefull':
                            if (!value) {
                                return '';
                            }
                            return value.format(Locale.getTranslationData('Date', 'medium')) + ' ' +
                                value.format(Locale.getTranslationData('Time', 'medium'));
                    }
                }
            }
        );
        
        this.activities = new Ext.DataView({
            tpl: ActivitiesTpl,       
            id: 'grid_activities_limited',
            store: this.recordNotesStore,
            overClass: 'x-view-over',
            itemSelector: 'activities-item-small'
        }); 
    },
    
    /**
     * init note form
     * 
     */
    initNoteForm: function()
    {
        var noteTextarea =  new Ext.form.TextArea({
            id:'note_textarea',
            emptyText: this.translation._('Add a Note...'),
            grow: false,
            preventScrollbars:false,
            anchor:'100%',
            height: 55,
            hideLabel: true
        });
        
        var subMenu = [];
        var typesStore = Tine.widgets.activities.getTypesStore();
        var defaultTypeRecord = typesStore.getAt(typesStore.find('is_user_type', '1')); 
        
        typesStore.each(function(record){
        	if (record.data.is_user_type == 1) {
            	var action = new Ext.Action({
                    text: this.translation._('Add') + ' ' + this.translation._(record.data.name) + ' ' + this.translation._('Note'),
                    tooltip: this.translation._(record.data.description),
                    handler: this.handlers.addNote,
                    iconCls: 'notes_' + record.data.name + 'Icon',
                    typeId: record.data.id,
                    scope: this
                });            
                subMenu.push(action);
        	}
        }, this);
        
        var addButton = new Ext.SplitButton({
            text: this.translation._('Add'),
            tooltip: this.translation._('Add new note'),
            iconCls: 'action_saveAndClose',
            menu: {
                items: subMenu
            },
            handler: this.handlers.addNote,
            typeId: defaultTypeRecord.data.id
        });

        this.formFields = {
            layout: 'form',
            items: [
                noteTextarea
            ],
            bbar: [
                '->',
                addButton
            ]
        };
    },

    /**
     * @private
     */
    initComponent: function(){
    	
        // get translations
        this.translation = new Locale.Gettext();
        this.translation.textdomain('Tinebase');
        
        // translate / update title
        this.title = this.translation._('Notes');
        
        // init recordNotesStore
        this.notes = [];
        this.recordNotesStore = new Ext.data.JsonStore({
            id: 'id',
            fields: Tine.Tinebase.Model.Note,
            data: this.notes,
            sortInfo: {
            	field: 'creation_time',
            	direction: 'DESC'
            }
        });
        
        Ext.StoreMgr.add('NotesStore', this.recordNotesStore);        
        
        // set data view with activities
        this.initActivitiesDataView();
        
        if (this.showAddNoteForm) {
            // set add new note form
            this.initNoteForm();
                
            this.items = [
                this.formFields,
                // this form field is only for fetching and saving notes in the record
                new Tine.widgets.activities.NotesFormField({                    
                    recordNotesStore: this.recordNotesStore
                }),                 
                this.activities
            ];
        } else {
            this.items = [
                new Tine.widgets.activities.NotesFormField({                    
                    recordNotesStore: this.recordNotesStore
                }),                 
                this.activities
            ];        	
        }
        
        Tine.widgets.activities.ActivitiesPanel.superclass.initComponent.call(this);
    }      
});

/************************* add note button ***************************/

/**
 * button for adding notes
 * 
 */
Tine.widgets.activities.ActivitiesAddButton = Ext.extend(Ext.SplitButton, {

    iconCls: 'notes_noteIcon',

    /**
     * event handler
     */
    handlers: {
        
        /**
         * add a new note (show prompt)
         */
        addNote: function(_button, _event) {
            Ext.Msg.prompt(
                this.translation._('Add Note'),
                this.translation._('Enter new note:'), 
                function(btn, text) {
                    if (btn == 'ok'){
                        this.handlers.onNoteAdd(text, _button.typeId);
                    }
                }, 
                this,
                40 // height of input area
            );            
        },       
        
        /**
         * on add note
         * - add note to activities panel
         */
        onNoteAdd: function(_text, _typeId) {
            if (_text && _typeId) {
                notesStore = Ext.StoreMgr.lookup('NotesStore');
                var newNote = new Tine.Tinebase.Model.Note({note_type_id: _typeId, note: _text});
                notesStore.insert(0, newNote);     
            }
        }
    },
    
    /**
     * @private
     */
    initComponent: function(){

        // get translations
        this.translation = new Locale.Gettext();
        this.translation.textdomain('Tinebase');

        // get types for split button
        var subMenu = [];
        var typesStore = Tine.widgets.activities.getTypesStore();
        var defaultTypeRecord = typesStore.getAt(typesStore.find('is_user_type', '1')); 
        
        typesStore.each(function(record){
            if (record.data.is_user_type == 1) {
            	
                var action = new Ext.Action({
                    requiredGrant: 'editGrant',
                    text: String.format(this.translation._('Add a {0} Note'), record.data.name),
                    tooltip: this.translation._(record.data.description),
                    handler: this.handlers.addNote,
                    //iconCls: 'notes_' + record.data.name + 'Icon',
                    iconCls: record.data.icon_class,
                    typeId: record.data.id,
                    scope: this
                });            
                subMenu.push(action);
            }
        }, this);
        
        this.requiredGrant = 'editGrant';
        this.text = this.translation._('Add Note');
        this.tooltip = this.translation._('Add new note');
        this.menu = {
            items: subMenu
        };
        this.handler = this.handlers.addNote;
        this.typeId = defaultTypeRecord.data.id;
        
        Tine.widgets.activities.ActivitiesAddButton.superclass.initComponent.call(this);
    }
});
Ext.reg('widget-activitiesaddbutton', Tine.widgets.activities.ActivitiesAddButton);

/************************* tab panel *********************************/

/**
 * Class for a activities tab with notes/activities grid
 * 
 * TODO add more filters to filter toolbar
 */
Tine.widgets.activities.ActivitiesTabPanel = Ext.extend(Ext.Panel, {

    /**
     * @cfg {String} app Application which uses this panel
     */
    app: '',
    
    /**
     * @var {Ext.data.JsonStore}
     * Holds activities of the record this panel is displayed for
     */
    store: null,
    
    /**
     * the translation object
     */
    translation: null,

    /**
     * @cfg {Object} paging defaults
     */
    paging: {
        start: 0,
        limit: 20,
        sort: 'creation_time',
        dir: 'DESC'
    },

    /**
     * the record id
     */
    record_id: null,
    
    /**
     * the record model
     */
    record_model: null,
    
    /**
     * other config options
     */
	title: null,
	layout: 'fit',
    
    getActivitiesGrid: function() 
    {
        // @todo add row expander on select ?
    	// @todo add context menu ?
    	// @todo add buttons ?    	
    	// @todo add more renderers ?
    	
        // the columnmodel
        var columnModel = new Ext.grid.ColumnModel([
            { resizable: true, id: 'note_type_id', header: this.translation._('Type'), dataIndex: 'note_type_id', width: 15, 
                renderer: Tine.widgets.activities.getTypeIcon },
            { resizable: true, id: 'note', header: this.translation._('Note'), dataIndex: 'note'},
            { resizable: true, id: 'created_by', header: this.translation._('Created By'), dataIndex: 'created_by', width: 70},
            { resizable: true, id: 'creation_time', header: this.translation._('Timestamp'), dataIndex: 'creation_time', width: 50, 
                renderer: Tine.Tinebase.common.dateTimeRenderer }
        ]);

        columnModel.defaultSortable = true; // by default columns are sortable
        
        // the rowselection model
        var rowSelectionModel = new Ext.grid.RowSelectionModel({multiSelect:true});

        // the paging toolbar
        var pagingToolbar = new Ext.PagingToolbar({
            pageSize: 20,
            store: this.store,
            displayInfo: true,
            displayMsg: this.translation._('Displaying history records {0} - {1} of {2}'),
            emptyMsg: this.translation._("No history to display")
        }); 

        // the gridpanel
        var gridPanel = new Ext.grid.GridPanel({
            id: 'Activities_Grid',
            store: this.store,
            cm: columnModel,
            tbar: pagingToolbar,     
            selModel: rowSelectionModel,
            border: false,                  
            //autoExpandColumn: 'note',
            //enableColLock:false,
            //autoHeight: true,
            //loadMask: true,            
            view: new Ext.grid.GridView({
                autoFill: true,
                forceFit:true,
                ignoreAdd: true,
                autoScroll: true
            })            
        });
        
        return gridPanel;    	
    },
    
    /**
     * init the contacts json grid store
     */
    initStore: function(){

        this.store = new Ext.data.JsonStore({
            id: 'id',
            autoLoad: false,
            root: 'results',
            totalProperty: 'totalcount',
            fields: Tine.Tinebase.Model.Note,
            remoteSort: true,
            baseParams: {
                method: 'Tinebase.searchNotes'
            },
            sortInfo: {
                field: this.paging.sort,
                direction: this.paging.dir
            }
        });
        
        // register store
        Ext.StoreMgr.add('NotesGridStore', this.store);
        
        // prepare filter
        this.store.on('beforeload', function(store, options){
            if (!options.params) {
                options.params = {};
            }
            
            // paging toolbar only works with this properties in the options!
            options.params.sort  = store.getSortState() ? store.getSortState().field : this.paging.sort;
            options.params.dir   = store.getSortState() ? store.getSortState().direction : this.paging.dir;
            options.params.start = options.params.start ? options.params.start : this.paging.start;
            options.params.limit = options.params.limit ? options.params.limit : this.paging.limit;
            
            options.params.paging = Ext.util.JSON.encode(options.params);
            
            var filterToolbar = Ext.getCmp('activitiesFilterToolbar');
            var filter = filterToolbar ? filterToolbar.getValue() : [];
            filter.push(
                {field: 'record_model', operator: 'equals', value: this.record_model },
                {field: 'record_id', operator: 'equals', value: (this.record_id) ? this.record_id : 0 },
                {field: 'record_backend', operator: 'equals', value: 'Sql' }
            );
                        
            options.params.filter = Ext.util.JSON.encode(filter);
        }, this);
        
        // add new notes from notes store
        this.store.on('load', function(store, operation) {
        	notesStore = Ext.StoreMgr.lookup('NotesStore');
        	notesStore.each(function(note){
        		if (!note.data.creation_time) {
                    store.insert(0, note);   
        		}
            });        	
        }, this);
                        
        //this.store.load({});
    },

    /**
     * @private
     */
    initComponent: function(){
    	
    	// get translations
    	this.translation = new Locale.Gettext();
        this.translation.textdomain('Tinebase');
        
        // translate / update title
        this.title = this.translation._('History');
        
    	// get store
        this.initStore();

        // get grid
        this.activitiesGrid = this.getActivitiesGrid();
        
        // the filter toolbar
        var filterToolbar = new Tine.widgets.grid.FilterToolbar({
            id : 'activitiesFilterToolbar',
            filterModels: [
                {label: this.translation._('Note'), field: 'query',         operators: ['contains']},
                //{label: this.translation._('Time'), field: 'creation_time', operators: ['contains']}
                {label: this.translation._('Time'), field: 'creation_time', valueType: 'date', pastOnly: true}
                // user search is note working yet -> see NoteFilter.php
                //{label: this.translation._('User'), field: 'created_by', defaultOperator: 'contains'},
                // type search isn't implemented yet
                //{label: this.translation._('Type'), field: 'note_type_id', defaultOperator: 'contains'}
             ],
             defaultFilter: 'query',
             filters: []
        });
        
        filterToolbar.on('change', function() {
            this.store.load({});
        }, this);
                                                
        this.items = [        
            new Ext.Panel({
                layout: 'fit',
                tbar: filterToolbar,
                items: this.activitiesGrid
            })
        ];
                
        // load store on activate
        this.on('activate', function(panel){
            panel.store.load({});
        });
        
        Tine.widgets.activities.ActivitiesTabPanel.superclass.initComponent.call(this);
    }
});

/************************* helper *********************************/

/**
 * @private Helper class to have activities processing in the standard form/record cycle
 */
Tine.widgets.activities.NotesFormField = Ext.extend(Ext.form.Field, {
    /**
     * @cfg {Ext.data.JsonStore} recordNotesStore a store where the record notes are in.
     */
    recordNotesStore: null,
    
    name: 'notes',
    hidden: true,
    hideLabel: true,
    
    /**
     * @private
     */
    initComponent: function() {
        Tine.widgets.activities.NotesFormField.superclass.initComponent.call(this);
        this.hide();
    },
    /**
     * returns notes data of the current record
     */
    getValue: function() {
        var value = [];
        this.recordNotesStore.each(function(note){
        	value.push(note.data);
        });
        return value;
    },
    /**
     * sets notes from an array of note data objects (not records)
     */
    setValue: function(value){
        this.recordNotesStore.loadData(value);
    }

});

/**
 * get note / activities types store
 * if available, load data from initial data
 * 
 * @return Ext.data.JsonStore with activities types
 * 
 * @todo translate type names / descriptions
 */
Tine.widgets.activities.getTypesStore = function() {
    var store = Ext.StoreMgr.get('noteTypesStore');
    if (!store) {
        store = new Ext.data.JsonStore({
            fields: Tine.Tinebase.Model.NoteType,
            baseParams: {
                method: 'Tinebase.getNoteTypes'
            },
            root: 'results',
            totalProperty: 'totalcount',
            id: 'id',
            remoteSort: false
        });
        /*if (Tine.Tinebase.registry.get('NoteTypes')) {
            store.loadData(Tine.Tinebase.registry.get('NoteTypes'));
        } else*/ if (Tine.Tinebase.registry.get('NoteTypes')) {
            store.loadData(Tine.Tinebase.registry.get('NoteTypes'));
        }
        Ext.StoreMgr.add('noteTypesStore', store);
    }
    
    return store;
};

/**
 * get type icon
 * 
 * @param   id of the note type record
 * @returns img tag with icon source
 * 
 * @todo use icon_class here
 */
Tine.widgets.activities.getTypeIcon = function(id) {	
    var typesStore = Tine.widgets.activities.getTypesStore();
    var typeRecord = typesStore.getById(id);
    if (typeRecord) {
        return '<img src="' + typeRecord.data.icon + '" ext:qtip="' + typeRecord.data.description + '"/>';
    } else {
    	return '';
    }
};

// file: /var/www/tine20build/tine20/Tinebase/js/data/Record.js
/*
 * Tine 2.0
 * 
 * @package     Tine
 * @subpackage  Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 */
 
Ext.ns('Tine.Tinebase', 'Tine.Tinebase.data');

Tine.Tinebase.data.Record = function(data, id){
    if (id || id === 0) {
        this.id = id;
    } else if (data[this.idProperty]) {
        this.id = data[this.idProperty];
    } else {
        this.id = ++Ext.data.Record.AUTO_ID;
    }
    this.data = data;
};

/**
 * @class Tine.Tinebase.data.Record
 * @extends {Ext.data.Record}
 */
Ext.extend(Tine.Tinebase.data.Record, Ext.data.Record, {
    /**
     * @cfg {String} appName
     * internal/untranslated app name (required)
     */
    appName: null,
    /**
     * @cfg {String} modelName
     * name of the model/record  (required)
     */
    modelName: null,
    /**
     * @cfg {String} idProperty
     * property of the id of the record
     */
    idProperty: 'id',
    /**
     * @cfg {String} titleProperty
     * property of the title attibute, used in generic getTitle function  (required)
     */
    titleProperty: null,
    /**
     * @cfg {String} recordName
     * untranslated record/item name
     */
    recordName: 'record',
    /**
     * @cfg {String} recordName
     * untranslated records/items (plural) name
     */
    recordsName: 'records',
    /**
     * @cfg {String} containerProperty
     * name of the container property
     */
    containerProperty: 'container_id',
    /**
     * @cfg {String} containerName
     * untranslated container name
     */
    containerName: 'container',
    /**
     * @cfg {string} containerName
     * untranslated name of container (plural)
     */
    containersName: 'containers',
    
    /**
     * returns title of this record
     * 
     * @return {String}
     */
    getTitle: function() {
        return this.titleProperty ? this.get(this.titleProperty) : '';
    }    
});

/**
 * Generate a constructor for a specific Record layout.
 * 
 * @param {Array} def see {@link Ext.data.Record#create}
 * @param {Object} meta information see {@link Tine.Tinebase.data.Record}
 * 
 * <br>usage:<br>
<b>IMPORTANT: the ngettext comments are required for the translation system!</b>
<pre><code>
var TopicRecord = Tine.Tinebase.data.Record.create([
    {name: 'summary', mapping: 'topic_title'},
    {name: 'details', mapping: 'username'}
], {
    appName: 'Tasks',
    modelName: 'Task',
    idProperty: 'id',
    titleProperty: 'summary',
    // ngettext('Task', 'Tasks', n);
    recordName: 'Task',
    recordsName: 'Tasks',
    containerProperty: 'container_id',
    // ngettext('to do list', 'to do lists', n);
    containerName: 'to do list',
    containesrName: 'to do lists'
});
</code></pre>
 */
Tine.Tinebase.data.Record.create = function(o, meta) {
    var f = Ext.extend(Tine.Tinebase.data.Record, {});
    var p = f.prototype;
    Ext.apply(p, meta);
    p.fields = new Ext.util.MixedCollection(false, function(field){
        return field.name;
    });
    for(var i = 0, len = o.length; i < len; i++){
        p.fields.add(new Ext.data.Field(o[i]));
    }
    f.getField = function(name){
        return p.fields.get(name);
    };
    f.getMeta = function(name) {
        return p[name];
    };
    f.getDefaultData = function() {
        return {};
    };

    return f;
};
// file: /var/www/tine20build/tine20/Tinebase/js/data/AbstractBackend.js
/*
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  data
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Tine.Tinebase.data');

/**
 * Abstract Backdend for an model/datatype of an application
 * 
 * @class Tine.Tinebase.data.AbstractBackend
 * @extends Ext.data.DataProxy
 * @constructor 
 */
Tine.Tinebase.data.AbstractBackend = function(config) {
    Tine.Tinebase.data.AbstractBackend.superclass.constructor.call(this);
    Ext.apply(this, config);
};

Ext.extend(Tine.Tinebase.data.AbstractBackend, Ext.data.DataProxy, {
    /**
     * @cfg {String} appName
     * internal/untranslated app name (required)
     */
    appName: null,
    /**
     * @cfg {String} modelName
     * name of the model/record  (required)
     */
    modelName: null,
    /**
     * @cfg {Ext.data.Record} recordClass
     * record definition class  (required)
     */
    recordClass: null,
    /**
     * @cfg {String} idProperty
     * property of the id of the record
     */
    idProperty: 'id',
    
    /**
     * loads a single 'full featured' record
     * 
     * @param   {Ext.data.Record} record
     * @param   {Object} options
     * @return  {Number} Ext.Ajax transaction id
     * @success {Ext.data.Record}
     */
    loadRecord: function(record, options) {
        options.success.defer(1000, options.scope, record);
    },
    
    /**
     * searches all (lightweight) records matching filter
     * 
     * @param   {Object} filter
     * @param   {Object} paging
     * @param   {Object} options
     * @return  {Number} Ext.Ajax transaction id
     * @success {Object} root:[recrods], totalcount: number
     */
    searchRecords: function(filter, paging, options) {
        options.success.defer(1000, options.scope, [{records: [], success: 1, totalRecords: 0}]);
    },
    
    /**
     * saves a single record
     * 
     * @param   {Ext.data.Record} record
     * @param   {Object} options
     * @return  {Number} Ext.Ajax transaction id
     * @success {Ext.data.Record}
     */
    saveRecord: function(record, options) {
        record.commit(true);
        options.success.defer(1000, options.scope, [record]);
    },
    
    /**
     * deletes multiple records identified by their ids
     * 
     * @param   {Array} records Array of records or ids
     * @param   {Object} options
     * @return  {Number} Ext.Ajax transaction id
     * @success 
     */
    deleteRecords: function(records, options) {
        options.success.defer(1000, options.scope);
    },
    
    /**
     * updates multiple records with the same data
     * 
     * @param   {Array} filter filter data
     * @param   {Object} updates
     * @return  {Number} Ext.Ajax transaction id
     * @success
     */
    updateRecords: function(filter, updates, options) {
        options.success.defer(1000, options.scope, []);
    },
    
    /**
     * returns an array of ids
     * 
     * @private 
     * @param  {Ext.data.Record|Array}
     * @return {Array} of ids
     */
    getRecordIds : function(records) {
        var ids = [];
        
        if (! Ext.isArray(records)) {
            records = [records];
        }
        
        for (var i=0; i<records.length; i++) {
            ids.push(records[i].id ? records[i].id : records.id);
        }
        
        return ids;
    },
    
    /**
     * reqired method for Ext.data.Proxy, used by store
     * @todo read the specs and implement success/fail handling
     * @todo move reqest to searchRecord
     */
    load : function(params, reader, callback, scope, arg){
        if(this.fireEvent("beforeload", this, params) !== false){
            
            // move paging to own object
            var paging = {
                sort:  params.sort,
                dir:   params.dir,
                start: params.start,
                limit: params.limit
            };
            
            this.searchRecords(params.filter, paging, {
                scope: this,
                success: function(records) {
                    callback.call(scope||this, records, arg, true);
                }
            });
            
        } else {
            callback.call(scope||this, null, arg, false);
        }
    },
    
    /**
     * returns reader
     * 
     * @return {Ext.data.DataReader}
     */
    getReader: function() {
        
    },
    
    
    /**
     * is request still loading?
     * 
     * @param  {Number} Ext.Ajax transaction id
     * @return {Bool}
     */
    isLoading: function(tid) {
        
    }
    
});

// file: /var/www/tine20build/tine20/Tinebase/js/ExceptionDialog.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
 Ext.namespace('Tine', 'Tine.Tinebase');
 
Tine.Tinebase.ExceptionDialog = Ext.extend(Ext.Window, {
    
    width: 400,
    height: 600,
    xtype: 'panel',
    layout: 'fit',
    plain: true,
    closeAction: 'close',
    autoScroll: true,
    releaseMode: true,
    
    
    initComponent: function() {
        this.currentAccount = Tine.Tinebase.registry.get('currentAccount');
        
        // check if we have the version in registry (is not the case in the setup)
        if(! Tine.Tinebase.registry.get('version') || Tine.Tinebase.registry.get('version').buildType != 'RELEASE') {
            this.releaseMode = false;
            this.width = 800;
        }
        var trace = '';
        if (this.exceptionInfo.trace) {
            for (var i=0,j=this.exceptionInfo.trace.length; i<j; i++) {
                trace += (this.exceptionInfo.trace[i].file ? this.exceptionInfo.trace[i].file : '[internal function]') +
                         (this.exceptionInfo.trace[i].line ? '(' + this.exceptionInfo.trace[i].line + ')' : '') + ': ' +
                         (this.exceptionInfo.trace[i]['class'] ? '<b>' + this.exceptionInfo.trace[i]['class'] + this.exceptionInfo.trace[i].type + '</b>' : '') +
                         '<b>' + this.exceptionInfo.trace[i]['function'] + '</b>' +
                        '(' + ((this.exceptionInfo.trace[i].args && this.exceptionInfo.trace[i].args[0]) ? this.exceptionInfo.trace[i].args[0] : '') + ')<br/>';
            }
            
            this.exceptionInfo.traceHTML = trace;
        }
        
        this.title = _('Abnormal End');
        this.items = new Ext.FormPanel({
                id: 'tb-exceptiondialog-frompanel',
                bodyStyle: 'padding:5px;',
                buttonAlign: 'right',
                labelAlign: 'top',
                autoScroll: true,
                buttons: [{
                    text: _('Cancel'),
                    iconCls: 'action_cancel',
                    scope: this,
                    enabled: Tine.Tinebase.common.hasRight('report_bugs', 'Tinebase'),
                    handler: function() {
                        this.close();
                    }
                }, {
                    text: _('Send Report'),
                    iconCls: 'action_saveAndClose',
                    scope: this,
                    handler: this.onSendReport
                }],
                items: [{
                    xtype: 'panel',
                    border: false,
                    html: '<div class="tb-exceptiondialog-text">' + 
                              '<p>' + _('An error occurred, the program ended abnormal.') + '</p>' +
                              '<p>' + _('The last action you made was potentially not performed correctly.') + '</p>' +
                              '<p>' + _('Please help improving this software and notify the vendor. Include a brief description of what you where doing when the error occurred.') + '</p>' + 
                          '</div>'
                }, {
                    id: 'tb-exceptiondialog-description',
                    height: 60,
                    xtype: 'textarea',
                    fieldLabel: _('Description'),
                    name: 'description',
                    anchor: '95%',
                    readOnly: false
                }, {
                    xtype: 'fieldset',
                    id: 'tb-exceptiondialog-send-contact',
                    anchor: '95%',
                    title: _('Send Contact Information'),
                    autoHeight: true,
                    checkboxToggle: true,
                    items: [{
                        id: 'tb-exceptiondialog-contact',
                        xtype: 'textfield',
                        hideLabel: true,
                        anchor: '100%',
                        name: 'contact',
                        value: this.currentAccount.accountFullName + ' ' + this.currentAccount.accountEmailAddress
                    }]
                }, {
                    xtype: 'panel',
                    width: '95%',
                    layout: 'form',
                    collapsible: true,
                    collapsed: this.releaseMode,
                    title: _('Details:'),
                    defaults: {
                        xtype: 'textfield',
                        readOnly: true,
                        anchor: '95%'
                    },
                    html:  '<div class="tb-exceptiondialog-details">' +
                                '<p class="tb-exceptiondialog-msg">' + this.exceptionInfo.msg + '</p>' +
                                '<p class="tb-exceptiondialog-trace">' + this.exceptionInfo.traceHTML + '</p>' +
                           '</div>'
                }]
        });
        
        Tine.Tinebase.ExceptionDialog.superclass.initComponent.call(this);
    },
    
    /**
     * send the report to tine20.org bugracker
     * 
     * NOTE: due to same domain policy, we need to send data via a img get request
     * @private
     */
    onSendReport: function() {
        Ext.MessageBox.wait(_('Sending report...'), _('Please wait a moment'));
        var baseUrl = 'http://www.tine20.org/bugreport.php';
        var hash = this.generateHash();

        var info = {
           msg: this.exceptionInfo,
           description: Ext.getCmp('tb-exceptiondialog-description').getValue(),
           clientVersion: Tine.clientVersion,
           serverVersion: (Tine.Tinebase.registry.get('version')) ? Tine.Tinebase.registry.get('version') : {}
        };
        
        // tinebase version
        Ext.each(Tine.Tinebase.registry.get('userApplications'), function(app) {
            if (app.name == 'Tinebase') {
                info.tinebaseVersion = app;
                return false;
            }
        }, this);
        
        // append contact?
        if (! Ext.getCmp('tb-exceptiondialog-send-contact').collapsed) {
            info.contact = Ext.getCmp('tb-exceptiondialog-contact').getValue();
        }
        
        // NOTE:  - we have about 80 chars overhead (url, paramnames etc) in each request
        //        - 1024 chars are expected to be pass client/server limits savely => 940
        //        - base64 means about 30% overhead => 600 
        var chunks = this.strChunk(Ext.util.JSON.encode(info), 600);
        
        var img = [];
        for (var i=0;i<chunks.length;i++) {
            var part = i+1 + '/' + chunks.length;
            var data = {data : this.base64encode('hash=' + hash + '&part=' + part + '&data=' + chunks[i])};
            
            var url = baseUrl + '?' + Ext.urlEncode(data);
            img.push(Ext.DomHelper.insertFirst(this.el, {tag: 'img', src: url, hidden: true}, true));
        }
        
        window.setTimeout(this.showTransmissionCompleted, 4000);
        
        this.close();
    },
    showTransmissionCompleted: function() {
        Ext.MessageBox.show({
            title: _('Transmission Completed'),
            msg: _('Your report has been sent. Thanks for your contribution') + '<br /><b>' + _('Please restart your browser now!') + '</b>',
            buttons: Ext.MessageBox.OK,
            icon: Ext.MessageBox.INFO
        });
    },
    /**
     * @private
     */
    strChunk: function(str, chunklen) {
        var chunks = [];
        
        var numChunks = Math.ceil(str.length / chunklen);
        for (var i=0;i<str.length; i+=chunklen) {
            chunks.push(str.substr(i,chunklen));
        }
        return chunks;
    },
    /**
     * @private
     */
    generateHash: function(){
        // if the time isn't unique enough, the addition 
        // of random chars should be
        var t = String(new Date().getTime()).substr(4);
        var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for(var i = 0; i < 4; i++){
            t += s.charAt(Math.floor(Math.random()*26));
        }
        return t;
    },
    

    /**
     * base 64 encode given string
     * @private
     */
    base64encode : function (input) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            keyStr.charAt(enc1) + keyStr.charAt(enc2) +
            keyStr.charAt(enc3) + keyStr.charAt(enc4);

        }

        return output;
    }

});
// file: /var/www/tine20build/tine20/Tinebase/js/Container.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */

Ext.namespace('Tine.Tinebase.container');

/**
 * Tinebase container class
 * 
 * @todo add generic container model
 * @todo internal cache (store)
 */
Tine.Tinebase.container = {
    /**
     * constant for no grants
     */
    GRANT_NONE: 0,
    /**
     * constant for read grant
     */
    GRANT_READ: 1,
    /**
     * constant for add grant
     */
    GRANT_ADD: 2,
    /**
     * constant for edit grant
     */
    GRANT_EDIT: 4,
    /**
     * constant for delete grant
     */
    GRANT_DELETE: 8,
    /**
     * constant for admin grant
     */
    GRANT_ADMIN: 16,
    /**
     * constant for all grants
     */
    GRANT_ANY: 31,
    /** 
     * type for internal contaier
     * for example the internal addressbook
     */
    TYPE_INTERNAL: 'internal',
    /**
     * type for personal containers
     */
    TYPE_PERSONAL: 'personal',
    /**
     * type for shared container
     */
    TYPE_SHARED: 'shared'
};
// file: /var/www/tine20build/tine20/Tinebase/js/Models.js
/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Tine', 'Tine.Tinebase', 'Tine.Tinebase.Model');

/**
 * @type {Array}
 * generic Record fields
 */
Tine.Tinebase.Model.genericFields = [
    { name: 'container_id', header: 'Container'                                     },
    { name: 'creation_time',      type: 'date', dateFormat: Date.patterns.ISO8601Long},
    { name: 'created_by',         type: 'int'                  },
    { name: 'last_modified_time', type: 'date', dateFormat: Date.patterns.ISO8601Long},
    { name: 'last_modified_by',   type: 'int'                  },
    { name: 'is_deleted',         type: 'boolean'              },
    { name: 'deleted_time',       type: 'date', dateFormat: Date.patterns.ISO8601Long},
    { name: 'deleted_by',         type: 'int'                  }
];
    
/**
 * Model of the tine (simple) user account
 */
Tine.Tinebase.Model.User = Ext.data.Record.create([
    { name: 'accountId' },
    { name: 'accountDisplayName' },
    { name: 'accountLastName' },
    { name: 'accountFirstName' },
    { name: 'accountFullName' },
    { name: 'contact_id' }
]);

/**
 * Model of a language
 */
Tine.Tinebase.Model.Language = Ext.data.Record.create([
    { name: 'locale' },
    { name: 'language' },
    { name: 'region' }
]);

/**
 * Model of a timezone
 */
Tine.Tinebase.Model.Timezone = Ext.data.Record.create([
    { name: 'timezone' },
    { name: 'timezoneTranslation' }
]);

/**
 * Model of a user group account
 */
Tine.Tinebase.Model.Group = Ext.data.Record.create([
    {name: 'id'},
    {name: 'name'},
    {name: 'description'}
    //{name: 'groupMembers'}
]);

/**
 * Model of a role
 */
Tine.Tinebase.Model.Role = Ext.data.Record.create([
    {name: 'id'},
    {name: 'name'},
    {name: 'description'}
]);

/**
 * Model of a generalised account (user or group)
 */
Tine.Tinebase.Model.Account = Ext.data.Record.create([
    {name: 'id'},
    {name: 'type'},
    {name: 'name'},
    {name: 'data'} // todo: throw away data
]);

/**
 * Model of a container
 */
Tine.Tinebase.Model.Container = Ext.data.Record.create([
    {name: 'id'},
    {name: 'name'},
    {name: 'type'},
    {name: 'backend'},
    {name: 'application_id'},
    {name: 'account_grants'}
]);

/**
 * Model of a grant
 */
Tine.Tinebase.Model.Grant = Ext.data.Record.create([
    {name: 'id'},
    {name: 'account_id'},
    {name: 'account_type'},
    {name: 'account_name'},
    {name: 'readGrant',   type: 'boolean'},
    {name: 'addGrant',    type: 'boolean'},
    {name: 'editGrant',   type: 'boolean'},
    {name: 'deleteGrant', type: 'boolean'},
    {name: 'adminGrant',  type: 'boolean'}
]);

/**
 * Model of a tag
 * 
 * @constructor {Ext.data.Record}
 */
Tine.Tinebase.Model.Tag = Ext.data.Record.create([
    {name: 'id'         },
    {name: 'app'        },
    {name: 'owner'      },
    {name: 'name'       },
    {name: 'type'       },
    {name: 'description'},
    {name: 'color'      },
    {name: 'occurrence' },
    {name: 'rights'     },
    {name: 'contexts'   }
]);

/**
 * Model of a PickerRecord
 * 
 * @constructor {Ext.data.Record}
 */
Tine.Tinebase.PickerRecord = Ext.data.Record.create([
    {name: 'id'}, 
    {name: 'name'}, 
    {name: 'data'}
]);

/**
 * Model of a note
 * 
 * @constructor {Ext.data.Record}
 */
Tine.Tinebase.Model.Note = Ext.data.Record.create([
    {name: 'id'             },
    {name: 'note_type_id'   },
    {name: 'note'           },
    {name: 'creation_time', type: 'date', dateFormat: Date.patterns.ISO8601Long },
    {name: 'created_by'     }
]);

/**
 * Model of a note type
 * 
 * @constructor {Ext.data.Record}
 */
Tine.Tinebase.Model.NoteType = Ext.data.Record.create([
    {name: 'id'             },
    {name: 'name'           },
    {name: 'icon'           },
    {name: 'icon_class'     },
    {name: 'description'    },
    {name: 'is_user_type'   }
]);

/**
 * Model of a customfield definition
 */
Tine.Tinebase.Model.Customfield = Ext.data.Record.create([
    { name: 'application_id' },
    { name: 'id'             },
    { name: 'model'          },
    { name: 'name'           },
    { name: 'label'          },
    { name: 'type'           },
    { name: 'length'         }
]);

/**
 * Model of a preference
 * 
 * @constructor {Ext.data.Record}
 */
Tine.Tinebase.Model.Preference = Ext.data.Record.create([
    {name: 'id'             },
    {name: 'name'           },
    {name: 'value'          },
    {name: 'type'           },
    {name: 'label'          },
    {name: 'description'    },
    {name: 'options'        }
]);

/**
 * Model of an alarm
 * 
 * @constructor {Ext.data.Record}
 */
Tine.Tinebase.Model.Alarm = Ext.data.Record.create([
    {name: 'id'             },
    {name: 'record_id'      },
    {name: 'model'          },
    {name: 'alarm_time'     },
    {name: 'minutes_before' },
    {name: 'sent_time'      },
    {name: 'sent_status'    },
    {name: 'sent_message'   },
    {name: 'options'        }
]);

// file: /var/www/tine20build/tine20/Tinebase/js/Application.js
/*
 * Tine 2.0
 * 
 * @package     Tine
 * @subpackage  Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 */
 
Ext.ns('Tine.Tinebase');

/**
 * @class Tine.Tinebase.Application
 * @extends Ext.util.Observable
 * @consturctor
 * <p>Abstract base class for all Tine applications</p>
 */
Tine.Tinebase.Application = function(config) {
    config = config || {};
    Ext.apply(this, config);
    
    Tine.Tinebase.Application.superclass.constructor.call(this);
    
    this.i18n = new Locale.Gettext();
    this.i18n.textdomain(this.appName);
};

Ext.extend(Tine.Tinebase.Application, Ext.util.Observable , {
    
    /**
     * @cfg {String} appName
     * untranslated application name (requierd)
     */
    appName: null,
    
    /**
     * @property {Locale.gettext} i18n
     */
    i18n: null,
    
    /**
     * returns title of this application
     * 
     * @return {String}
     */
    getTitle: function() {
        return this.i18n._(this.appName);
    },
    
    /**
     * returns iconCls of this application
     * 
     * @return {String}
     */
    getIconCls: function() {
        return this.appName + 'IconCls';
    },
    
    /**
     * returns the mainscreen of this application
     * 
     * @return {Tine.widgets.app.MainScreen}
     */
    getMainScreen: function() {
        if (!this.mainScreen) {
            this.mainScreen = new Tine[this.appName].MainScreen({
                app: this
            });
        }
        
        return this.mainScreen;
    }
});

// file: /var/www/tine20build/tine20/Tinebase/js/AppManager.js
/*
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.ns('Tine.Tinebase');

Tine.Tinebase.AppManager = function() {
    /**
     * @property {Ext.util.MixedCollection} apps
     * enabled apps
     */
    this.apps = new Ext.util.MixedCollection({});
    
    // fill this.apps with registry data
    var enabledApps = Tine.Tinebase.registry.get('userApplications');
    var app;
    for(var i=0; i<enabledApps.length; i++) {
        app = enabledApps[i];
        
        // if the app is not in the namespace, we don't initialise it
        // we don't have a Tinebase 'Application'
        if (Tine[app.name] && app.name != 'Tinebase') {
            app.appName = app.name;
            app.isInitialised = false;
            
            this.apps.add(app.appName, app);
        }
    }
};

Ext.apply(Tine.Tinebase.AppManager.prototype, {
    
    /**
     * returns an appObject
     * 
     * @param {String} appName
     * @return {Tine.Application}
     */
    get: function(appName) {
        if (! this.isEnabled(appName)) {
            return false;
        }
        
        var app = this.apps.get(appName);
        if (! app.isInitialised) {
            var appObj = this.getAppObj(app);
            appObj.isInitialised = true;
            Ext.applyIf(appObj, app);
            this.apps.replace(appName, appObj);
        }
        
        return this.apps.get(appName);
    },
    
    /**
     * returns a list of all apps for current user
     */
    getAll: function() {
        this.initAll();
        return this.apps;
    },
    
    /**
     * checks wether a given app is enabled for current user or not
     */
    isEnabled: function(appName) {
        var app = this.apps.get(appName);
        return app ? app.status == 'enabled' : false;
    },
    
    /**
     * initialises all enabled apps
     * @private
     */
    initAll: function() {
        this.apps.each(function(app) {
            this.get(app.appName);
        }, this);
    },
    
    /**
     * @private
     */
    getAppObj: function(app) {
       try{
            // legacy
            if (typeof(Tine[app.appName].getPanel) == 'function') {
                // make a legacy Tine.Application
                return this.getLegacyApp(app);
            }
            
            return typeof(Tine[app.appName].Application) == 'function' ? new Tine[app.appName].Application(app) : new Tine.Tinebase.Application(app);
            
        } catch(e) {
            console.error('Initialising of Application "' + app.appName + '" failed with the following message:' + e);
            console.warn(e);
            return false;
        }
    },
    
    /**
     * @private
     */
    getLegacyApp: function(app) {
        var appPanel = Tine[app.appName].getPanel();
        var appObj =  new Tine.Tinebase.Application(app);
        var mainScreen = new Tine.Tinebase.widgets.app.MainScreen(appObj);
        
        Ext.apply(mainScreen, {
            appPanel: appPanel,
            show: function() {
                Tine.Tinebase.MainScreen.setActiveTreePanel(appPanel, true);
                appPanel.fireEvent('beforeexpand', appPanel);
            }
        });
        Ext.apply(appObj, {
            mainScreen: mainScreen
        });
        appPanel.on('render', function(p) {
            p.header.remove();
            // additionally to removing the DOM node, we also need to reset the 
            // header class variable, as IE evals "if (this.header)" to true otherwise 
            p.header = false;
            p.doLayout();
        });
        
        return appObj;
    }
});
// file: /var/www/tine20build/tine20/Tinebase/js/AppPicker.js
/*
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  widgets
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.namespace('Tine.Tinebase');

Tine.Tinebase.AppPicker = Ext.extend(Ext.Panel, {
    
    /**
     * @cfg {Array} appPanels
     * @legacy
     * ordered list of appPanels
     */
    appPanels: [],
    /**
     * @cfg {Ext.Panel} defaultAppPanel
     * @legacy
     */
    defaultAppPanel: null,
    
    /**
     * @cfg {Ext.util.Observable} apps (required)
     */
    apps: null,
    /**
     * @cfg {String} defaultAppName (required)
     */
    defaultAppName: '',
    
    /**
     * @private
     */
    layout: 'border',
    border: false,
    
    /**
     * @private
     */
    initComponent: function() {
        this.appTitle = this.apps.get(this.defaultAppName).getTitle();
        
        this.initLayout();
        Tine.Tinebase.AppPicker.superclass.initComponent.call(this);
    },
    
    initLayout: function() {
        this.items = [{
            region: 'north',
            layout: 'fit',
            border: false,
            height: 40,
            baseCls: 'x-panel-header',
            html: '<div class ="app-panel-title">' + this.getAppTitle() + '</div>'
        }, {
            region: 'center',
            layout: 'card',
            border: false
        }, new Tine.Tinebase.AppPile({
            apps: this.apps,
            defaultAppName: this.defaultAppName,
            scope: this,
            handler: function(app) {
                this.setAppTitle(app.getTitle());
                app.getMainScreen().show();
            }})
        ];
    },
    
    setAppTitle: function(appTitle) {
        this.appTitle = appTitle;
        document.title = 'Odin 1.0 - ' + appTitle;
        this.items.get(0).body.dom.innerHTML = '<div class ="app-panel-title">' + appTitle + '</div>';
    },
    
    getAppTitle: function() {
        return this.appTitle;
    },
    
    getTreeCardPanel: function() {
        return this.items.get(1);
    }
});

Tine.Tinebase.AppPile = Ext.extend(Ext.Panel, {
    /**
     * @cfg {Ext.util.Observable} apps (required)
     */
    apps: null,
    /**
     * @cfg {String} defaultAppName (required)
     */
    defaultAppName: '',
    /**
     * @cfg {Object} scope
     * scope hander is called int
     */
    scope: null,
    /**
     * @cfg {Function} handler
     * click handler of apps
     */
    handler: null,
    
    /**
     * @private
     * @property {Object} items
     * holds internal item elements
     */
    els: {},
    
    /**
     * @private
     */
    border: false,
    split: true,
    width: 200,
    collapsible:true,
    collapseMode: 'mini',
    region: 'south',
    layout: 'fit',
    autoScroll: true,
    
    /**
     * @private
     * @todo: register app.on('titlechange', ...)
     */
    initComponent: function() {
        Tine.Tinebase.AppPile.superclass.initComponent.call(this);
        
        this.tpl = new Ext.XTemplate(
            '<div class="x-panel-header x-panel-header-noborder x-unselectable x-accordion-hd">',
                '<img class="x-panel-inline-icon {iconCls}" src="' + Ext.BLANK_IMAGE_URL + '"/>',
                '<span class="x-panel-header-text app-panel-apptitle-text">{title}</span>',
            '</div>'
        ).compile();

    },
    
    /**
     * @private
     */
    onRender: function(ct, position) {
        Tine.Tinebase.AppPile.superclass.onRender.call(this, ct, position);

        this.apps.sort("ASC", function(app1, app2) {
            return parseInt(app1.order, 10) < parseInt(app2.order, 10) ? 1 : -1;
        });
        
        this.apps.each(function(app) {
            this.els[app.appName] = this.tpl.insertFirst(this.body, {title: app.getTitle(), iconCls: app.getIconCls()}, true);
            this.els[app.appName].setStyle('cursor', 'pointer');
            this.els[app.appName].addClassOnOver('app-panel-header-over');
            this.els[app.appName].on('click', this.onAppTitleClick, this, app);
            
        }, this);
        
        // limit to max pile height
        this.on('resize', function() {
            var appHeaders = Ext.DomQuery.select('div[class^=x-panel-header]', this.el.dom);
            for (var i=0, height=0; i<appHeaders.length; i++) {
                height += Ext.fly(appHeaders[i]).getHeight();
            }
            if (arguments[2] && arguments[2] > height) {
                this.setHeight(height);
            }
        });
        this.setActiveItem(this.els[this.defaultAppName]);
    },
    
    /**
     * @private
     */
    onAppTitleClick: function(e, dom, app) {
        this.setActiveItem(Ext.get(dom));
        this.handler.call(this.scope|| this, app);
    },
    
    /**
     * @private
     */
    setActiveItem: function(el) {
        for (var appName in this.els) {
            if (el == this.els[appName] || el.parent() == this.els[appName]) {
                this.els[appName].addClass('app-panel-header-active');
            } else {
                this.els[appName].removeClass('app-panel-header-active');
            }
        }
    }
});
// file: /var/www/tine20build/tine20/Tinebase/js/MainMenu.js
Tine.Tinebase.MainMenu = function(config) {
    this.isPrism = 'platform' in window;
    Ext.apply(this, config);
    // NOTE: Prism has no top menu yet ;-(
    //       Only the 'icon menu' is implemented (right mouse button in dock(mac)/tray(other)
    /*if (this.isPrism) {
        window.platform.showNotification('title', 'text', 'images/clear-left.png');
        this.menu = window.platform.icon().title = 'supertine';
        //window.platform.menuBar.addMenu(“myMenu”);
        
        this.menu = window.platform.icon().menu;
        window.platform.icon().menu.addMenuItem("myItem", "My Item", function(e) { window.alert("My Item!"); });
        
        var sub = this.menu.addSubmenu('mytest', 'mytest');
        sub.addMenuItem('test', 'test', function() {alert('test');});
        
    } else*/ {
        this.menu = new Ext.Toolbar({
            id: this.id, 
            height: this.height,
            items: this.items
        });
        
        return this.menu;
    }
};



// file: /var/www/tine20build/tine20/Tinebase/js/MainScreen.js
/*
 * Tine 2.0
 * 
 * @package     Tine
 * @subpackage  Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
Ext.namespace('Tine', 'Tine.Tinebase');

/**
 * Tine 2.0 library/ExtJS client Mainscreen.
 */
Tine.Tinebase.MainScreen = Ext.extend(Ext.Panel, {
    
    /**
     * @cfg {String} Appname of default app
     */
    defaultAppName: 'Addressbook',
    
    //private
    layout: 'border',
    border: false,
    
    /**
     * @private
     */
    initComponent: function() {
        this.onlineStatus = new Ext.ux.ConnectionStatus({});
        
        // init actions
        this.initActions();
        
        // init main menu
        this.tineMenu = new Tine.Tinebase.MainMenu({
            id: 'tineMenu',
            height: 26,
            items:[{
                text: 'Tine 2.0',
                menu: {
                    id: 'Tinebase_System_Menu',     
                    items: [
                        this.action_aboutTine,
                        '-',
                        this.action_changePassword,
                        this.action_installGoogleGears,
                        '-', 
                        this.action_logout
                    ]                
                }
            }, {
                text: _('Admin'),
                id: 'Tinebase_System_AdminButton',
                disabled: true,
                menu: {
                    id: 'Tinebase_System_AdminMenu'
                }     
            },{
                text: _('Preferences'),
                id: 'Tinebase_System_PreferencesButton',
                disabled: false,
                handler: this.onEditPreferences
                /*,
                menu: {
                    id: 'Tinebase_System_PreferencesMenu',
                    items: [
                        //this.action_editPreferences
                    ]
                }*/
            }, '->', 
            this.action_logout
        ]});
        
        // init footer
        var tineFooter = new Ext.Toolbar({
            id: 'tineFooter',
            height: 26,
            items:[
                String.format(_('User: {0}'), Tine.Tinebase.registry.get('currentAccount').accountDisplayName), 
                '->',
                this.onlineStatus
            ]
    
        });
        
        // get default app from preferences if available
        this.defaultAppName = (Tine.Tinebase.registry.get('preferences') && Tine.Tinebase.registry.get('preferences').get('defaultapp')) 
            ? Tine.Tinebase.registry.get('preferences').get('defaultapp') 
            : this.defaultAppName;
        
        // init app picker
        var allApps = Tine.Tinebase.appMgr.getAll();
        
        if (! Tine.Tinebase.appMgr.get(this.defaultAppName)) {
            var firstApp = allApps.first();
            if (firstApp) {
                this.defaultAppName = firstApp.appName;
            } else {
                Ext.Msg.alert(_('Sorry'), _('There are no applications enabled for you. Please contact your administrator.'));
            }
            
        }
        this.appPicker = new Tine.Tinebase.AppPicker({
            apps: allApps,
            defaultAppName: this.defaultAppName
        });
                    
        // init generic mainscreen layout
        var mainscreen = [{
            region: 'north',
            id:     'north-panel',
            split:  false,
            height: /*'platform' in window ? 26 :*/ 52,
            border: false,
            layout:'border',
            items: [/*'platform' in window ? {} :*/ {
                region: 'north',
                height: 26,
                border: false,
                id:     'north-panel-1',
                items: [
                    this.tineMenu
                ]
            },{
                region: 'center',
                layout: 'card',
                activeItem: 0,
                height: 26,
                border: false,
                id:     'north-panel-2',
                items: new Ext.Toolbar({})
            }]
        }, {
            region: 'south',
            id: 'south',
            border: false,
            split: false,
            height: 26,
            initialSize: 26,
            items:[
                tineFooter
            ]
    /*          }, {
                    region: 'east',
                    id: 'east',
                    title: 'east',
                    split: true,
                    width: 100,
                    minSize: 100,
                    maxSize: 500,
                    autoScroll:true,
                    collapsible:true,
                    titlebar: true,
                    animate: true, */
        }, {
            region: 'center',
            id: 'center-panel',
            animate: true,
            useShim:true,
            border: false,
            layout: 'card'
        }, {
            region: 'west',
            id: 'west',
            split: true,
            width: 200,
            minSize: 100,
            maxSize: 300,
            border: false,
            collapsible:true,
            containerScroll: true,
            collapseMode: 'mini',
            layout: 'fit',
            items: this.appPicker
        }];
        
        this.items = [{
            region: 'north',
            border: false,
            cls: 'tine-mainscreen-topbox',
            html: '<div class="tine-mainscreen-topbox-left"></div><div class="tine-mainscreen-topbox-middle"></div><div class="tine-mainscreen-topbox-right"></div>'
        }, {
            region: 'center',
            border: false,
            layout: 'border',
            items: mainscreen
        }];
        
        Tine.Tinebase.MainScreen.superclass.initComponent.call(this);
    },
    
    /**
     * initialize actions
     * @private
     */
    initActions: function() {
        this.action_aboutTine = new Ext.Action({
            text: _('About Tine 2.0'),
            handler: this.onAboutTine20,
            iconCls: 'action_about'
        });
        
        this.action_changePassword = new Ext.Action({
            text: _('Change password'),
            handler: this.onChangePassword,
            disabled: !Tine.Tinebase.registry.get('changepw'),
            iconCls: 'action_password'
        });
        
        this.action_installGoogleGears = new Ext.Action({
            text: _('Install Google Gears'),
            handler: this.onInstallGoogleGears,
            disabled: (window.google && google.gears) ? true : false
        });
        
        /*
        this.action_editPreferences = new Ext.Action({
            text: _('Preferences'),
            handler: this.onEditPreferences,
            disabled: false,
            //id: 'Tinebase_System_PreferencesButton',
            iconCls: 'AddressbookTreePanel' //''action_preferences'
        });
        */

        this.action_logout = new Ext.Action({
            text: _('Logout'),
            tooltip:  _('Logout from Tine 2.0'),
            id: 'tblogout',
            iconCls: 'action_logOut',
            handler: this.onLogout
        });
    },
    
    onRender: function(ct, position) {
        Tine.Tinebase.MainScreen.superclass.onRender.call(this, ct, position);
        Tine.Tinebase.MainScreen = this;
        this.activateDefaultApp();
        
        // check for new version 
        if (Tine.Tinebase.common.hasRight('check_version', 'Tinebase')) {
            Tine.widgets.VersionCheck();
        }
    },
    
    activateDefaultApp: function() {
        if (this.appPicker.getTreeCardPanel().rendered) {
            var defaultApp = Tine.Tinebase.appMgr.get(this.defaultAppName);
        	defaultApp.getMainScreen().show();
            document.title = 'Odin 1.0 - ' + defaultApp.getTitle();
        } else {
            this.activateDefaultApp.defer(10, this);
        }
    },
    
    /**
     * sets the active content panel
     * 
     * @param {Ext.Panel} _panel Panel to activate
     * @param {Bool} _keep keep panel
     */
    setActiveContentPanel: function(_panel, _keep) {
        // get container to which component will be added
        var centerPanel = Ext.getCmp('center-panel');
        _panel.keep = _keep;

        var i,p;
        if(centerPanel.items) {
            for (i=0; i<centerPanel.items.length; i++){
                p =  centerPanel.items.get(i);
                if (! p.keep) {
                    centerPanel.remove(p);
                }
            }  
        }
        if(_panel.keep && _panel.rendered) {
            centerPanel.layout.setActiveItem(_panel.id);
        } else {
            centerPanel.add(_panel);
            centerPanel.layout.setActiveItem(_panel.id);
            centerPanel.doLayout();
        }
    },
    
    /**
     * sets the active tree panel
     * 
     * @param {Ext.Panel} panel Panel to activate
     * @param {Bool} keep keep panel
     */
    setActiveTreePanel: function(panel, keep) {
        // get card panel to which component will be added
        var cardPanel =  this.appPicker.getTreeCardPanel();
        panel.keep = keep;
        
        // remove all panels which should not be keeped
        var i,p;
        if(cardPanel.items) {
            for (i=0; i<cardPanel.items.length; i++){
                p =  cardPanel.items.get(i);
                if (! p.keep) {
                    cardPanel.remove(p);
                }
            }  
        }
        
        // add or set given panel
        if(panel.keep && panel.rendered) {
            cardPanel.layout.setActiveItem(panel.id);
        } else {
            cardPanel.add(panel);
            cardPanel.layout.setActiveItem(panel.id);
            cardPanel.doLayout();
        }
        
    },
    
    /**
     * gets the currently displayed toolbar
     * 
     * @return {Ext.Toolbar}
     */
    getActiveToolbar: function() {
        var northPanel = Ext.getCmp('north-panel-2');

        if(northPanel.layout.activeItem && northPanel.layout.activeItem.el) {
            return northPanel.layout.activeItem.el;
        } else {
            return false;            
        }
    },
    
    /**
     * sets toolbar
     * 
     * @param {Ext.Toolbar}
     */
    setActiveToolbar: function(_toolbar, _keep) {
        var northPanel = Ext.getCmp('north-panel-2');
        _toolbar.keep = _keep;
        
        var i,t;
        if(northPanel.items) {
            for (i=0; i<northPanel.items.length; i++){
                t = northPanel.items.get(i);
                if (! t.keep) {
                    northPanel.remove(t);
                }
            }  
        }
        
        if(_toolbar.keep && _toolbar.rendered) {
            northPanel.layout.setActiveItem(_toolbar.id);
        } else {
            northPanel.add(_toolbar);
            northPanel.layout.setActiveItem(_toolbar.id);
            northPanel.doLayout();
        }
    },
    
    /**
     * @private
     */
    onAboutTine20: function() {
        
        var version = (Tine.Tinebase.registry.get('version')) ? Tine.Tinebase.registry.get('version') : {
            codeName: 'unknown',
            packageString: 'unknown'
        };
        
        Ext.Msg.show({
            title: _('About Tine 2.0'),
            msg: 
                '<div class="tb-about-dlg">' +
                    '<div class="tb-about-img"><a href="http://www.tine20.org" target="_blank"><img src="' + Tine.Login.loginLogo + '" /></a></div>' +
                    '<div class="tb-about-version">Version: ' + version.codeName + '</div>' +
                    '<div class="tb-about-build">( ' + version.packageString + ' )</div>' +
                    '<div class="tb-about-copyright">Copyright: 2007-' + new Date().getFullYear() + '&nbsp;<a href="http://www.metaways.de" target="_blank">Metaways Infosystems GmbH</a></div>' +
                '</div>',
            width: 400,
            //height: 200,
            buttons: Ext.Msg.OK,
            animEl: 'elId'
        });
        /*
        Ext.Msg.show({
           title: _('About Tine 2.0'),
           msg: 'Version: 2009-02-10',
           buttons: Ext.Msg.OK,
           //fn: processResult,
           animEl: 'elId',
           icon: 'mb-about'
        });
        */
    },
    
    /**
     * @private
     */
    onChangePassword: function() {
        
        var passwordDialog = new Ext.Window({
            title: String.format(_('Change Password For "{0}"'), Tine.Tinebase.registry.get('currentAccount').accountDisplayName),
            id: 'changePassword_window',
            closeAction: 'close',
            modal: true,
            width: 350,
            height: 230,
            minWidth: 350,
            minHeight: 230,
            layout: 'fit',
            plain: true,
            items: new Ext.FormPanel({
                bodyStyle: 'padding:5px;',
                buttonAlign: 'right',
                labelAlign: 'top',
                anchor:'100%',
                id: 'changePasswordPanel',
                defaults: {
                    xtype: 'textfield',
                    inputType: 'password',
                    anchor: '100%',
                    allowBlank: false
                },
                items: [{
                    id: 'oldPassword',
                    fieldLabel: _('Old Password'), 
                    name:'oldPassword'
                },{
                    id: 'newPassword',
                    fieldLabel: _('New Password'), 
                    name:'newPassword'
                },{
                    id: 'newPasswordSecondTime',
                    fieldLabel: _('Repeat new Password'), 
                    name:'newPasswordSecondTime'
                }],
                buttons: [{
                    text: _('Cancel'),
                    iconCls: 'action_cancel',
                    handler: function() {
                        Ext.getCmp('changePassword_window').close();
                    }
                }, {
                    text: _('Ok'),
                    iconCls: 'action_saveAndClose',
                    handler: function() {
                        var form = Ext.getCmp('changePasswordPanel').getForm();
                        var values;
                        if (form.isValid()) {
                            values = form.getValues();
                            if (values.newPassword == values.newPasswordSecondTime) {
                                Ext.Ajax.request({
                                    waitTitle: _('Please Wait!'),
                                    waitMsg: _('changing password...'),
                                    params: {
                                        method: 'Tinebase.changePassword',
                                        oldPassword: values.oldPassword,
                                        newPassword: values.newPassword
                                    },
                                    success: function(_result, _request){
                                        var response = Ext.util.JSON.decode(_result.responseText);
                                        if (response.success) {
                                            Ext.getCmp('changePassword_window').close(); 
                                            Ext.MessageBox.show({
                                                title: _('Success'),
                                                msg: _('Your password has been changed.'),
                                                buttons: Ext.MessageBox.OK,
                                                icon: Ext.MessageBox.INFO
                                            });
                                        } else {
                                            Ext.MessageBox.show({
                                                title: _('Failure'),
                                                msg: response.errorMessage,
                                                buttons: Ext.MessageBox.OK,
                                                icon: Ext.MessageBox.ERROR  
                                            });
                                        }
                                    }
                                });
                            } else {
                                Ext.MessageBox.show({
                                    title: _('Failure'),
                                    msg: _('The new passwords mismatch, please correct them.'),
                                    buttons: Ext.MessageBox.OK,
                                    icon: Ext.MessageBox.ERROR 
                                });    
                            }
                        }
                    }                    
                }]
            })
        });
        passwordDialog.show();  
    },
    
    /**
     * the install Google Gears handler function
     * @private
     */
    onInstallGoogleGears: function() {
        var message = _('Installing Gears will improve the performance of Odin by caching all needed files locally on this computer.');
        Tine.WindowFactory.getWindow({
            width: 800,
            height: 400,
            url: "http://gears.google.com/?action=install&message=" + message
        });
    },

    /**
     * @private
     */
    onEditPreferences: function() {
    	Tine.widgets.dialog.Preferences.openWindow({});
    },
    
    /**
     * the logout button handler function
     * @private
     */
    onLogout: function() {
        Ext.MessageBox.confirm(_('Confirm'), _('Are you sure you want to logout?'), function(btn, text) {
            if (btn == 'yes') {
                Ext.MessageBox.wait(_('Logging you out...'), _('Please wait!'));
                Ext.Ajax.request( {
                    params : {
                        method : 'Tinebase.logout'
                    },
                    callback : function(options, Success, response) {
                        // remove the event handler
                        // the reload() trigers the unload event
                        window.location = window.location.href.replace(/#+.*/, '');
                    }
                });
            }
        });
    }

});
// file: /var/www/tine20build/tine20/Tinebase/js/Login.js
/*
 * Tine 2.0
 * 
 * @package     Tine
 * @subpackage  Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */

Ext.namespace('Tine.Tinebase.registry');

/**
 * @todo make registration working again!
 * @todo re-facotre showLoginDialog to only create one window and show hide it on demand
 */
Tine.Login = {
    onLogin: function(){},
    scope: window,
    defaultUsername: '',
    defaultPassword: '',
    
    loginMethod: 'Tinebase.login',
    loginLogo: 'images/tine_logo.gif',
    
    
    /**
     * show the login dialog
     */
    showLoginDialog: function(config) {
        Ext.apply(this, config);
        
        // turn on validation errors beside the field globally
        Ext.form.Field.prototype.msgTarget = 'side';  

    	var loginButtons = [{
            id: 'loginbutton',
            text: _('Login'),
            scope: this,
            handler: this.doLogin
        }];
        
        if ( false && userRegistration === true ) {
            loginButtons.push({
                text: _('Register'),
                handler: Tine.Login.UserRegistrationHandler
            });
        }
        
        this.loginWindow = new Ext.Window({
            xtype: 'panel',
            layout: 'fit',
            modal: true,
            closable: false,
            resizable: false,
            
            width: 335,
            height: 220,
            title: _('Please enter your login data'),
            items: new Ext.FormPanel({
                frame:true,
                id: 'loginDialog',
                labelWidth: 130,
                defaults: {
                    xtype: 'textfield',
                    width: 170
                },
                items: [{
                    xtype: 'panel',
                    style: 'padding-left: 174px;',
                    width: 350,
                    border: false,
                    html: '<a target="_blank" href="http://www.tinlab.com/" border="0"><img src="' + this.loginLogo +'" /></a>'
                }, new Tine.widgets.LangChooser({
                    
                }), {
                    fieldLabel: _('Username'),
                    id: 'username',
                    name: 'username',
                    selectOnFocus: true,
                    value: this.defaultUsername
                }, {
                    inputType: 'password',
                    fieldLabel: _('Password'),
                    id: 'password',
                    name: 'password',
                    //allowBlank: false,
                    selectOnFocus: true,
                    value: this.defaultPassword
                }]
            }),
            buttons: loginButtons
            
        });
        this.originalTitle = window.document.title;
        window.document.title = 'Odin - ' + _('Please enter your login data');
        this.loginWindow.show();
        Ext.getCmp('username').focus(false, 250);
                    
        Ext.getCmp('username').on('specialkey', function(_field, _event) {
        	if(_event.getKey() == _event.ENTER){
        		this.doLogin();
        	}
        }, this);

        Ext.getCmp('password').on('specialkey', function(_field, _event) {
            if(_event.getKey() == _event.ENTER){
                this.doLogin();
            }
        }, this);
        
        Tine.Tinebase.viewport.on('resize', function() {
            this.loginWindow.center();
        }, this);
    },
    
    /**
     * do the actual login
     */
    doLogin: function(){
    	var form = Ext.getCmp('loginDialog').getForm();
        var values = form.getValues();
        if (form.isValid()) {
            Ext.MessageBox.wait(_('Logging you in...'), _('Please wait'));
            
            Ext.Ajax.request({
                scope: this,
                params : {
                    method: this.loginMethod,
                    username: values.username,
                    password: values.password
                },
                callback: function(request, httpStatus, response) {
                    var responseData = Ext.util.JSON.decode(response.responseText);
                    if (responseData.success === true) {
                        //Ext.MessageBox.wait(_('Login successful. Loading Tine 2.0...'), _('Please wait!'));
						Ext.MessageBox.wait(_('Login successful. Loading tinlab:odin...'), _('Please wait!'));
                        this.loginWindow.hide();
                        window.document.title = this.originalTitle;
                        this.onLogin.call(this.scope);
                    } else {
                        Ext.MessageBox.show({
                            title: _('Login failure'),
                            msg: _('Your username and/or your password are wrong!!!'),
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.ERROR 
                        });
                    }
                }
            });
        }
    },
    
    UserRegistrationHandler: function () {
        var regWindow = new Tine.Tinebase.UserRegistration();
        regWindow.show();
    }
};
// file: /var/www/tine20build/tine20/Tinebase/js/common.js
/*
 * Tine 2.0
 * 
 * @package     Tine
 * @subpackage  Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 */
 
Ext.namespace('Tine', 'Tine.Tinebase');

/**
 * static common helpers
 */
Tine.Tinebase.common = {
    
    /**
     * Open browsers native popup
     * @param {string} _windowName
     * @param {string} _url
     * @param {int} _width
     * @param {int} _height
     */
    openWindow: function(_windowName, _url, _width, _height){
        // M$ IE has its internal location bar in the viewport
        if(Ext.isIE) {
            _height = _height + 20;
        }
        
        var w,h,x,y,leftPos,topPos,popup;

        if (document.all) {
            w = document.body.clientWidth;
            h = document.body.clientHeight;
            x = window.screenTop;
            y = window.screenLeft;
        } else { 
            if (window.innerWidth) {
                w = window.innerWidth;
                h = window.innerHeight;
                x = window.screenX;
                y = window.screenY;
            }
        }
        leftPos = ((w - _width) / 2) + y;
        topPos = ((h - _height) / 2) + x;
        
        popup = window.open(_url, _windowName, 'width=' + _width + ',height=' + _height + ',top=' + topPos + ',left=' + leftPos +
        ',directories=no,toolbar=no,location=no,menubar=no,scrollbars=no,status=no,resizable=yes,dependent=no');
        
        return popup;
    },
    
    /**
     * Returns localised date and time string
     * 
     * @param {mixed} date
     * @see Ext.util.Format.date
     * @return {string} localised date and time
     */
    dateTimeRenderer: function($_iso8601){
        return Ext.util.Format.date($_iso8601, Locale.getTranslationData('Date', 'medium') + ' ' + Locale.getTranslationData('Time', 'medium'));
    },

    /**
     * Returns localised date string
     * 
     * @param {mixed} date
     * @see Ext.util.Format.date
     * @return {string} localised date
     */
    dateRenderer: function(date){
        return Ext.util.Format.date(date, Locale.getTranslationData('Date', 'medium'));
    },
    
    /**
     * Returns localised time string
     * 
     * @param {mixed} date
     * @see Ext.util.Format.date
     * @return {string} localised time
     */
    timeRenderer: function(date){
        return Ext.util.Format.date(date, Locale.getTranslationData('Time', 'medium'));
    },
    
    /**
     * Returns prettyfied minutes
     * @param  {Number} minutes
     * @return {String}
     */
    minutesRenderer: function(minutes){
        
        var i = minutes%60;
        var H = Math.floor(minutes/60);//%(24);
        //var d = Math.floor(minutes/(60*24));
        
        var s = String.format(Tine.Tinebase.tranlation.ngettext('{0} minute', '{0} minutes', i), i);
        var Hs = String.format(Tine.Tinebase.tranlation.ngettext('{0} hour', '{0} hours', H), H);
        //var ds = String.format(Tine.Tinebase.tranlation.ngettext('{0} workday', '{0} workdays', d), d);
        
        if (i == 0) {
        	s = Hs;
        } else {
            s = H ? Hs + ', ' + s : s;
        }
        //s = d ? ds + ', ' + s : s;
        
        return s;
    },
    
    /**
     * Returns the formated username
     * 
     * @param {object} account object 
     * @return {string} formated user display name
     */
    usernameRenderer: function(_accountObject, _metadata, _record, _rowIndex, _colIndex, _store){
        return Ext.util.Format.htmlEncode(_accountObject.accountDisplayName);
    },
    
    /**
     * Returns a username or groupname with according icon in front
     */
    accountRenderer: function(_accountObject, _metadata, _record, _rowIndex, _colIndex, _store) {
        if (! _accountObject) return '';
        var type, iconCls, displayName;
        
        if(_accountObject.accountDisplayName){
            type = 'user';
            displayName = _accountObject.accountDisplayName;
        } else if (_accountObject.name){
            type = 'group';
            displayName = _accountObject.name;
        } else if (_record.data.name) {
            type = _record.data.type;
            displayName = _record.data.name;
        } else if (_record.data.account_name) {
            type = _record.data.account_type;
            displayName = _record.data.account_name;
        }
        iconCls = type == 'user' ? 'renderer renderer_accountUserIcon' : 'renderer renderer_accountGroupIcon';
        return '<div class="' + iconCls  + '">&#160;</div>' + Ext.util.Format.htmlEncode(displayName); 
    },
    
    /**
     * return yes or no in the selected language for a boolean value
     * 
     * @param {string} value
     * @return {string}
     */
    booleanRenderer: function(value) {
        var translationString = String.format("{0}",(value==1) ? Locale.getTranslationData('Question', 'yes') : Locale.getTranslationData('Question', 'no'));
        
        return translationString.substr(0, translationString.indexOf(':'));
    },
    
    /** 
     * returns json coded data from given data source
     *
     * @param _dataSrc - Ext.data.JsonStore object
     * @return json coded string
     **/    
    getJSONdata: function(_dataSrc) {
            
        if(Ext.isEmpty(_dataSrc)) {
            return false;
        }
            
        var data = _dataSrc.data;
        var dataLen = data.getCount();
        var jsonData = [];
        var curRecData;
        for(var i=0; i < dataLen; i++) {
            curRecData = data.itemAt(i).data;
            jsonData.push(curRecData);
        }   

        return Ext.util.JSON.encode(jsonData);
    },
       
    /** 
     * returns json coded data from given data source
     * switches array keys
     *
     * @param _dataSrc - Ext.data.JsonStore object
     * @param _switchKeys - Array with old=>new key pairs
     * @return json coded string
     **/    
    getJSONdataSKeys: function(_dataSrc, _switchKeys) {
            
        if(Ext.isEmpty(_dataSrc) || Ext.isEmpty(_switchKeys)) {
            return false;
        }
            
        var data = _dataSrc.data, dataLen = data.getCount();
        var jsonData = [];
        var keysLen = _switchKeys.length;       
        
        if(keysLen < 1) {
            return false;
        }
        
        var curRecData;
        for(var i=0; i < dataLen; i++) {
                curRecData = [];
                curRecData[0] = {};
                curRecData[0][_switchKeys[0]] = data.itemAt(i).data.key;
                curRecData[0][_switchKeys[1]] = data.itemAt(i).data.value;                

            jsonData.push(curRecData[0]);
        }   

        return Ext.util.JSON.encode(jsonData);
    },
    
    /**
     * check if user has right to view/manage this application/resource
     * 
     * @param   string      right (view, admin, manage)
     * @param   string      application
     * @param   string      resource (for example roles, accounts, ...)
     * @returns boolean 
     */
    hasRight: function(_right, _application, _resource) {
        var userRights = [];
        
        if (!(Tine && Tine[_application] && Tine[_application].registry && Tine[_application].registry.get('rights'))) {
            if (Tine.Tinebase.appMgr.get(_application)) {
                console.error('Tine.' + _application + '.rights is not available, initialisation Error!');
            }
            return false;
        }
        userRights = Tine[_application].registry.get('rights');
        
        //console.log(userRights);
        var result = false;
        
        for (var i=0; i < userRights.length; i++) {
            if (userRights[i] == 'admin') {
                result = true;
                break;
            }
            
            if (_right == 'view' && (userRights[i] == 'view_' + _resource || userRights[i] == 'manage_' + _resource) ) {
                result = true;
                break;
            }
            
            if (_right == 'manage' && userRights[i] == 'manage_' + _resource) {
                result = true;
                break;
            }
            
            if (_right == userRights[i]) {
                result = true;
                break;
            }
        }
    
        return result;
    }
};

// file: /var/www/tine20build/tine20/Tinebase/js/tineInit.js
/*
 * Tine 2.0
 * 
 * @package     Tine
 * @subpackage  Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 * @todo        move locale/timezone registry values to preferences MixedCollection?
 */

Ext.onReady(function() {
    Tine.Tinebase.tineInit.initWindow();
    Tine.Tinebase.tineInit.initBootSplash();
    Tine.Tinebase.tineInit.initLocale();
    Tine.Tinebase.tineInit.initAjax();
    Tine.Tinebase.tineInit.initErrorHandler();
    Tine.Tinebase.tineInit.initRegistry();
    var waitForInits = function() {
        if (! Tine.Tinebase.tineInit.initList.initRegistry) {
            waitForInits.defer(100);
        } else {
            Tine.Tinebase.tineInit.initState();
            Tine.Tinebase.tineInit.initWindowMgr();
            Tine.Tinebase.tineInit.onLangFilesLoad();
            Tine.Tinebase.tineInit.checkSelfUpdate();
            Tine.Tinebase.tineInit.renderWindow();
        }
    };
    waitForInits();
});

/** ------------------------ Tine 2.0 Initialisation ----------------------- **/

Ext.namespace('Tine');

Tine.clientVersion = {};
Tine.clientVersion.codeName = 'Leonie (2009/07)';
Tine.clientVersion.buildType = 'RELEASE';
Tine.clientVersion.buildDate = '2009-10-06 12:25:52';
Tine.clientVersion.packageString = '2009-07-7';
Tine.clientVersion.releaseTime      = 'none';

/**
 * static tine init functions
 */
Tine.Tinebase.tineInit = {
    /**
     * @cfg {String} getAllRegistryDataMethod
     */
    getAllRegistryDataMethod: 'Tinebase.getAllRegistryData',
    /**
     * @cfg {String} requestUrl
     */
    requestUrl: 'index.php',
    
    /**
     * list of initialised items
     */
    initList: {
        initWindow:   false,
        initViewport: false,
        initRegistry: false
    },
    
    initWindow: function() {
        // disable browsers native context menu globaly
        Ext.getBody().on('contextmenu', Ext.emptyFn, this, {preventDefault: true});
        // disable the native 'select all'
        Ext.getBody().on('keydown', function(e) {
            if(e.ctrlKey && e.getKey() == e.A){
                e.preventDefault();
            } else if(!window.isMainWindow && e.ctrlKey && e.getKey() == e.T){
                e.preventDefault();
            }
        });

        //init window is done in Ext.ux.PopupWindowMgr. yet
        this.initList.initWindow = true;
    },
    
    /**
     * Each window has exactly one viewport containing a card layout in its lifetime
     * The default card is a splash screen.
     * 
     * defautl wait panel (picture only no string!)
     */
    initBootSplash: function() {
        centerSplash = function() {
            var vp = Ext.getBody().getSize();
            var p = Ext.get('tine-viewport-waitcycle');
            p.moveTo(vp.width/2 - this.splash.width/2, vp.height/2 - this.splash.height/2);
            
            var by = Ext.get('tine-viewport-poweredby');
            if (by) {
                var bySize = by.getSize();
                by.setTop(vp.height/2 - bySize.height);
                by.setLeft(vp.width/2 - bySize.width);
                by.setStyle({'z-index': 100000})
            }
        };
        
        this.splash = {
            id: 'tine-viewport-waitcycle',
            border: false,
            layout: 'fit',
            width: 16,
            height: 16,
            html: '<div class="loading-indicator" width="16px" height="16px">&#160;</div><div id="tine-viewport-poweredby" class="tine-viewport-poweredby" style="position: absolute;">Powered by: <a target="_blank" href="http://www.tinlab.com">tinlab</a></div>',
            listeners: {
                scope: this,
                render: centerSplash,
                resize: centerSplash
            }
        };
        
        Tine.Tinebase.viewport = new Ext.Viewport({
            layout: 'fit',
            border: false,
            items: {
                id: 'tine-viewport-maincardpanel',
                layout: 'card',
                border: false,
                activeItem: 0,
                items: this.splash
            },
            listeners: {
                scope: this,
                render: function(p) {
                    this.initList.initViewport = true;
                }
            }
        });
    },
    
    renderWindow: function(){
        // check if user is already loged in        
        if (!Tine.Tinebase.registry.get('currentAccount')) {
            Tine.Login.showLoginDialog({
                defaultUsername: Tine.Tinebase.registry.get('defaultUsername'),
                defaultPassword: Tine.Tinebase.registry.get('defaultPassword'),
                scope: this,
                onLogin: function(response) {
                    Tine.Tinebase.tineInit.initList.initRegistry = false;
                    Tine.Tinebase.tineInit.initRegistry();
                    var waitForRegistry = function() {
                        if (Tine.Tinebase.tineInit.initList.initRegistry) {
                            Ext.MessageBox.hide();
                            Tine.Tinebase.tineInit.renderWindow();
                        } else {
                            waitForRegistry.defer(100);
                        }
                    };
                    waitForRegistry();
                }
            });
            return;
        }
        
        // temporary handling for server side exceptions of http (html) window requests
        if (window.exception) {
            switch (exception.code) {
                // autorisation required
                case 401:
                    Tine.Login.showLoginDialog(onLogin, Tine.Tinebase.registry.get('defaultUsername'), Tine.Tinebase.registry.get('defaultPassword'));
                    return;
                    break;
                
                // generic exception
                default:
                    // we need to wait to grab initialData from mainscreen
                    //var win = new Tine.Tinebase.ExceptionDialog({});
                    //win.show();
                    return;
                    break;
            }
        }
        // todo: find a better place for stuff to do after successfull login
        Tine.Tinebase.tineInit.initAppMgr();
        
        /** temporary Tine.onReady for smooth transition to new window handling **/
        if (typeof(Tine.onReady) == 'function') {
            Tine.Tinebase.viewport.destroy();
            Tine.onReady();
            return;
        }
        
        // fetch window config from WindowMgr
        var c = Ext.ux.PopupWindowMgr.get(window) || {};
        
        // set window title
        window.document.title = c.title ? c.title : window.document.title;
        
        // finaly render the window contentes in a new card  
        var mainCardPanel = Ext.getCmp('tine-viewport-maincardpanel');
        var card = Tine.WindowFactory.getContentPanel(c);
        mainCardPanel.layout.container.add(card);
        mainCardPanel.layout.setActiveItem(card.id);
        card.doLayout();
        
        //var ping = new Tine.Tinebase.sync.Ping({});
    },

    initAjax: function() {
        /**
         * send custom headers and json key on Ext.Ajax.requests
         */
        Ext.Ajax.on('beforerequest', function(connection, options){
            options.url = options.url ? options.url : Tine.Tinebase.tineInit.requestUrl;
            options.params.jsonKey = Tine.Tinebase.registry && Tine.Tinebase.registry.get ? Tine.Tinebase.registry.get('jsonKey') : '';
            options.params.requestType = options.params.requestType || 'JSON';
            
            options.headers = options.headers ? options.headers : {};
            options.headers['X-Tine20-Request-Type'] = options.headers['X-Tine20-Request-Type'] || 'JSON';
            
            // append updated state info if state has changes
            if (typeof Ext.state.Manager.getProvider().getStateStore == 'function') {
                var stateStore = Ext.state.Manager.getProvider().getStateStore();
                if (stateStore.hasChanges) {
                    var stateInfo = [];
                    stateStore.each(function(stateRecord) {
                        // only save color manager state
                        // all other stuff needs rethinking
                        if (stateRecord.get('name') == 'cal-color-mgr-containers') {
                            stateInfo.push(stateRecord.data);
                        }
                    }, this);
                    
                    // mark changes as saved
                    stateStore.hasChanges = false;
                    
                    options.params.stateInfo = Ext.util.JSON.encode(stateInfo);
                }
            }
        });
        
        /**
         * Fetch HTML in JSON responses, which indicate response errors.
         */
        Ext.Ajax.on('requestcomplete', function(connection, response, options){
            // detect resoponse errors (e.g. html from xdebug)
            if (! response.responseText.match(/^([{\[])|(<\?xml)+/)) {
                var htmlText = response.responseText;
                response.responseText = Ext.util.JSON.encode({
                    msg: htmlText,
                    trace: []
                });
                
                connection.fireEvent('requestexception', connection, response, options);
            }
        });
        
        /**
         * Fetch exceptions
         * 
         * Exceptions which come to the client signal a software failure.
         * So we display the message and trace here for the devs.
         * @todo In production mode there should be a 'report bug' wizzard here
         */
        Ext.Ajax.on('requestexception', function(connection, response, options){
            
            // if communication is lost, we can't create a nice ext window.
            if (response.status === 0) {
                alert(_('Connection lost, please check your network!'));
                return false;
            }
            
            var data = response ? Ext.util.JSON.decode(response.responseText) : null;
            
            // server did not responde anything
            if (! data) {
                alert(_('The server did not respond to your request. Please check your network or contact your administrator.'));
                return false;
            }
            
            switch(data.code) {
                // not authorised
                case 401:
                if (! options.params || options.params.method != 'Tinebase.logout') {
                    Ext.MessageBox.show({
                        title: _('Authorisation Required'), 
                        msg: _('Your session timed out. You need to login again.'),
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.WARNING,
                        fn: function() {
                            window.location.href = window.location.href;
                        }
                    });
                }
                break;
                
                // insufficient rights
                case 403:
                Ext.MessageBox.show({
                    title: _('Insufficient Rights'), 
                    msg: _('Sorry, you are not permitted to perform this action'),
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.ERROR
                });
                break;
                
                // not found
                case 404:
                Ext.MessageBox.show({
                    title: _('Not Found'), 
                    msg: _('Sorry, your request could not be completed because the required data could not be found. In most cases this means that someone already deleted the data. Please refresh your current view.'),
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.ERROR
                });
                break;
                
                // concurrency conflict
                case 409:
                Ext.MessageBox.show({
                    title: _('Concurrent Updates'), 
                    msg: _('Someone else saved this record while you where editing the data. You need to reload and make your changes again.'),
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.WARNING
                });
                break;
                
                // generic failure -> notify developers / only if no custom exception handler has been defined in options
                default:
                if (typeof options.exceptionHandler !== 'function') {
                    var windowHeight = 400;
                    if (Ext.getBody().getHeight(true) * 0.7 < windowHeight) {
                        windowHeight = Ext.getBody().getHeight(true) * 0.7;
                    }
                    
                    if (! Tine.Tinebase.exceptionDlg) {
                        Tine.Tinebase.exceptionDlg = new Tine.Tinebase.ExceptionDialog({
                            height: windowHeight,
                            exceptionInfo: data,
                            listeners: {
                                close: function() {
                                    Tine.Tinebase.exceptionDlg = null;
                                }
                            }
                        });
                        Tine.Tinebase.exceptionDlg.show();
                    }
                } else {
                    options.exceptionHandler.call(options.scope, response, options);
                }
                break;
            }
            
        });
    },
    
    /**
     * init a global error handler
     */
    initErrorHandler: function() {
        window.onerror = !window.onerror ? Tine.Tinebase.tineInit.globalErrorHandler : window.onerror.createSequence(Tine.Tinebase.tineInit.globalErrorHandler);
    },
    
    /**
     * @todo   make this working in safari
     * @return {string}
     */
    getNormalisedError: function() {
        var error = {
            name       : 'unknown error',
            message    : 'unknown',
            number     : 'unknown',
            description: 'unknown',
            url        : 'unknown',
            line       : 'unknown'
        };
        
        // NOTE: Arguments is not always a real Array
        var args = [];
        for (var i=0; i<arguments.length; i++) {
            args[i] = arguments[i];
        }
        
        //var lines = ["The following JS error has occured:"];
        if (args[0] instanceof Error) { // Error object thrown in try...catch
            error.name        = args[0].name;
            error.message     = args[0].message;
            error.number      = args[0].number & 0xFFFF; //Apply binary arithmetic for IE number, firefox returns message string in element array element 0
            error.description = args[0].description;
            
        } else if ((args.length == 3) && (typeof(args[2]) == "number")) { // Check the signature for a match with an unhandled exception
            error.name    = 'catchable exception'
            error.message = args[0];
            error.url     = args[1];
            error.line    = args[2];
        } else {
            error.message     = "An unknown JS error has occured.";
            error.description = 'The following information may be useful:' + "\n";
            for (var x = 0; x < args.length; x++) {
                error.description += (Ext.encode(args[x]) + "\n");
            }
        }
        return error;
    },
    
    globalErrorHandler: function() {
        var error = Tine.Tinebase.tineInit.getNormalisedError.apply(this, arguments);
        
        var traceHtml = '<table>';
        for (p in error) {
            if (error.hasOwnProperty(p)) {
                traceHtml += '<tr><td><b>' + p + '</b></td><td>' + error[p] + '</td></tr>'
            }
        }
        traceHtml += '</table>'
        
        // check for spechial cases we don't want to handle
        if (traceHtml.match(/versioncheck/)) {
            return true;
        }
        // we don't wanna know fancy FF3.5 crom bugs
        if (traceHtml.match(/chrome/)) {
            return true;
        }
        
        var data = {
            msg: 'js exception: ' + error.message,
            traceHTML: traceHtml
        };
        
        var windowHeight = 400;
        if (Ext.getBody().getHeight(true) * 0.7 < windowHeight) {
            windowHeight = Ext.getBody().getHeight(true) * 0.7;
        }
        
        if (! Tine.Tinebase.exceptionDlg) {
            Tine.Tinebase.exceptionDlg = new Tine.Tinebase.ExceptionDialog({
                height: windowHeight,
                exceptionInfo: data,
                listeners: {
                    close: function() {
                        Tine.Tinebase.exceptionDlg = null;
                    }
                }
            });
            Tine.Tinebase.exceptionDlg.show(Tine.Tinebase.exceptionDlg);
        }
        return true;
    },
    
    /**
     * init registry
     */
    initRegistry: function() {
        if (window.isMainWindow) {
            Ext.Ajax.request({
                params: {
                    method: Tine.Tinebase.tineInit.getAllRegistryDataMethod
                },
                success: function(response, request) {
                    var registryData = Ext.util.JSON.decode(response.responseText);
                    for (var app in registryData) {
                        if (registryData.hasOwnProperty(app)) {
                            var appData = registryData[app];
                            if (Tine[app]) {
                                Tine[app].registry = new Ext.util.MixedCollection();

                                for (var key in appData) {
                                    if (appData.hasOwnProperty(key)) {
                                        if (key == 'preferences') {
                                            var prefs = new Ext.util.MixedCollection();
                                            for (var pref in appData[key]) {
                                                if (appData[key].hasOwnProperty(pref)) {
                                                    prefs.add(pref, appData[key][pref]);
                                                }
                                            }
                                            prefs.on('replace', Tine.Tinebase.tineInit.onPreferenceChange);
                                            Tine[app].registry.add(key, prefs);
                                        } else {
                                            Tine[app].registry.add(key, appData[key]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    // update window factory window type (required after login)
                    if (Tine.Tinebase.registry && Tine.Tinebase.registry.get('preferences')) {
                        var windowType = Tine.Tinebase.registry.get('preferences').get('windowtype');
                        
                        if (Tine.WindowFactory && Tine.WindowFactory.windowType != windowType) {
                            Tine.WindowFactory.windowType = windowType;
                        }
                    }

                    Tine.Tinebase.tineInit.initList.initRegistry = true;
                }
            });
        } else {
            var mainWindow = Ext.ux.PopupWindowGroup.getMainWindow();
            
            for (p in mainWindow.Tine) {
                if (mainWindow.Tine[p].hasOwnProperty('registry') && Tine.hasOwnProperty(p)) {
                    Tine[p].registry = mainWindow.Tine[p].registry;
                }
            }
            
            Tine.Tinebase.tineInit.initList.initRegistry = true;
        }
    },
    
    /**
     * executed when a value in Tinebase registry/preferences changed
     * @param {string} key
     * @param {value} oldValue
     * @param {value} newValue
     */
    onPreferenceChange: function(key, oldValue, newValue) {
        switch (key) {
            case 'windowtype':
                //console.log('hier');
                //break;
            case 'timezone':
            case 'locale':
                if (window.google && google.gears && google.gears.localServer) {
                    var pkgStore = google.gears.localServer.openStore('tine20-package-store');
                    if (pkgStore) {
                        google.gears.localServer.removeStore('tine20-package-store');
                    }
                }
                // reload mainscreen (only if timezone or locale have changed)
                window.location = window.location.href.replace(/#+.*/, '');
                break;
        }
    },
    
    /**
     * check if selfupdate is needed
     */
    checkSelfUpdate: function() {
        if (! Tine.Tinebase.registry.get('version')) {
            return false;
        }        
        
        var needSelfUpdate, serverVersion = Tine.Tinebase.registry.get('version'), clientVersion = Tine.clientVersion;
        if (clientVersion.codeName.match(/^\$HeadURL/)) {
            return;
        }
        
        var cp = new Ext.state.CookieProvider({});
        
        if (serverVersion.packageString != 'none') {
            needSelfUpdate = (serverVersion.packageString !== clientVersion.packageString);
        } else {
            needSelfUpdate = (serverVersion.codeName !== clientVersion.codeName);
        }
        
        if (needSelfUpdate) {
            if (window.google && google.gears && google.gears.localServer) {
                google.gears.localServer.removeManagedStore('tine20-store');
                google.gears.localServer.removeStore('tine20-package-store');
            }
            if (cp.get('clientreload', '0') == '0') {
                
                cp.set('clientreload', '1');
                window.location = window.location.href.replace(/#+.*/, '');
                return;
                
            } else {
                new Ext.LoadMask(Ext.getBody(), {
                    msg: _('Fatal Error: Client self-update failed, please contact your administrator and/or restart/reload your browser.'),
                    msgCls: ''
                }).show();
            }
        } else {
            cp.clear('clientreload');
            
            // if no selfupdate is needed we store langfile and index.php in manifest
            if (window.google && google.gears && google.gears.localServer) {
                if (serverVersion.buildType == 'RELEASE') {
                    var pkgStore = google.gears.localServer.createStore('tine20-package-store');
                    var resources = [
                        '',
                        'index.php',
                        'Tinebase/js/Locale/build/' + Tine.Tinebase.registry.get('locale').locale + '-all.js'
                    ];
                    
                    Ext.each(resources, function(resource) {
                        if (! pkgStore.isCaptured(resource)) {
                            pkgStore.capture(resources, function(){/*console.log(arguments)*/});
                        }
                    }, this);
                } else {
                    google.gears.localServer.removeStore('tine20-package-store');
                }
            }
        }
    },
    
    /**
     * initialise window and windowMgr (only popup atm.)
     */
    initWindowMgr: function() {
        /**
         * init the window handling
         */
        Ext.ux.PopupWindow.prototype.url = 'index.php';
        
        /**
         * initialise window types
         */
        var windowType = (Tine.Tinebase.registry.get('preferences') && Tine.Tinebase.registry.get('preferences').get('windowtype')) 
            ? Tine.Tinebase.registry.get('preferences').get('windowtype') 
            : 'Browser';
            
        Tine.WindowFactory = new Ext.ux.WindowFactory({
            windowType: windowType
        });
        
        /**
         * register MainWindow
         */
        if (window.isMainWindow) {
            Ext.ux.PopupWindowMgr.register({
                name: window.name,
                popup: window,
                contentPanelConstructor: 'Tine.Tinebase.MainScreen'
            });
        }
    },
    
    /**
    * initialise state provider
    */
    initState: function() {
        Ext.state.Manager.setProvider(new Ext.ux.state.JsonProvider());
        if (window.isMainWindow) {
            // fill store from registry / initial data
            var stateInfo = Tine.Tinebase.registry.get('stateInfo');
            Ext.state.Manager.getProvider().loadStateData(stateInfo);
        } else {
            // take main windows store
            Ext.state.Manager.getProvider().setStateStore(Ext.ux.PopupWindowGroup.getMainWindow().Ext.state.Manager.getProvider().getStateStore());
        }
    },
    
    /**
     * initialise application manager
     */
    initAppMgr: function() {
        Tine.Tinebase.appMgr = new Tine.Tinebase.AppManager();
    },
    
    /**
     * config locales
     */
    initLocale: function() {
        //Locale.setlocale(Locale.LC_ALL, '');
        Tine.Tinebase.tranlation = new Locale.Gettext();
        Tine.Tinebase.tranlation.textdomain('Tinebase');
        window._ = function(msgid) {
            return Tine.Tinebase.tranlation.dgettext('Tinebase', msgid);
        };
    },
    
    /**
     * Last stage of initialisation, to be done after Tine.onReady!
     */
    onLangFilesLoad: function() {
    //    Ext.ux.form.DateTimeField.prototype.format = Locale.getTranslationData('Date', 'medium') + ' ' + Locale.getTranslationData('Time', 'medium');
    }
};

// file: /var/www/tine20build/tine20/Setup/js/init.js
/*
 * Tine 2.0
 * 
 * @package     Setup
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */

Ext.ns('Tine', 'Tine.Setup');
 
/**
 * init ajax
 */
Tine.Tinebase.tineInit.initAjax = Tine.Tinebase.tineInit.initAjax.createInterceptor(function() {
    // setup calls can take quite a while
    Ext.Ajax.timeout = 300000;
    Tine.Tinebase.tineInit.requestUrl = 'setup.php'
    
    return true;
});

/**
 * init registry
 */
Tine.Tinebase.tineInit.initRegistry = Tine.Tinebase.tineInit.initRegistry.createInterceptor(function() {
    Tine.Tinebase.tineInit.getAllRegistryDataMethod = 'Setup.getAllRegistryData';
    
    return true;
});

Tine.Tinebase.tineInit.checkSelfUpdate = Ext.emptyFn;

/**
 * render window
 */
Tine.Tinebase.tineInit.renderWindow = Tine.Tinebase.tineInit.renderWindow.createInterceptor(function() {
    // if a config file exists, the admin needs to login!        
    if (Tine.Setup.registry.get('configExists') && !Tine.Setup.registry.get('currentAccount')) {
        
        // tweak login dlg
        Tine.Login.loginMethod = 'Setup.login',
        Tine.Login.loginLogo = 'images/tine_logo_enjoy_setup.gif',
 
        Tine.Login.showLoginDialog({
            scope: this,
            onLogin: function(response) {
                Tine.Tinebase.tineInit.initList.initRegistry = false;
                Tine.Tinebase.tineInit.initRegistry();
                var waitForRegistry = function() {
                    if (Tine.Tinebase.tineInit.initList.initRegistry) {
                        Ext.MessageBox.hide();
                        Tine.Tinebase.tineInit.renderWindow();
                    } else {
                        waitForRegistry.defer(100);
                    }
                };
                waitForRegistry();
            }
        });
        return false;
    }
        
    // fake a setup user
    var setupUser = {
        accountId           : 1,
        accountDisplayName  : Tine.Setup.registry.get('currentAccount'),
        accountLastName     : 'Admin',
        accountFirstName    : 'Setup',
        accountFullName     : 'Setup Admin'
    };
    Tine.Tinebase.registry.add('currentAccount', setupUser);
    
    // enable setup app
    Tine.Tinebase.registry.add('userApplications', [{
        name:   'Setup',
        status: 'enabled'
    }]);
    Tine.Tinebase.MainScreen.prototype.defaultAppName = 'Setup';
    
    return true;
});
// file: /var/www/tine20build/tine20/Setup/js/Setup.js
/*
 * Tine 2.0
 * 
 * @package     Setup
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.ns('Tine', 'Tine.Setup');

/**************************** Tree Panel *****************************/
Tine.Setup.TreePanel = Ext.extend(Ext.tree.TreePanel, {
    border: false,
    rootVisible: false, 
    
    initComponent: function() {
        this.app = Tine.Tinebase.appMgr.get('Setup');
        
        var testsFailed   = !Tine.Setup.registry.get('setupChecks').success;
        var configMissing = !Tine.Setup.registry.get('configExists');
        var dbMissing     = !Tine.Setup.registry.get('checkDB');
        
        this.root = {
            id: '/',
            children: [{
                text: this.app.i18n._('Setup Checks'),
                iconCls: testsFailed ? 'setup_checks_fail' : 'setup_checks_success',
                id: 'EnvCheck',
                leaf: true
            }, {
                text: this.app.i18n._('Config Manager'),
                iconCls: 'setup_config_manager',
                disabled: testsFailed,
                id: 'ConfigManager',
                leaf: true
            }, {
                text: this.app.i18n._('Application Manager'),
                iconCls: 'setup_application_manager',
                disabled: testsFailed || configMissing || dbMissing,
                id: 'Application',
                leaf: true
            }]
        };
        
        Tine.Setup.TreePanel.superclass.initComponent.call(this);
        
        this.on('click', this.onNodeClick, this);
    },
    
    /**
     * @private
     */
    onNodeClick: function(node) {
        if (! node.disabled) {
            this.app.getMainScreen().activeContentType = node.id;
            this.app.getMainScreen().show();
        } else {
            return false;
        }
        
    },
    
    /**
     * @private
     */
    afterRender: function() {
        Tine.Setup.TreePanel.superclass.afterRender.call(this);
        
        var activeType = '';
        var contentTypes = this.getRootNode().childNodes;
        for (var i=0; i<contentTypes.length; i++) {
            if(! contentTypes[i].disabled) {
                activeType = contentTypes[i];
            }
        }
        
        activeType.select();
        this.app.getMainScreen().activeContentType = activeType.id;
        
        Tine.Setup.registry.on('replace', this.applyRegistryState, this);
    },
    
    applyRegistryState: function() {
        var setupChecks  = Tine.Setup.registry.get('setupChecks').success;
        var configExists = Tine.Setup.registry.get('configExists');
        var checkDB      = Tine.Setup.registry.get('checkDB');
        
        var envNode = this.getNodeById('EnvCheck');
        var envIconCls = setupChecks ? 'setup_checks_success' : 'setup_checks_fail';
        if (envNode.rendered) {
            var envIconEl = Ext.get(envNode.ui.iconNode);
            envIconEl.removeClass('setup_checks_success');
            envIconEl.removeClass('setup_checks_fail');
            envIconEl.addClass(envIconCls);
        } else {
            envNode.iconCls = envIconCls;
        }
        
        this.getNodeById('ConfigManager')[setupChecks ? 'enable': 'disable']();
        this.getNodeById('Application')[setupChecks && configExists && checkDB ? 'enable': 'disable']();
    }
});

/**************************** Models *****************************/
Ext.ns('Tine', 'Tine.Setup', 'Tine.Setup.Model');

Tine.Setup.Model.ApplicationArray = Tine.Tinebase.Model.genericFields.concat([
    { name: 'id'              },
    { name: 'name'            },
    { name: 'status'          },
    { name: 'order'           },
    { name: 'version'         },
    { name: 'current_version' },
    { name: 'install_status'  },
    { name: 'depends'         }
]);

/**
 * Task record definition
 */
Tine.Setup.Model.Application = Tine.Tinebase.data.Record.create(Tine.Setup.Model.ApplicationArray, {
    appName: 'Setup',
    modelName: 'Application',
    idProperty: 'name',
    titleProperty: 'name',
    // ngettext('Application', 'Applications', n); gettext('Application');
    recordName: 'Application',
    recordsName: 'Applications'
});

/**
 * default tasks backend
 */
Tine.Setup.ApplicationBackend = new Tine.Tinebase.widgets.app.JsonBackend({
    appName: 'Setup',
    modelName: 'Application',
    recordClass: Tine.Setup.Model.Application
});

/**
 * Model of a grant
 */
Tine.Setup.Model.EnvCheck = Ext.data.Record.create([
    {name: 'key'},
    {name: 'value'},
    {name: 'message'}
]);

// file: /var/www/tine20build/tine20/Setup/js/MainScreen.js
/*
 * Tine 2.0
 * 
 * @package     Setup
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.ns('Tine', 'Tine.Setup');

// default mainscreen
Tine.Setup.MainScreen = Ext.extend(Tine.Tinebase.widgets.app.MainScreen, {
    
    activeContentType: 'EnvCheck',
    
    /*
    show: function() {
        if(this.fireEvent("beforeshow", this) !== false){
            this.setTreePanel();
            this.setContentPanel();
            this.setToolbar();
            this.updateMainToolbar();
            
            this.fireEvent('show', this);
        }
        return this;
    },*/
    
    setContentPanel: function() {
        
        // which content panel?
        var type = this.activeContentType;
        
        if (! this[type + 'GridPanel']) {
            this[type + 'GridPanel'] = new Tine[this.app.appName][type + 'GridPanel']({
                app: this.app
            });
        }
        
        Tine.Tinebase.MainScreen.setActiveContentPanel(this[type + 'GridPanel'], true);
        this[type + 'GridPanel'].store.load();
    },
    
    getContentPanel: function() {
        // which content panel?
        var type = this.activeContentType;
        
        // we always return timesheet grid panel as a quick hack for saving filters
        return this[type + 'GridPanel'];
    },
    
    /**
     * sets toolbar in mainscreen
     */
    setToolbar: function() {
        var type = this.activeContentType;
        
        if (! this[type + 'ActionToolbar']) {
            this[type + 'ActionToolbar'] = this[type + 'GridPanel'].actionToolbar;
        }
        
        Tine.Tinebase.MainScreen.setActiveToolbar(this[type + 'ActionToolbar'], true);
        
        // disable preferences in main menu
        var preferences = Ext.getCmp('Tinebase_System_PreferencesButton');
        preferences.setDisabled(true);
    }
});

// file: /var/www/tine20build/tine20/Setup/js/ApplicationGridPanel.js
/*
 * Tine 2.0
 * 
 * @package     Setup
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
 Ext.ns('Tine', 'Tine.Setup');

Tine.Setup.ApplicationGridPanel = Ext.extend(Tine.Tinebase.widgets.app.GridPanel, {
    recordClass: Tine.Setup.Model.Application,
    recordProxy: Tine.Setup.ApplicationBackend,
    
    evalGrants: false,
    defaultSortInfo: {field: 'name', dir: 'ASC'},
    
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'name'
    },
    
    initComponent: function() {
                
        this.gridConfig.columns = this.getColumns();
        //this.actionToolbarItems = this.getToolbarItems();
        //this.initDetailsPanel();
        
        Tine.Setup.ApplicationGridPanel.superclass.initComponent.call(this);
        
        // activate local sort
        this.store.remoteSort = false;
    },
    
    getColumns: function() {
        return  [
            {id: 'name',            width: 350, sortable: true, dataIndex: 'name',            header: this.app.i18n._("Name")}, 
            {id: 'status',          width: 70,  sortable: true, dataIndex: 'status',          header: this.app.i18n._("Enabled"),       renderer: this.enabledRenderer}, 
            {id: 'order',           width: 50,  sortable: true, dataIndex: 'order',           header: this.app.i18n._("Order")},
            {id: 'version',         width: 70,  sortable: true, dataIndex: 'version',         header: this.app.i18n._("Installed Version")},
            {id: 'current_version', width: 70,  sortable: true, dataIndex: 'current_version', header: this.app.i18n._("Available Version")},
            {id: 'install_status',  width: 70,  sortable: true, dataIndex: 'install_status',  header: this.app.i18n._("Status"),        renderer: this.upgradeStatusRenderer.createDelegate(this)},
            {id: 'depends',         width: 150, sortable: true, dataIndex: 'depends',         header: this.app.i18n._("Depends on")}
        ];
    },
    
    initActions: function() {
        this.action_installApplications = new Ext.Action({
            text: this.app.i18n._('Install application'),
            handler: this.onAlterApplications,
            actionType: 'install',
            iconCls: 'setup_action_install',
            disabled: true,
            scope: this
        });
        
        this.action_uninstallApplications = new Ext.Action({
            text: this.app.i18n._('Uninstall application'),
            handler: this.onAlterApplications,
            actionType: 'uninstall',
            iconCls: 'setup_action_uninstall',
            disabled: true,
            scope: this
        });
        
        this.action_updateApplications = new Ext.Action({
            text: this.app.i18n._('Update application'),
            handler: this.onAlterApplications,
            actionType: 'update',
            iconCls: 'setup_action_update',
            disabled: true,
            scope: this
        });
        
        this.actions = [
            this.action_installApplications,
            this.action_uninstallApplications,
            this.action_updateApplications
        ];
        
        this.actionToolbar = new Ext.Toolbar({
            split: false,
            height: 26,
            items: this.actions.concat(this.actionToolbarItems)
        });
        
        this.contextMenu = new Ext.menu.Menu({
            items: this.actions.concat(this.contextMenuItems)
        });
        
    },
    
    initGrid: function() {
        Tine.Setup.ApplicationGridPanel.superclass.initGrid.call(this);
        this.selectionModel.purgeListeners();
        
        this.selectionModel.on('selectionchange', this.onSelectionChange, this);
    },

    /**
     * on render
     * 
     * @param {} ct
     * @param {} position
     * 
     */
    onRender: function(ct, position) {
        Tine.Setup.ApplicationGridPanel.superclass.onRender.call(this, ct, position);

        this.selectApps.defer(1000, this);
    },
    
    onSelectionChange: function(sm) {
        var apps = sm.getSelections();
        var disabled = sm.getCount() == 0;
        
        var nIn = disabled, nUp = disabled, nUn = disabled;
        
        for(var i=0; i<apps.length; i++) {
            var status = apps[i].get('install_status');
            nIn = nIn || status == 'uptodate' || status == 'updateable';
            nUp = nUp || status == 'uptodate' || status == 'uninstalled';
            nUn = nUn || status == 'uninstalled';
        }
        
        this.action_installApplications.setDisabled(nIn);
        this.action_uninstallApplications.setDisabled(nUn);
        this.action_updateApplications.setDisabled(nUp);
    },
    
    onAlterApplications: function(btn, e) {

        if (btn.actionType == 'uninstall') {
            // get user confirmation before uninstall
            Ext.Msg.confirm(this.app.i18n._('uninstall'), this.app.i18n._('Do you really want to uninstall the application(s)?'), function(confirmbtn, value) {
                if (confirmbtn == 'yes') {
                    this.alterApps(btn.actionType);
                }
            }, this);
        } else {
            this.alterApps(btn.actionType);
        }
    },
    
    /**
     * select all installable or updateable apps
     */
    selectApps: function() {
        
        var installable = [];
        var updateable = [];
        var firstInstall = true;
        
        this.store.each(function(record) {
            if (record.get('install_status') == 'updateable') {
                updateable.push(record);
                firstInstall = false;
            } else if (record.get('install_status') == 'uninstalled' 
                && record.get('name').match(/Tinebase|Admin|Calendar|Addressbook|Tasks|Felamimail/)
            ) {
                installable.push(record);
            } else if (record.get('install_status') == 'uptodate'){
                firstInstall = false;
            }
        }, this);
        
        if (firstInstall) {
            this.selectionModel.selectRecords(installable);
        } else {
            this.selectionModel.selectRecords(updateable);
        }
    },
    
    /**
     * alter applications
     * 
     * @param {} type (uninstall/install/update)
     */
    alterApps: function(type) {

        var appNames = [];
        var apps = this.selectionModel.getSelections();
        
        for(var i=0; i<apps.length; i++) {
            appNames.push(apps[i].get('name'));
        }
        
        var msg = this.app.i18n.n_('Updating Application "{0}".', 'Updating {0} Applications.', appNames.length);
        msg = String.format(msg, appNames.length == 1 ? appNames[0] : appNames.length ) + ' ' + this.app.i18n._('This may take a while');
        
        
        var longLoadMask = new Ext.LoadMask(this.grid.getEl(), {
            msg: msg,
            removeMask: true
        });
        longLoadMask.show();
        
        Ext.Ajax.request({
            scope: this,
            params: {
                method: 'Setup.' + type + 'Applications',
                applicationNames: Ext.util.JSON.encode(appNames)
            },
            success: function() {
                this.store.load();
                longLoadMask.hide();
            },
            fail: function() {
                Ext.Msg.alert(this.app.i18n._('Shit'), this.app.i18n._('Where are the backup tapes'));
            }
        });
    },
    
    enabledRenderer: function(value) {
        return Tine.Tinebase.common.booleanRenderer(value == 'enabled');
    },
    
    upgradeStatusRenderer: function(value) {
        return this.app.i18n._hidden(value);
    }
});
// file: /var/www/tine20build/tine20/Setup/js/EnvCheckGridPanel.js
/*
 * Tine 2.0
 * 
 * @package     Setup
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.ns('Tine', 'Tine.Setup');

Tine.Setup.EnvCheckGridPanel = Ext.extend(Ext.Panel, {
	
    /**
     * @property {Ext.Tollbar} actionToolbar
     */
    actionToolbar: null,
    /**
     * @property {Ext.Menu} contextMenu
     */
    contextMenu: null,
    
    /**
     * @private
     */
    layout: 'border',
    border: false,
	
    /**
     * 
     * @cfg grid config 
     */
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'key'
    },
	
    /**
     * init component
     */
    initComponent: function() {
    	
    	this.gridConfig.columns = this.getColumns();
    	
        this.initActions();
        this.initStore();
        this.initGrid();        
        this.initLayout();

        Tine.Setup.EnvCheckGridPanel.superclass.initComponent.call(this);
    },
    
    /**
     * init store
     * @private
     */
    initStore: function() {
    	this.store = new Ext.data.JsonStore({
            fields: Tine.Setup.Model.EnvCheck,
            mode: 'local',
            id: 'key',
            remoteSort: false
        });
        
        this.store.on('beforeload', function() {
            if (! this.loadMask) {
                this.loadMask = new Ext.LoadMask(this.el, {msg: this.app.i18n._("Performing Environment Checks...")});
            }
            
            this.loadMask.show();
            
            Ext.Ajax.request({
                params: {
                    method: 'Setup.envCheck'
                },
                scope: this,
                success: function(response) {
                    var data = Ext.util.JSON.decode(response.responseText);
                    Tine.Setup.registry.replace('setupChecks', data);
                    
                    this.store.loadData(data.results);
                    this.loadMask.hide();
                }
            })
            
            return false;
        }, this);
        
        var checkData = Tine.Setup.registry.get('setupChecks').results;
        this.store.loadData(checkData);
    },

    /**
     * init ext grid panel
     * @private
     */
    initGrid: function() {
        // init sel model
        this.selectionModel = new Ext.grid.RowSelectionModel({
            store: this.store
        });
        
        // init view
        var view =  new Ext.grid.GridView({
            autoFill: true,
            forceFit:true,
            ignoreAdd: true
            //emptyText: String.format(Tine.Tinebase.tranlation._("No {0} where found. Please try to change your filter-criteria, view-options or the {1} you search in."), this.i18nRecordsName, this.i18nContainersName),
            /*
            onLoad: Ext.emptyFn,
            listeners: {
                beforerefresh: function(v) {
                    v.scrollTop = v.scroller.dom.scrollTop;
                },
                refresh: function(v) {
                    // on paging-refreshes (prev/last...) we don't preserv the scroller state
                    if (v.isPagingRefresh) {
                        v.scrollToTop();
                        v.isPagingRefresh = false;
                    } else {
                        v.scroller.dom.scrollTop = v.scrollTop;
                    }
                }
            }
            */
        });
        
        this.grid = new Ext.grid.GridPanel(Ext.applyIf(this.gridConfig, {
            border: false,
            store: this.store,
            sm: this.selectionModel,
            view: view
        }));
    },
    
    getColumns: function() {
        return  [
            {id: 'key',   width: 150, sortable: true, dataIndex: 'key',   header: this.app.i18n._("Check")}, 
            {id: 'value', width: 50, sortable: true, dataIndex: 'value', header: this.app.i18n._("Result"), renderer: this.resultRenderer},
            {id: 'message', width: 600, sortable: true, dataIndex: 'message', header: this.app.i18n._("Error"), renderer: this.messageRenderer}
        ];
    },

    resultRenderer: function(value) {
    	var icon = (value) ? 'images/oxygen/16x16/actions/dialog-apply.png' : 'images/oxygen/16x16/actions/dialog-cancel.png';
        return '<img class="TasksMainGridStatus" src="' + icon + '">';
    },
    
    messageRenderer: function(value) {
    	// overwrite the default renderer to show links correctly
        return value;
    },
    
    initActions: function() {
    	// @todo add re-run checks here
    	
        this.action_reCheck = new Ext.Action({
            text: this.app.i18n._('Run setup tests'),
            handler: function() {
                this.store.load({});
            },
            iconCls: 'x-tbar-loading',
            scope: this
        });
    	/*
        this.action_installApplications = new Ext.Action({
            text: this.app.i18n._('Install application'),
            handler: this.onAlterApplications,
            actionType: 'install',
            iconCls: 'setup_action_install',
            disabled: true,
            scope: this
        });
        
        this.actions = [
            this.action_installApplications,
        ];
        */
        
        this.actionToolbar = new Ext.Toolbar({
            items: [
                this.action_reCheck
            ]
        });
    },
    
    /**
     * @private
     * 
     * NOTE: Order of items matters! Ext.Layout.Border.SplitRegion.layout() does not
     *       fence the rendering correctly, as such it's impotant, so have the ftb
     *       defined after all other layout items
     */
    initLayout: function() {
        this.items = [{
            region: 'center',
            xtype: 'panel',
            layout: 'fit',
            border: false,
            items: this.grid
        }];
    }
});

// file: /var/www/tine20build/tine20/Setup/js/ConfigManagerGridPanel.js
/*
 * Tine 2.0
 * 
 * @package     Setup
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: setup-all.js,v 1.1 2009/12/08 23:14:54 hyokos Exp $
 *
 */
 
Ext.ns('Tine', 'Tine.Setup');
 
/**
 * Setup Configuration Manager
 * 
 * @package Setup
 * 
 * @class Tine.Setup.ConfigManagerGridPanel
 * @extends Ext.FormPanel
 * 
 * NOTE: 
 * - For each section in the config file, a group in the form is added.
 * - Form names are constructed <section>_<subsection>... and transformed transparently by this component
 * - Enabling and Disabling of sections is handled automatically if you give the id 'setup-<section>-group' 
 *   to the checkboxToggle enabled fieldset
 */
Tine.Setup.ConfigManagerGridPanel = Ext.extend(Ext.FormPanel, {
    
    border: false,
    bodyStyle:'padding:5px 5px 0',
    labelAlign: 'left',
    labelSeparator: ':',
    labelWidth: 150,
    defaults: {
        xtype: 'fieldset',
        autoHeight: 'auto',
        defaults: {width: 300},
        defaultType: 'textfield'
    },
    
    // fake a store to satisfy grid panel
    store: {load: Ext.emptyFn},
    
    /**
     * save config and update setup registry
     */
    onSaveConfig: function() {
        if (this.getForm().isValid()) {
            var configData = this.form2config();
            
            this.loadMask.show();
            Ext.Ajax.request({
                scope: this,
                params: {
                    method: 'Setup.saveConfig',
                    data: Ext.util.JSON.encode(configData)
                },
                success: function(response) {
                    var regData = Ext.util.JSON.decode(response.responseText);
                    // replace some registry data
                    for (key in regData) {
                        if (key != 'status') {
                            Tine.Setup.registry.replace(key, regData[key]);
                        }
                    }
                    this.loadMask.hide();
                }
            });
        } else {
            Ext.Msg.alert(this.app.i18n._('Invalid configuration'), this.app.i18n._('You need to correct the red marked fields before config could be saved'));
        }
    },
    
    /**
     * check config from server and update setup registry
     */
    onCheckConfig: function() {
        this.loadMask.show();
            Ext.Ajax.request({
                scope: this,
                params: {
                    method: 'Setup.checkConfig'
                },
                success: function(response) {
                    var regData = Ext.util.JSON.decode(response.responseText);
                    // replace some registry data
                    for (key in regData) {
                        if (key != 'status') {
                            Tine.Setup.registry.replace(key, regData[key]);
                        }
                    }
                    this.loadMask.hide();
                }
            });
    },
    
    /**
     * @private
     */
    initComponent: function() {
        this.initActions();
        this.items = this.getFormItems();

        Tine.Setup.ConfigManagerGridPanel.superclass.initComponent.call(this);
    },
    
    /**
     * @private
     */
    onRender: function(ct, position) {
        Tine.Setup.ConfigManagerGridPanel.superclass.onRender.call(this, ct, position);
        
        // always the same shit! when form panel is rendered, the form fields itselv are not yet rendered ;-(
        var formData = this.config2form.defer(250, this, [Tine.Setup.registry.get('configData')]);
        
        Tine.Setup.registry.on('replace', this.applyRegistryState, this);
        this.loadMask = new Ext.LoadMask(ct, {msg: this.app.i18n._('Transfering Configuration...')});
    },
    
    /**
     * returns config manager form
     * 
     * @private
     * @return {Array} items
     */
    getFormItems: function() {
        return [/*{
            xtype: 'panel',
            title: this.app.i18n._('Informations'),
            iconCls: 'setup_info',
            html: ''
        },*/ {
            title: this.app.i18n._('Setup Authentication'),
            items: [{
                name: 'setupuser_username',
                fieldLabel: this.app.i18n._('Username'),
                allowBlank: false
            }, {
                name: 'setupuser_password',
                fieldLabel: this.app.i18n._('Password'),
                inputType: 'password',
                allowBlank: false
            }] 
        }, {
            title: this.app.i18n._('Database'),
            id: 'setup-database-group',
            items: [{
                name: 'database_adapter',
                fieldLabel: this.app.i18n._('Adapter'),
                value: 'pdo_mysql',
                disabled: true
            }, {
                name: 'database_host',
                fieldLabel: this.app.i18n._('Hostname'),
                allowBlank: false
            }, {
                name: 'database_dbname',
                fieldLabel: this.app.i18n._('Database'),
                allowBlank: false
            }, {
                name: 'database_username',
                fieldLabel: this.app.i18n._('User'),
                allowBlank: false
            }, {
                name: 'database_password',
                fieldLabel: this.app.i18n._('Password'),
                inputType: 'password'
            }, {
                name: 'database_tableprefix',
                fieldLabel: this.app.i18n._('Prefix')
            }]
        }, {
            title: this.app.i18n._('Logging'),
            id: 'setup-logger-group',
            checkboxToggle:true,
            collapsed: true,
            items: [{
                name: 'logger_filename',
                fieldLabel: this.app.i18n._('Filename')
            }, {
                xtype: 'combo',
                width: 283, // late rendering bug
                listWidth: 300,
                mode: 'local',
                forceSelection: true,
                allowEmpty: false,
                triggerAction: 'all',
                selectOnFocus:true,
                store: [[0, 'Emergency'], [1,'Alert'], [2, 'Critical'], [3, 'Error'], [4, 'Warning'], [5, 'Notice'], [6, 'Informational'], [7, 'Debug']],
                name: 'logger_priority',
                fieldLabel: this.app.i18n._('Priority')

            }]
        }, {
            title: this.app.i18n._('Caching'),
            id: 'setup-caching-group',
            checkboxToggle:true,
            collapsed: true,
            items: [{
                name: 'caching_path',
                fieldLabel: this.app.i18n._('Path')
            }, {
                name: 'caching_lifetime',
                fieldLabel: this.app.i18n._('Lifetime (seconds)'),
                xtype: 'numberfield',
                minValue: 0,
                maxValue: 3600
            }]
        }];
    },
    
    /**
     * transforms form data into a config object
     * 
     * @param  {Object} formData
     * @return {Object} configData
     */
    form2config: function() {
        // getValues only returns RAW HTML content... and we don't want to 
        // define a record here
        var formData = {};
        this.getForm().items.each(function(field) {
            formData[field.name] = field.getValue();
        });
        
        var configData = {};
        var keyParts, keyPart, keyGroup, dataPath;
        for (key in formData) {
            keyParts = key.split('_');
            dataPath = configData;
            
            while (keyPart = keyParts.shift()) {
                if (keyParts.length == 0) {
                    dataPath[keyPart] = formData[key];
                } else {
                    if (!dataPath[keyPart]) {
                        dataPath[keyPart] = {};
                        
                        // is group active?
                        keyGroup = Ext.getCmp('setup-' + keyPart + '-group');
                        if (keyGroup && keyGroup.checkboxToggle) {
                            dataPath[keyPart].active = !keyGroup.collapsed;
                        }
                    }
                
                    dataPath = dataPath[keyPart];
                }
            }
        }
        return configData;
    },
    
    /**
     * loads form with config data
     * 
     * @param  {Object} configData
     */
    config2form: function(configData) {
        var formData = arguments[1] ? arguments[1] : {};
        var currKey  = arguments[2] ? arguments[2] : '';
        
        var keyGroup;
        for (key in configData) {
            if(typeof configData[key] == 'object') {
                this.config2form(configData[key], formData, currKey ? currKey + '_' + key : key);
            } else {
                formData[currKey + '_' + key] = configData[key];
                
                // activate group?
                keyGroup = Ext.getCmp('setup-' + currKey + '-group');
                if (keyGroup && key == 'active' && configData.active) {
                    keyGroup.expand();
                }
            }
        }
        
        // skip transform calls
        if (! currKey) {
            this.getForm().setValues(formData);
            this.applyRegistryState();
        }
    },
    
    /**
     * applies registry state to this cmp
     */
    applyRegistryState: function() {
        this.action_saveConfig.setDisabled(!Tine.Setup.registry.get('configWritable'));
        Ext.getCmp('setup-database-group').setIconClass(Tine.Setup.registry.get('checkDB') ? 'setup_checks_success' : 'setup_checks_fail');
    },
    
    /**
     * @private
     */
    initActions: function() {
        this.action_reCheck = new Ext.Action({
            text: this.app.i18n._('Check config'),
            handler: this.onCheckConfig,
            iconCls: 'x-tbar-loading',
            scope: this
        });
        
        this.action_saveConfig = new Ext.Action({
            text: this.app.i18n._('Save config'),
            iconCls: 'setup_action_save_config',
            scope: this,
            handler: this.onSaveConfig,
            disabled: true
        });
        
        this.action_downloadConfig = new Ext.Action({
            text: this.app.i18n._('Download config file'),
            iconCls: 'setup_action_download_config',
            disabled: true
        });
        
        this.actionToolbar = new Ext.Toolbar({
            items: [
                this.action_reCheck,
                this.action_saveConfig,
                this.action_downloadConfig
            ]
        });
    }
}); 
