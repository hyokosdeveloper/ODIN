    <?php
/**
 * main view
 * 
 * @package     Tinebase
 * @subpackage  Views
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: mainscreen.php,v 1.1 2009/12/08 23:15:16 hyokos Exp $
 *
 * @todo        check if build script puts the translation files in build dir $tineBuildPath
 */

  $companyName = "Odin";


?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>
		<?php echo $this->escape($companyName) ?>        
    </title>

    <link rel="icon" href="images/favicon.ico" type="image/x-icon" />

    <!-- EXT JS -->
    <link rel="stylesheet" type="text/css" href="library/ExtJS/resources/css/ext-all.css" />
    <!-- 
    <link rel="stylesheet" type="text/css" href="library/ExtJS/resources/css/xtheme-gray.css" />
    
    <link rel="stylesheet" type="text/css" href="library/ExtJS/resources/css/xtheme-darkgray.css" />    
    <link rel="stylesheet" type="text/css" href="library/ExtJS/resources/css/xtheme-slate.css" />    
    <link rel="stylesheet" type="text/css" href="library/ExtJS/resources/css/xtheme-gray.css" />
        
    <link rel="stylesheet" type="text/css" href="library/ExtJS/resources/css/xtheme-black.css" />
    <link rel="stylesheet" type="text/css" href="library/ExtJS/resources/css/xtheme-slickness.css" />
   
     -->
     

    
    <?php /*
    <!-- <script type="text/javascript" src="library/ExtJS/adapter/yui/yui-utilities.js"></script> -->
    <!-- <script type="text/javascript" src="library/ExtJS/adapter/yui/ext-yui-adapter.js"></script> --> */
    ?>
    
    <script type="text/javascript" src="library/ExtJS/adapter/ext/ext-base.js"></script>
    
    <script type="text/javascript" src="library/ExtJS/ext-all<?php echo TINE20_BUILDTYPE != 'DEBUG' ? '-debug' : '' ?>.js"></script>
    <!--
    <script type="text/javascript" src="library/ExtJS/ext-all</head>/?php echo TINE20_BUILDTYPE != 'RELEASE' ? '-debug' : '' ?>.js"></script>
    -->

    <!-- Tine 2.0 static files --><?php
        /**
         * this variable gets replaced by the buildscript
         */
        $tineBuildPath = '2009-07-7/';
        
        $locale = Zend_Registry::get('locale');
        switch(TINE20_BUILDTYPE) {
            case 'DEVELOPMENT':
                $includeFiles = Tinebase_Frontend_Http::getAllIncludeFiles();
                
                // js files
                foreach ($includeFiles['css'] as $name) {
                    echo "\n    ". '<link rel="stylesheet" type="text/css" href="'. Tinebase_Frontend_Http_Abstract::_appendFileTime($name) .'" />';
                }
                
                //css files
                foreach ($includeFiles['js'] as $name) {
                    echo "\n    ". '<script type="text/javascript" language="javascript" src="'. Tinebase_Frontend_Http_Abstract::_appendFileTime($name) .'"></script>';
                }
                
                // laguage file
                echo "\n    ". '<script type="text/javascript" language="javascript" src="index.php?method=Tinebase.getJsTranslations&' . time() . '"></script>';
                break;

            case 'DEBUG':
                echo "\n    <link rel='stylesheet' type='text/css' href='" . Tinebase_Frontend_Http_Abstract::_appendFileTime('Tinebase/css/' . $tineBuildPath . 'tine-all-debug.css') . "' />";
                echo "\n    <script type='text/javascript' language='javascript' src='" . Tinebase_Frontend_Http_Abstract::_appendFileTime('Tinebase/js/' . $tineBuildPath . 'tine-all-debug.js') . "'></script>";
                echo "\n    <script type='text/javascript' language='javascript' src='" . Tinebase_Frontend_Http_Abstract::_appendFileTime("Tinebase/js/Locale/build/" . (string)$locale . "-all-debug.js") ."'></script>";
                break;
                
            case 'RELEASE':
                echo "\n    <link rel='stylesheet' type='text/css' href='Tinebase/css/" . $tineBuildPath . "tine-all.css' />";
                echo "\n    <script type='text/javascript' language='javascript' src='Tinebase/js/" . $tineBuildPath . "tine-all.js'></script>";
                echo "\n    <script type='text/javascript' language='javascript' src='Tinebase/js/Locale/build/" . (string)$locale . "-all.js'></script>";
                break;
        }
        
        if (Tinebase_Core::getConfig()->customMainscreenHeaders) {echo "\n" . Tinebase_Core::getConfig()->customMainscreenHeaders;} ?>
        
</head>
<body>
    <noscript>You need to enable javascript to use <a href="http://www.tinlab.com">odin.</a></noscript>
</body>
</html>
