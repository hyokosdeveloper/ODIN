<?php
/**
 * Tine 2.0
 *
 * @package     Erp
 * @subpackage  Frontend
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Http.php,v 1.1 2009/12/08 23:15:37 hyokos Exp $
 */

/**
 * This class handles all Http requests for the Erp application
 *
 * @package     Erp
 * @subpackage  Frontend
 */
class Erp_Frontend_Http extends Tinebase_Frontend_Http_Abstract
{
    protected $_applicationName = 'Erp';
    
    /**
     * Returns all JS files which must be included for this app
     *
     * @return array Array of filenames
     */
    public function getJsFilesToInclude()
    {
        return array(
            'Erp/js/Erp.js',
            'Erp/js/ContractGridPanel.js',
            'Erp/js/ContractEditDialog.js',
        );
    }
}
