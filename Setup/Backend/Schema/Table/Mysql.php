<?php
/**
 * Tine 2.0 - http://www.tine20.org
 * 
 * @package     Setup
 * @license     http://www.gnu.org/licenses/agpl.html
 * @copyright   Copyright (c) 2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Matthias Greiling <m.greiling@metaways.de>
 * @version     $Id: Mysql.php,v 1.1 2009/12/08 23:15:32 hyokos Exp $
 */


class Setup_Backend_Schema_Table_Mysql extends Setup_Backend_Schema_Table_Abstract
{

    public function __construct($_tableDefinition)
    {
         $this->name = substr($_tableDefinition->TABLE_NAME, strlen(SQL_TABLE_PREFIX));
         $version = explode(';', $_tableDefinition->TABLE_COMMENT);
         $this->version = substr($version[0], 9);  
    }
      
    public function setFields($_fieldDefinitions)
    {
        foreach ($_fieldDefinitions as $fieldDefinition) {
            $this->addField(Setup_Backend_Schema_Field_Factory::factory('Mysql', $fieldDefinition));
        }
    }
}