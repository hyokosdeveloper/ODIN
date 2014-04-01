<?php
/**
 * search interface for controller for Tine 2.0 applications
 * 
 * @package     Tinebase
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: SearchInterface.php,v 1.1 2009/12/08 23:16:33 hyokos Exp $
 *
 * @todo        activate functions again when admin controllers are refactored
 */

/**
 * search interface for controller
 * 
 * @package     Tinebase
 * @subpackage  Controller
 */
interface Tinebase_Controller_SearchInterface
{    
    /**
     * get list of records
     *
     * @param Tinebase_Model_Filter_FilterGroup|optional $_filter
     * @param Tinebase_Model_Pagination|optional $_pagination
     * @param bool $_getRelations
     * @return Tinebase_Record_RecordSet
     */
    //public function search(Tinebase_Model_Filter_FilterGroup $_filter = NULL, Tinebase_Record_Interface $_pagination = NULL, $_getRelations = FALSE, $_onlyIds = FALSE);
    
    /**
     * Gets total count of search with $_filter
     * 
     * @param Tinebase_Model_Filter_FilterGroup $_filter
     * @return int
     */
    //public function searchCount(Tinebase_Model_Filter_FilterGroup $_filter);
}
