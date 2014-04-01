<?php
/**
 * Tine 2.0
 * 
 * @package     Addressbook
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Csv.php,v 1.1 2009/12/08 23:16:22 hyokos Exp $
 * 
 *

/**
 * csv import class for the addressbook
 * 
 * @package     Addressbook
 * @subpackage  Import
 * 
 */
class Addressbook_Import_Csv extends Tinebase_Import_Csv_Abstract
{
    /**
     * add some more values (container id)
     *
     * @return array
     */
    protected function _addData()
    {
        $result = array();
        if (isset($this->_options['container_id'])) {
            $result['container_id'] = $this->_options['container_id'];
        }

        return $result;
    }
}
