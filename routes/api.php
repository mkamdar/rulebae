<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FormController;
use App\Http\Controllers\FormFieldController;
use App\Http\Controllers\FormRuleController;
use App\Http\Controllers\FormSubmissionController;

Route::apiResource('forms', FormController::class);
Route::get('forms/{id}/public', [FormController::class, 'show'])->name('forms.public.show');

Route::prefix('forms/{formId}')->group(function () {
    Route::apiResource('fields', FormFieldController::class)->except(['index', 'show']);
    Route::post('fields/reorder', [FormFieldController::class, 'reorder'])->name('forms.fields.reorder');
    
    Route::apiResource('rules', FormRuleController::class)->except(['index', 'show']);
    
    Route::post('submissions', [FormSubmissionController::class, 'store'])->name('forms.submissions.store');
});
