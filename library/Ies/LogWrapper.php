<?php

/**
 *
 * This class acts as a wrapper around the object passed in the
 * contructor.  It intercepts all the mthod calls make to the
 * underlying object and logs them.  Very useful for debugging!
 *
 */

class Ies_LogWrapper {
	public function __construct($class) {
		$this->obj = new $class;
	}

	public function __call($method, $args) {
		$retval = null;

		if (in_array($method, get_class_methods($this->obj) ) ) {
			$this->_logMethodEntry($method, $args);
			$retval = call_user_func_array(array($this->obj, $method), $args);
			$this->_logMethodExit($retval);
		} else {
			throw new BadMethodCallException();
		}

		return $retval;
	}

	public function _formatArgument($arg) {
		if (is_null($arg)) {
			return '(null)';
		}
		return substr(preg_replace("/[ \n]/", "", var_export($arg, true)), 0, 120) . '...';
	}

	private function _logMethodEntry($method, $args) {
		$msg = 'Calling ' . get_class($this->obj) . '->' . $method . '(';
		foreach($args as $arg) {
			$msg .= $this->_formatArgument($arg) . ', ';
		}
		$msg .= ')';
		Ies_Logger::debug($msg);
	}


	private function _logMethodExit($retval) {
		Ies_Logger::debug('  Returning ' . $this->_formatArgument($retval) . "\n");
	}

}

?>