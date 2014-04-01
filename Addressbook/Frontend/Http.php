<?php
/**
 * Tine 2.0
 *
 * @package     Addressbook
 * @subpackage  Frontend
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Http.php,v 1.1 2009/12/08 23:16:36 hyokos Exp $
 */

/**
 * Addressbook http frontend class
 *
 * This class handles all Http requests for the addressbook application
 *
 * @package     Addressbook
 * @subpackage  Frontend
 */
class Addressbook_Frontend_Http extends Tinebase_Frontend_Http_Abstract
{
    /**
     * app name
     *
     * @var string
     */
    protected $_applicationName = 'Addressbook';
    
    /**
     * export contact
     * 
     * @param	string JSON encoded string with contact ids for multi export or contact filter
     * @param	format	pdf or csv or ...
     */
    public function exportContacts($_filter, $_format = 'pdf')
    {        
        switch ($_format) {
            case 'pdf':
                
                $decodedFilter = Zend_Json::decode($_filter);
                
                if (is_array($decodedFilter)) {
                    $filter = new Addressbook_Model_ContactFilter($decodedFilter);
                    $paging = new Tinebase_Model_Pagination();
                    $contactIds = Addressbook_Controller_Contact::getInstance()->search($filter, $paging, false, true);                
                } else {
                    $contactIds = array($decodedFilter);
                }
                
                $pdf = new Addressbook_Export_Pdf();
                
                foreach ($contactIds as $contactId) {
                    $contact = Addressbook_Controller_Contact::getInstance()->get($contactId);
                    $pdf->generateContactPdf($contact);
                }
                    
                try {
                    $pdfOutput = $pdf->render();
                } catch (Zend_Pdf_Exception $e) {
                    Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' error creating pdf: ' . $e->__toString());
                    //echo "could not create pdf <br/>". $e->__toString();
                    //exit();            
                }
                
                header("Pragma: public");
                header("Cache-Control: max-age=0");
                header("Content-Disposition: inline; filename=contact.pdf"); 
                header("Content-type: application/x-pdf"); 
                echo $pdfOutput;
                break;
            
            case 'csv':
                $filter = new Addressbook_Model_ContactFilter(Zend_Json::decode($_filter));
                
                $csvExportClass = new Addressbook_Export_Csv();
                $result = $csvExportClass->exportContacts($filter);
                
                header("Pragma: public");
                header("Cache-Control: max-age=0");
                header("Content-Disposition: attachment; filename=contacts_export.csv");
                header("Content-Description: csv File");  
                header("Content-type: text/csv"); 
                readfile($result);
                exit;
                                
            default:
                echo "Format $_format not supported yet.";
                exit();
        }        
    }
    
    /**
     * Returns all JS files which must be included for Addressbook
     * 
     * @return array array of filenames
     */
    public function getJsFilesToInclude ()
    {
        return array(
            'Addressbook/js/Addressbook.js',
            'Addressbook/js/ContactGridDetailsPanel.js',
            'Addressbook/js/ContactGrid.js',
            'Addressbook/js/EditDialog.js',
            'Addressbook/js/SearchCombo.js',
        );
    }
}
