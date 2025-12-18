<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\FormDefinitionController as AdminFormDefinitionController;
use App\Http\Controllers\Api\FormDefinitionController;
use App\Http\Controllers\Api\FormSubmissionController;

Route::prefix('admin')->group(function () {
    Route::get('/forms/current', [AdminFormDefinitionController::class, 'showCurrent']);
    Route::put('/forms/current', [AdminFormDefinitionController::class, 'upsertCurrent']);
});

Route::get('/forms/current', [FormDefinitionController::class, 'showCurrent']);
Route::post('/forms/current/submissions', [FormSubmissionController::class, 'store']);

