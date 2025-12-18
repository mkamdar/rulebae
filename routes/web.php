<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
});

Route::get('/admin/designer', function () {
    return view('app');
});

Route::get('/form', function () {
    return view('app');
});
