<?php

class ServiceFactoryPlugin extends Zend_Application_Resource_ResourceAbstract {

	public function init() {
		$options = $this->getOptions();
		Ies_ServiceFactory::getInstance()->addServiceOptions($options);
	}
}

?>