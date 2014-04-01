<?php
/**
 * Tine 2.0
 *
 * @package     Erp
 * @license     http://www.gnu.org/licenses/agpl.html AGPL3
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id: Release0.php,v 1.1 2009/12/08 23:15:36 hyokos Exp $
 */

class Erp_Setup_Update_Release0 extends Setup_Update_Abstract
{
    /**
     * change all fields which store account ids from integer to string
     * 
     */
    public function update_1()
    {
        $declaration = new Setup_Backend_Schema_Field_Xml('
            <field>
                <name>created_by</name>
                <type>text</type>
                <length>40</length>
            </field>');
        $this->_backend->alterCol('erp_contracts', $declaration, 'created_by');
        
        
        $declaration = new Setup_Backend_Schema_Field_Xml('
            <field>
                <name>last_modified_by</name>
                <type>text</type>
                <length>40</length>
            </field>');
        $this->_backend->alterCol('erp_contracts', $declaration, 'last_modified_by');

        
        $declaration = new Setup_Backend_Schema_Field_Xml('
            <field>
                <name>deleted_by</name>
                <type>text</type>
                <length>40</length>
            </field>');
        $this->_backend->alterCol('erp_contracts', $declaration, 'deleted_by');
        
        
        $declaration = new Setup_Backend_Schema_Field_Xml('
            <field>
                <name>account_id</name>
                <type>text</type>
                <length>40</length>
                <notnull>true</notnull>
            </field>');
        $this->_backend->alterCol('erp_numbers', $declaration, 'account_id');
        
        $this->setApplicationVersion('Erp', '0.2');
    }
}
