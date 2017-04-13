<?php

namespace bundles\lincko\wrapper\models;

use Illuminate\Database\Eloquent\Model;

class Wechatcb extends Model {

	protected $connection = 'wrapper';

	protected $table = 'wechatcb';

	protected $primaryKey = 'id';

	public $timestamps = false;

	protected $visible = array();

	/////////////////////////////////////


}
