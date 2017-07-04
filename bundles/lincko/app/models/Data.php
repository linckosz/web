<?php

namespace bundles\lincko\app\models;

use Illuminate\Database\Eloquent\Model;

class Data extends Model {

	protected $connection = 'app';

	protected $table = 'data';

	protected $primaryKey = 'sha';

	public $incrementing = false; //This helps to get primary key as a string instead of an integer

	public $timestamps = false;

	protected $visible = array('*');
	
}
