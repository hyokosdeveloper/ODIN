<?php

/**
 * This is a simple service factory singleton that allows options to be set in bootstrap code.  
 * 
 * Currently the only option is 'logMethodCalls', which wraps the returned service object
 * with a LogWrapper class so that all its method calls can be logged for debugging.
 *
 */

class Ies_ServiceFactory {

	protected static $_instance;
	private $_services = array();


	protected function __construct() {
	}


	private function __clone() {
	}

	public static function getInstance() {
		if (null === self::$_instance) {
			self::$_instance = new self();
		}

		return self::$_instance;
	}


	public function getServices() {
		return array_keys($this->_services);
	}


	public function getServiceOptions($serviceClassName) {
		if (!isset($this->_services[$serviceClassName])) {
			return null;
		}

		return $this->_services[$serviceClassName];
	}


	public function addServiceOptions($options) {
		foreach ($options as $serviceClassName => $serviceOptions) {
			$serviceClassName = ucfirst($serviceClassName);
				
			$currentOptions = $this->getServiceOptions($serviceClassName);
			if (is_null($currentOptions)) {
				$currentOptions = array();
			}

			$this->_services[$serviceClassName] = array_merge($currentOptions, $serviceOptions);
		}
	}


	public function getServiceOption($serviceClassName, $optionName, $fallbackValue = null) {
		$optionValue = $fallbackValue;
		
		$defaultOptions = $this->getServiceOptions('Default');
		if (!is_null($defaultOptions) && isset($defaultOptions[$optionName])) {
			$optionValue = $defaultOptions[$optionName];
		}
		
		$serviceOptions = $this->getServiceOptions($serviceClassName);
		if (!is_null($serviceOptions) && isset($serviceOptions[$optionName])) {
			$optionValue = $serviceOptions[$optionName];
		}
		
		return $optionValue;
	}

	
	public function getService($serviceClassName) {
		$logMethodCalls = $this->getServiceOption($serviceClassName, 'logMethodCalls', false);

		if ($logMethodCalls == true) {
			$service = new Ies_LogWrapper($serviceClassName);
		} else {
			$service = new $serviceClassName;
		}

		return $service;
	}
}

?>