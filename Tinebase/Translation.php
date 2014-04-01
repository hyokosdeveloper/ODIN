<?php
/**
 * Tine 2.0
 *
 * @package     Tinebase
 * @subpackage  Server
 * @license     http://www.gnu.org/licenses/agpl.html AGPL3
 * @copyright   Copyright (c) 2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id: Translation.php,v 1.1 2009/12/08 23:14:27 hyokos Exp $
 */



/**
 * primary class to handle translations
 *
 * @package     Tinebase
 * @subpackage  Server
 */
class Tinebase_Translation
{
	/**
	 * Layzy loading for {@see getCountryList()}
	 * 
	 * @var array
	 */
	protected static $_countryLists = array();
	
    /**
     * array with translations for applications 
     * - is used in getTranslations to save already initialized translations
     * - 2 dim array -> language / application
     * 
     * @var array
     */
    protected static $_translations = array();
    
    /**
     * List of officially supported languages
     *
     * @var array
     */
    private static $SUPPORTED_LANGS = array(
        'bg',      // Bulgarian            Dimitrina Mileva <d.mileva@metaways.de>
        'cs',      // Czech                Michael Sladek <msladek@brotel.cz>
        'de',      // German               Cornelius Weiss <c.weiss@metaways.de>
        'en',      // English              Cornelius Weiss <c.weiss@metaways.de>
        //'es',      // Spanish              Holger Rothemund <holger@rothemund.org>
        'fr',      // French               Rémi Peltier <rpeltier@agglo-clermont.fr>
        //'it',      // Italian              Lidia Panio <lidiapanio@hotmail.com>
        'ja',      // Japanese             Yuuki Kitamura <ykitamura@clasi-co.jp>
        //'nl',      // Dutch                Joost Venema <post@joostvenema.nl>
        'pl',      // Polish               Wojciech Kaczmarek <wojciech_kaczmarek@wp.pl> 
        //'pt',      // Portuguese           Holger Rothemund <holger@rothemund.org>
        'ru',      // Russian              Nikolay Parukhin <parukhin@gmail.com>
        'zh_CN',   // Chinese Simplified   Jason Qi <qry@yahoo.com>
        'zh_TW',   // Chinese Traditional  Frank Huang <frank.cchuang@gmail.com>
    );
    
    /**
     * returns list of all available translations
     * 
     * NOTE available are those, having a Tinebase translation
     * 
     * @return array list of all available translation
     *
     */
    public static function getAvailableTranslations()
    {
        $availableTranslations = array();
        
        if (TINE20_BUILDTYPE == 'RELEASE') {
            $list = self::$SUPPORTED_LANGS;
        } else {
            // look for po files in Tinebase
            $dirContents = scandir(dirname(__FILE__) . '/translations');
            sort($dirContents);
            $list = array();
            
            foreach ($dirContents as $poFile) {
                list ($localestring, $suffix) = explode('.', $poFile);
                if ($suffix == 'po') {
                    $list[] = $localestring;
                }
            }
        }
        
        foreach ($list as $localestring) {
            $locale = new Zend_Locale($localestring);
            $availableTranslations[] = array(
                'locale'   => $localestring,
                'language' => $locale->getLanguageTranslation($locale->getLanguage()),
                'region'   => $locale->getCountryTranslation($locale->getRegion())
            );
        }
            
        return $availableTranslations;
    }
    
    /**
     * get list of translated country names
     *
     * @return array list of countrys
     */
    public static function getCountryList()
    {
    	$locale = Tinebase_Core::get('locale');
    	$language = $locale->getLanguage();
    	
    	//try lazy loading of translated country list
    	if (empty(self::$_countryLists[$language])) {
	        $countries = $locale->getCountryTranslationList();
	        asort($countries);
	        foreach($countries as $shortName => $translatedName) {
	            $results[] = array(
	                'shortName'         => $shortName, 
	                'translatedName'    => $translatedName
	            );
	        }
	
	        self::$_countryLists[$language] = $results;
    	}

    	return array('results' => self::$_countryLists[$language]);
    }
    
    /**
     * Get translated country name for a given ISO {@param $_regionCode}
     * 
     * @param String $regionCode [e.g. DE, US etc.]
     * @return String | null [e.g. Germany, United States etc.]
     */
    public static function getCountryNameByRegionCode($_regionCode)
    {
    	$countries = self::getCountryList();
    	foreach($countries['results'] as $country) {
    		if ($country['shortName'] === $_regionCode) {
    			return $country['translatedName'];
    		}
    	} 

    	return null;
    }
    
    /**
     * Get translated country name for a given ISO {@param $_regionCode}
     * 
     * @param String $regionCode [e.g. DE, US etc.]
     * @return String | null [e.g. Germany, United States etc.]
     */
    public static function getRegionCodeByCountryName($_countryName)
    {
        $countries = self::getCountryList();
        foreach($countries['results'] as $country) {
            if ($country['translatedName'] === $_countryName) {
                return $country['shortName'];
            }
        } 

        return null;
    }
    
    /**
     * gets a supported locale
     *
     * @param   string $_localeString
     * @return  Zend_Locale
     * @throws  Tinebase_Exception_NotFound
     */
    public static function getLocale($_localeString = 'auto')
    {
        Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " given localeString '$_localeString'");
        try {
            $locale = new Zend_Locale($_localeString);
            
            // check if we suppot the locale
            $supportedLocales = array();
            $availableTranslations = self::getAvailableTranslations();
            foreach ($availableTranslations as $translation) {
                $supportedLocales[] = $translation['locale'];
            }
            
            if (! in_array($_localeString, $supportedLocales)) {
                Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " '$locale' is not supported, checking fallback");
                
                // check if we find suiteable fallback
                $language = $locale->getLanguage();
                switch ($language) {
                    case 'zh':
                        $locale = new Zend_Locale('zh_CN');
                        break;
                    default: 
                        if (in_array($language, $supportedLocales)) {
                            $locale = new Zend_Locale($language);
                        } else {
                            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " no suiteable lang fallback found within this locales: " . print_r($supportedLocales, true) );
                            throw new Tinebase_Exception_NotFound('No suiteable lang fallback found.');
                        }
                        break;
                }
            }
        } catch (Exception $e) {
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " $e, falling back to locale en");
            $locale = new Zend_Locale('en');
        }
        
        Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " selected locale: '$locale'");
        return $locale;
    }
    
    /**
     * get zend translate for an application
     * 
     * @param  string $_applicationName
     * @return Zend_Translate
     * 
     * @todo return 'void' if locale = en
    */
    public static function getTranslation($_applicationName)
    {
        $locale = Tinebase_Core::get('locale');
        
        // check if translation exists
        if (isset(self::$_translations[(string)$locale][$_applicationName])) {

            // use saved translation
            $translate = self::$_translations[(string)$locale][$_applicationName];
            
        } else {
            
            // create new translation
            $path = dirname(__FILE__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . ucfirst($_applicationName) . DIRECTORY_SEPARATOR . 'translations';
            $translate = new Zend_Translate('gettext', $path, null, array('scan' => Zend_Translate::LOCALE_FILENAME));

            try {
                $translate->setLocale($locale);
                Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ .' locale used: ' . (string)$locale);
                
            } catch (Zend_Translate_Exception $e) {
                // the locale of the user is not available
                Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ .' locale not found: ' . (string)$locale);
            }
            
            self::$_translations[(string)$locale][$_applicationName] = $translate;
        }
        
        return $translate;
    }
    
    /**
     * Returns collection of all javascript translations data for requested language
     * 
     * This is a javascript spechial function!
     * The data will be preseted to be included as javascript on client side!
     *
     * @param  Zend_Locale $_locale
     * @return string      javascript
     */
    public static function getJsTranslations($_locale)
    {
        $baseDir = dirname(__FILE__) . "/..";
        $localeString = (string) $_locale;
        
        $jsTranslations  = "/************************** generic translations **************************/ \n";
        $jsTranslations .= file_get_contents("$baseDir/Tinebase/js/Locale/static/generic-$localeString.js");
        
        $jsTranslations  .= "/*************************** extjs translations ***************************/ \n";
        if (file_exists("$baseDir/library/ExtJS/source/locale/ext-lang-$localeString.js")) {
            $jsTranslations  .= file_get_contents("$baseDir/library/ExtJS/source/locale/ext-lang-$localeString.js");
        } else {
            $jsTranslations  .= "console.error('Translation Error: extjs chaged their lang file name again ;-(');";
        }
        
        $poFiles = self::getPoTranslationFiles($_locale);
        foreach ($poFiles as $appName => $poPath) {
            $poObject = self::po2jsObject($poPath);
            $jsTranslations  .= "/********************** tine translations of $appName**********************/ \n";
            $jsTranslations .= "Locale.Gettext.prototype._msgs['./LC_MESSAGES/$appName'] = new Locale.Gettext.PO($poObject); \n";
        }
        
        return $jsTranslations;
    }
    
    /**
     * gets array of lang dirs from all applications having translations
     * 
     * Note: This functions must not query the database! 
     *       It's only used in the development and release building process
     * 
     * @return array appName => translationDir
     */
    public static function getTranslationDirs()
    {
        $tine20path = dirname(__File__) . "/..";
        
        $langDirs = array();
        $d = dir($tine20path);
        while (false !== ($appName = $d->read())) {
            $appPath = "$tine20path/$appName";
            if ($appName{0} != '.' && is_dir($appPath)) {
                $translationPath = "$appPath/translations";
                if (is_dir($translationPath)) {
                    $langDirs[$appName] = $translationPath;
                }
            }
        }
        return $langDirs;
    }
    
    /**
     * gets all available po files for a given locale
     *
     * @param  Zend_Locale $_locale
     * @return array appName => pofile path
     */
    public static function getPoTranslationFiles($_locale)
    {
        $localeString = (string)$_locale;
        $poFiles = array();
        
        $translationDirs = self::getTranslationDirs();
        foreach ($translationDirs as $appName => $translationDir) {
            $poPath = "$translationDir/$localeString.po";
            if (file_exists($poPath)) {
                $poFiles[$appName] = $poPath;
            }
        }
        
        return $poFiles;
    }
    
    /**
     * convertes po file to js object
     * 
     * @todo rewrite this in a way that we can automatically add singulars
     *       seperatly into the js output
     *
     * @param  string $filePath
     * @return string
     */
    public static function po2jsObject($filePath)
    {
        $po = file_get_contents($filePath);
        
        global $first, $plural;
        $first = true; 
        $plural = false;
        
        $po = preg_replace('/\r?\n/', "\n", $po);
        $po = preg_replace('/#.*\n/', '', $po);
        // 2008-08-25 \s -> \n as there are situations when whitespace like space breaks the thing!
        $po = preg_replace('/"(\n+)"/', '', $po);
        $po = preg_replace('/msgid "(.*?)"\nmsgid_plural "(.*?)"/', 'msgid "$1, $2"', $po);
        $po = preg_replace_callback('/msg(\S+) /', create_function('$matches','
            global $first, $plural;
            switch ($matches[1]) {
                case "id":
                    if ($first) {
                        $first = false;
                        return "";
                    }
                    if ($plural) {
                        $plural = false;
                        return "]\n, ";
                    }
                    return ", ";
                case "str":
                    return ": ";
                case "str[0]":
                    $plural = true;
                    return ": [\n  ";
                default:
                    return " ,";
            }
        '), $po);
        $po = "({\n" . (string)$po . ($plural ? "]\n})" : "\n})");
        return $po;
    }
}
