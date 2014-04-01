<?php

require_once 'Zend/Db/Profiler.php';

class Ies_DbProfiler extends Zend_Db_Profiler {

	public function __construct($label = null) {
	}

	public function queryEnd($queryId) {
		parent::queryEnd($queryId);

		if (!$this->getEnabled()) {
			return;
		}

		$profile = $this->getQueryProfile($queryId);
		Ies_Logger::debug('  Executing SQL: ' . $profile->getQuery() . join(',', $profile->getQueryParams()));
	}
}

?>