<?php
/**
 * Zend Framework
 *
 * LICENSE
 *
 * This source file is subject to the new BSD license that is bundled
 * with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://framework.zend.com/license/new-bsd
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@zend.com so we can send you a copy immediately.
 *
 * @category   Zend
 * @package    Zend_InfoCard
 * @subpackage Zend_InfoCard_Xml_Security
 * @copyright  Copyright (c) 2005-2009 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 * @version    $Id: EnvelopedSignature.php,v 1.1 2010/04/13 21:53:11 hyokos Exp $
 */

/**
 * Zend_InfoCard_Xml_Security_Transform_Interface
 */
require_once 'Zend/InfoCard/Xml/Security/Transform/Interface.php';

/**
 * A object implementing the EnvelopedSignature XML Transform
 *
 * @category   Zend
 * @package    Zend_InfoCard
 * @subpackage Zend_InfoCard_Xml_Security
 * @copyright  Copyright (c) 2005-2009 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 */
class Zend_InfoCard_Xml_Security_Transform_EnvelopedSignature
    implements Zend_InfoCard_Xml_Security_Transform_Interface
{
    /**
     * Transforms the XML Document according to the EnvelopedSignature Transform
     *
     * @throws Zend_InfoCard_Xml_Security_Transform_Exception
     * @param string $strXMLData The input XML data
     * @return string the transformed XML data
     */
    public function transform($strXMLData)
    {
        $sxe = simplexml_load_string($strXMLData);

        if(!$sxe->Signature) {
            require_once 'Zend/InfoCard/Xml/Security/Transform/Exception.php';
            throw new Zend_InfoCard_Xml_Security_Transform_Exception("Unable to locate Signature Block for EnvelopedSignature Transform");
        }

        unset($sxe->Signature);

        return $sxe->asXML();
    }
}
