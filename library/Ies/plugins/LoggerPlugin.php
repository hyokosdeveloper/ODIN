<?php

class Ies_Plugin_LoggerPlugin extends Zend_Application_Resource_ResourceAbstract {

	public function init() {
		$options = $this->getOptions();

		$logfile  = $options['logfile'];
		$loglevel = $options['loglevel'];

		if (!empty($logfile)) {
			$writer = new Zend_Log_Writer_Stream($logfile);
			Ies_Logger::registerLogger('default', $writer, true);

			$loglevelnum = Zend_Log::DEBUG;
			if (!empty($loglevel)) {
				$loglevels = array(
					'DEBUG'	=> Zend_Log::DEBUG,
					'INFO' 	=> Zend_Log::INFO,
					'NOTICE'	=> Zend_Log::NOTICE,
					'WARN'	=> Zend_Log::WARN,
					'ERR'	=> Zend_Log::ERR,
					'CRIT'	=> Zend_Log::CRIT,
					'ALERT'	=> Zend_Log::ALERT,
					'EMERG'	=> Zend_log::EMERG
				);

				if (array_key_exists($loglevel, $loglevels)) {
					$loglevelnum = $loglevels["$loglevel"];
				}
			}

			$filter = new Zend_Log_Filter_Priority($loglevelnum);
			Ies_Logger::addFilter($filter, 'default');
		}
	}
}

?>