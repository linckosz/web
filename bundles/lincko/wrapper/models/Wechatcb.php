<?php

namespace bundles\lincko\wrapper\models;

use Illuminate\Database\Eloquent\Model;

class Wechatcb extends Model {

	protected $connection = 'wrapper';

	protected $table = 'wechatcb';

	protected $primaryKey = 'open_id_event_key';

	public $timestamps = false;

	protected $visible = array();

	/////////////////////////////////////


}
