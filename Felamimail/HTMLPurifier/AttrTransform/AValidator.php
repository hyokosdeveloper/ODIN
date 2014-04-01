<?php
/**
 * Tine 2.0
 * 
 * anchor validator/transformator for html purifier
 *
 * @package     Felamimail
 * @subpackage  HTMLPurifier
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: AValidator.php,v 1.1 2009/12/08 23:16:44 hyokos Exp $
 */

/**
 * Felamimail_HTMLPurifier_AttrTransform_AValidator
 *
 */
class Felamimail_HTMLPurifier_AttrTransform_AValidator extends HTMLPurifier_AttrTransform
{
    var $name = "Link validation";
    
    function transform($attr, $config, $context) {
        $attr['target'] = '_blank';
        return $attr;
    }
}
