<?php
/**
 * Tine 2.0
 *
 * @package     Felamimail
 * @subpackage  Sieve
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @copyright   Copyright (c) 2010 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Script.php,v 1.1 2010/04/13 21:27:25 hyokos Exp $
 * 
 */

/**
 * class to parse and create Sieve scripts
 * 
 * This class does not really parse the Sieve script, but either parses SmartSieves pseudo code
 * or reads the serialized rules and vacation objects.
 *
 * @package     Felamimail
 * @subpackage  Sieve
 */
class Felamimail_Sieve_Script
{
    /**
     * array of Sieve rules(Felamimail_Sieve_Rule)
     * 
     * @var array
     */
    protected $_rules = array();
    
    /**
     * the vacation object
     * 
     * @var Felamimail_Sieve_Vacation
     */
    protected $_vacation;
    
    /**
     * constructor
     * 
     * @param   string  $script     the Sieve script or null
     */
    public function __construct($script = null)
    {
        if($script !== null) {
            $this->parseScript($script);
        }
    }
    
    /**
     * return array of Felamimail_Sieve_Rule
     * 
     * @return array
     */
    public function getRules()
    {
        return $this->_rules;
    }
    
    /**
     * return vacation object
     * 
     * @return Felamimail_Sieve_Vacation
     */
    public function getVacation()
    {
        return $this->_vacation;
    }
    
    /**
     * parse Sieve script (only pseudo scripts get loaded)
     * 
     * @param   string  $script     the Sieve script
     */
    public function parseScript($script)
    {
        $line = strtok($script, "\n");

        while ($line !== false) {
            if(preg_match("/^#rule&&(.*)&&(.*)&&(.*)&&(.*)&&(.*)&&(.*)&&(.*)&&(.*)&&(.*)&&(.*)&&(.*)$/i", $line, $matches)) {
                $this->_parseSmartSieveRule($matches);
            } elseif (preg_match("/^#vacation&&(.*)&&(.*)&&(.*)&&(.*)/i", $line, $matches)) {
                $this->_parseSmartSieveVacation($matches);
            } elseif (preg_match("/^#SieveRule(.*)/i", $line, $matches)) {
                $rule = unserialize($this->_unescapeChars($matches[1]));
                $this->addRule($rule);
            } elseif (preg_match("/^#SieveVacation(.*)/i", $line, $matches)) {
                $vacation = unserialize($this->_unescapeChars($matches[1]));
                $this->setVacation($vacation);
            }
            
            $line = strtok("\n");
        }
    }
    
    /**
     * parse rule generated by SmartSieve
     * 
     * @param   array   $parts
     */
    protected function _parseSmartSieveRule(array $parts)
    {
        $rule = new Felamimail_Sieve_Rule();
        
        $rule->setId($parts[1])
            ->setEnabled(($parts[2] == 'ENABLED') ? true : false);
        
        // conditions
        
        // from test
        if (!empty($parts[3])) {
            $condition = new Felamimail_Sieve_Rule_Condition();
            
            $condition->setTest(Felamimail_Sieve_Rule_Condition::TEST_ADDRESS)
                ->setComperator(Felamimail_Sieve_Rule_Condition::COMPERATOR_CONTAINS)
                ->setHeader('from')
                ->setKey($this->_unescapeChars($parts[3]));

            $rule->addCondition($condition);
        }
        // to test
        if (!empty($parts[4])) {
            $condition = new Felamimail_Sieve_Rule_Condition();
            
            $condition->setTest(Felamimail_Sieve_Rule_Condition::TEST_ADDRESS)
                ->setComperator(Felamimail_Sieve_Rule_Condition::COMPERATOR_CONTAINS)
                ->setHeader(array('to', 'cc'))
                ->setKey($this->_unescapeChars($parts[4]));

            $rule->addCondition($condition);
        }
        // subject test
        if (!empty($parts[5])) {
            $condition = new Felamimail_Sieve_Rule_Condition();
            
            $condition->setTest(Felamimail_Sieve_Rule_Condition::TEST_HEADER)
                ->setComperator(Felamimail_Sieve_Rule_Condition::COMPERATOR_CONTAINS)
                ->setHeader('subject')
                ->setKey($this->_unescapeChars($parts[5]));

            $rule->addCondition($condition);
        }
        // header test
        if (!empty($parts[9])) {
            $condition = new Felamimail_Sieve_Rule_Condition();
            
            $condition->setTest(Felamimail_Sieve_Rule_Condition::TEST_HEADER)
                ->setComperator(Felamimail_Sieve_Rule_Condition::COMPERATOR_CONTAINS)
                ->setHeader($this->_unescapeChars($parts[9]))
                ->setKey($this->_unescapeChars($parts[10]));

            $rule->addCondition($condition);
        }
        // size
        if (!empty($parts[11])) {
            $condition = new Felamimail_Sieve_Rule_Condition();
            
            $condition->setTest(Felamimail_Sieve_Rule_Condition::TEST_SIZE)
                ->setComperator(Felamimail_Sieve_Rule_Condition::COMPERATOR_OVER)
                ->setKey($this->_unescapeChars($parts[11]));

            $rule->addCondition($condition);
        }
        
        // actions
        $action = new Felamimail_Sieve_Rule_Action();
        
        switch ($this->_unescapeChars($parts[6])) {
            case ('folder'):
                $action->setType(Felamimail_Sieve_Rule_Action::FILEINTO)
                    ->setArgument($this->_unescapeChars($parts[7]));
                break;
            case ('address'):
                $action->setType(Felamimail_Sieve_Rule_Action::REDIRECT)
                    ->setArgument($this->_unescapeChars($parts[7]));
                break;
            case ('reject'):
                $action->setType(Felamimail_Sieve_Rule_Action::REJECT)
                    ->setArgument($this->_unescapeChars($parts[7]));
                break;
            case ('discard'):
                $action->setType(Felamimail_Sieve_Rule_Action::DISCARD);
                break;
        }
        $rule->addAction($action);
        
        //parts[8] == regex bit
        
        $this->addRule($rule);
    }
    
    public function addRule(Felamimail_Sieve_Rule $rule)
    {
        $this->_rules[$rule->getId()] = $rule;
    }
    
    public function getSieve()
    {
        $pseudoScript = null;
        
        $header  = "#Generated by Felamimail_Sieve_Script\r\n";
        $header .= 'require ["fileinto", "reject", "vacation"];';
        
        $rules = null;
        foreach($this->_rules as $rule) {
            if($rule->isEnabled() === true) {
                $rules .= sprintf("%s %s", ($rules === null) ? 'if' : 'elsif', $rule);
            }
            $pseudoScript .= '#SieveRule' . $this->_escapeChars(serialize($rule)) . "\r\n";
        }        
        
        $vacation = null;
        if($this->_vacation instanceof Felamimail_Sieve_Vacation && $this->_vacation->isEnabled() === true) {
            $vacation = $this->_vacation;
        }
        $pseudoScript .= '#SieveVacation' . $this->_escapeChars(serialize($this->_vacation)) . "\r\n";
        
        return $header . "\r\n\r\n" . $rules . $vacation . "\r\n\r\n" . $pseudoScript;
    }
    
    public function setVacation(Felamimail_Sieve_Vacation $vacation)
    {
        $this->_vacation = $vacation;
    }
    
    protected function _parseSmartSieveVacation($parts)
    {
        $vacation = new Felamimail_Sieve_Vacation();
        
        $vacation->setDays($parts[1])
            ->setReason($this->_unescapeChars($parts[3]))
            ->setEnabled(($parts[4] == 'on') ? true : false);
        
        $addresses = explode(',', $this->_unescapeChars($parts[2]));
        $addresses = array_map('trim', $addresses, array('"'));
        foreach($addresses as $address) {
            $vacation->addAddress($address);
        }
        
        $this->setVacation($vacation);        
    }
    
    /**
     * Unescape characters breaking Sieve comments
     *
     * @param   string  $string the string to unescape
     * @return  string          The unescaped string
     */
    protected function _unescapeChars($string)
    {
        $search = array('\n', '\&');
        $replace = array("\r\n", "&");
        $string = str_replace($search, $replace, $string);

        return $string;
    }
        
    /**
     * Escape characters breaking Sieve comments
     *
     * @param   string  $string the string to escape
     * @return  string          The unescaped string
     */
    protected function _escapeChars($string)
    {
        $search = array("\r\n");
        $replace = array('\n');
        $string = str_replace($search, $replace, $string);

        return $string;
    }    
}