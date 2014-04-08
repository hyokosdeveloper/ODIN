<?php
/**
 * Tine 2.0
 *
 * @package     Calendar
 * @license     http://www.gnu.org/licenses/agpl.html AGPL3
 * @copyright   Copyright (c) 2010 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @version     $Id: Release3.php,v 1.1 2010/04/13 21:56:20 hyokos Exp $
 */

class Tasks_Setup_Update_Release3 extends Setup_Update_Abstract
{
    /**
     * migragte from class_id (not used) to class
     */
    public function update_0()
    {
        // we need to drop the foreign key first
        try {
            $this->_backend->dropForeignKey('tasks', 'tasks::class_id--class::id');
        } catch (Zend_Db_Statement_Exception $zdse) {
            // try it again with table prefix
            $this->_backend->dropForeignKey('tasks', SQL_TABLE_PREFIX . 'tasks::class_id--class::id');
        }
        
        $this->_backend->dropCol('tasks', 'class_id');
        $this->_backend->dropTable('class');
        
        $declaration = new Setup_Backend_Schema_Field_Xml('
            <field>
                <name>class</name>
                <type>text</type>
                <length>40</length>
                <default>PUBLIC</default>
                <notnull>true</notnull>
            </field>');
        $this->_backend->addCol('tasks', $declaration, 11);
        
        $declaration = new Setup_Backend_Schema_Index_Xml('
            <index>
                <name>class</name>
                <field>
                    <name>class</name>
                </field>
            </index>');
        $this->_backend->addIndex('tasks', $declaration);
        
        $this->setTableVersion('tasks', 3);
        $this->setApplicationVersion('Tasks', '3.1');
    }
}