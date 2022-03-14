<?php

use Illuminate\Support\Facades\Route;

Route::get('groups/badge/{badge}', 'GroupBadgeController@show')->name('groups.badges');
