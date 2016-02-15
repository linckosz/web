<?php

namespace libs;

class Folders {

	protected $folder = false;

	public function __construct($folder = false){
		return $this->setPath($folder);
	}

	public function getPath(){
		return $this->folder;
	}

	protected function checkPath($folder){
		if(!is_dir($folder)){
			//trigger_error('The folder does not exists '.$folder, E_USER_WARNING);
			return false;
		}
		return true;
	}

	public function setPath($folder){
		$this->folder = false;
		if($this->checkPath($folder)){
			$this->folder = $folder;
			return true;
		}
		return false;
	}

	protected function includeFiles($folder){
		if($this->checkPath($folder)){
			$files = glob($folder.'/*');
			if (is_array($files) && count($files) > 0) {
				foreach($files as $file) {
					if(is_dir($file)){
						$this->includeFiles($file);
					} else {
						if(preg_match("/.+\.php\b/ui",$file)){
							include_once($file);
						}
					}
				}
			}
		}
		return true;
	}	

	public function loopFolder(){
		$list = array();
		if($this->folder !== false){
			if($this->checkPath($this->folder)){
				$files = glob($this->folder.'/*');
				if (is_array($files) && count($files) > 0) {
					foreach($files as $file) {
						if(!is_dir($file)){
							$list[] = basename($file);
						}
					}
				}
			}
		}
		return $list;
	}	

	public function includeRecursive(){
		if($this->folder !== false){
			return $this->includeFiles($this->folder);
		}
		return false;
	}

	public function createPath($folder){
		$this->folder = false;
		if(!is_dir($folder)){
			if(mkdir($folder, 0755, true)){
				return $this->setPath($folder);
			}
		}
		return $this->setPath($folder);
	}

	public function createSymlink($target, $link){echo 'ok<br />';
		if($this->createPath($link)){
			if(rmdir($link)){
				if(symlink($target, $link)){
					return $this->setPath($link);
				}
			}
		}
		return false;
	}
}