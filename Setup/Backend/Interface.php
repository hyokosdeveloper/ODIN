<?php

/**
 * interface for backend class
 * 
 * @package     Setup
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Matthias Greiling <m.greiling@metaways.de>
 * @copyright   Copyright (c); 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de);
 * @version     $Id: Interface.php,v 1.1 2009/12/08 23:15:27 hyokos Exp $
 *
 */

/**
 * interface for backend class
 * 
 * @package     Setup
 */
interface Setup_Backend_Interface
{
    
    /**
     * takes the xml stream and creates a table
     *
     * @param object $_table xml stream
     */
    public function createTable(Setup_Backend_Schema_Table_Abstract $_table);
        
    /*
    * removes table from database
    * 
    * @param string tableName
    */
    public function dropTable($_tableName);

    /*
    * renames table in database
    * 
    * @param string tableName
    */
    public function renameTable($_tableName, $_newName);

    /*
    * add column/field to database table
    * 
    * @param string tableName
    * @param Setup_Backend_Schema_Field_Abstract declaration
    * @param int position of future column
    */    
    public function addCol($_tableName, Setup_Backend_Schema_Field_Abstract $_declaration, $_position = NULL);
    
    /*
    * rename or redefines column/field in database table
    * 
    * @param string tableName
    * @param Setup_Backend_Schema_Field_Abstract declaration
    * @param string old column/field name 
    */    
    public function alterCol($_tableName, Setup_Backend_Schema_Field_Abstract $_declaration, $_oldName = NULL);

    /*
    * drop column/field in database table
    * 
    * @param string tableName
    * @param string column/field name 
    */    
    public function dropCol($_tableName, $_colName);

     /*
    * add a foreign key to database table
    * 
    * @param string tableName
    * @param Setup_Backend_Schema_Index_Abstract declaration
    */       
    public function addForeignKey($_tableName, Setup_Backend_Schema_Index_Abstract $_declaration);

    /*
    * removes a foreign key from database table
    * 
    * @param string tableName
    * @param string foreign key name
    */     
    public function dropForeignKey($_tableName, $_name);
    
    /*
    * removes a primary key from database table
    * 
    * @param string tableName (there is just one primary key...);
    */         
    public function dropPrimaryKey($_tableName);
    
    /*
    * add a primary key to database table
    * 
    * @param string tableName 
    * @param Setup_Backend_Schema_Index_Abstract declaration
    */         
    public function addPrimaryKey($_tableName, Setup_Backend_Schema_Index_Abstract $_declaration);
 
    /*
    * add a key to database table
    * 
    * @param string tableName 
    * @param Setup_Backend_Schema_Index_Abstract declaration
    */     
    public function addIndex($_tableName ,  Setup_Backend_Schema_Index_Abstract$_declaration);
    
    /*
    * removes a key from database table
    * 
    * @param string tableName 
    * @param string key name
    */    
    public function dropIndex($_tableName, $_indexName);
    
    
    public function applicationExists($_application);
    
    /**
     * checks if a given table exists
     *
     * @param string $_tableSchema
     * @param string $_tableName
     * @return boolean return true if the table exists, otherwise false
     */
    public function tableExists($_tableName);

    /**
     * /***checks a given database table version 
     *
     * @param string $_tableName
     * @return boolean return string "version" if the table exists, otherwise false
     */
    
    public function tableVersionQuery($_tableName);
    
    /**
     * checks a given application version
     *
     * @param string $_application
     * @return boolean return string "version" if the table exists, otherwise false
     */
    public function applicationVersionQuery($_application);

    public function getExistingSchema($_tableName);

    public function checkTable(Setup_Backend_Schema_Table_Abstract $_table);
 
    public function getFieldDeclarations(Setup_Backend_Schema_Field_Abstract $_field);

    public function getIndexDeclarations(Setup_Backend_Schema_Index_Abstract $_index);
}
