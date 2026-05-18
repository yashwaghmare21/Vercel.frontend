"use client";

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MAX_GOALS, MIN_WEIGHTAGE_PER_GOAL, REQUIRED_TOTAL_WEIGHTAGE } from '@/shared/goal-validation';

const uomEnum = z.enum(['numeric', 'percentage', 'timeline', 'zero']);
const evalEnum = z.enum(['min', 'max']);

// Base Goal Schema for individual goals
const goalSchema = z.object({
  thrustArea: z.string().min(1, "Thrust Area is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  uom: uomEnum,
  evaluationType: evalEnum.optional(),
  target: z.coerce.number().or(z.string()).or(z.date()),
  weightage: z.coerce.number().min(MIN_WEIGHTAGE_PER_GOAL, `Min weightage is ${MIN_WEIGHTAGE_PER_GOAL}%`),
}).superRefine((data, ctx) => {
  if (data.uom === 'numeric' || data.uom === 'percentage') {
    if (!data.evaluationType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Evaluation type (Min/Max) is required for numeric/percentage UoM.",
        path: ['evaluationType']
      });
    }
  }
  if (data.uom === 'zero' && Number(data.target) !== 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Target must be 0 for zero-based UoM.",
      path: ['target']
    });
  }
});

// Entire Sheet Schema
const goalSheetSchema = z.object({
  goals: z.array(goalSchema).max(MAX_GOALS, `Maximum ${MAX_GOALS} goals allowed.`)
}).superRefine((data, ctx) => {
  const totalWeightage = data.goals.reduce((acc, curr) => acc + (Number(curr.weightage) || 0), 0);
  if (totalWeightage !== REQUIRED_TOTAL_WEIGHTAGE) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Total weightage must be exactly ${REQUIRED_TOTAL_WEIGHTAGE}%. Current total is ${totalWeightage}%.`,
      path: ['root']
    });
  }
});

type GoalSheetFormValues = z.infer<typeof goalSheetSchema>;

export default function GoalSheetForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<GoalSheetFormValues>({
    resolver: zodResolver(goalSheetSchema),
    defaultValues: {
      goals: [{ thrustArea: '', title: '', description: '', uom: 'numeric', evaluationType: 'min', target: 0, weightage: 10 }]
    },
    mode: "onChange"
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "goals"
  });

  const watchGoals = watch("goals");
  const currentTotalWeightage = watchGoals.reduce((sum, g) => sum + (Number(g.weightage) || 0), 0);
  const isOverweight = currentTotalWeightage > REQUIRED_TOTAL_WEIGHTAGE;
  
  const onSubmit = async (data: GoalSheetFormValues) => {
    setIsSubmitting(true);
    console.log("Submitting valid goal sheet:", data);
    // TODO: Connect to FastAPI backend
    setTimeout(() => setIsSubmitting(false), 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Draft Your Goals</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Total Weightage: 
          <span className={`font-mono ml-2 font-bold ${isOverweight ? 'text-red-500' : (currentTotalWeightage === 100 ? 'text-emerald-500' : 'text-amber-500')}`}>
            {currentTotalWeightage}% / 100%
          </span>
        </p>
        {errors.root && (
          <div className="p-4 mt-4 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
            {errors.root.message}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {fields.map((field, index) => {
          const currentUom = watchGoals[index]?.uom;
          return (
            <div key={field.id} className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-black relative group transition-all hover:shadow-md">
              <div className="absolute top-4 right-4">
                <button 
                  type="button" 
                  onClick={() => remove(index)}
                  className="text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <h4 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200">Goal {index + 1}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Thrust Area</label>
                  <select 
                    {...register(`goals.${index}.thrustArea` as const)}
                    className="w-full h-10 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value="">Select an area...</option>
                    <option value="Financial">Financial</option>
                    <option value="Customer">Customer</option>
                    <option value="Process">Internal Process</option>
                    <option value="Learning">Learning & Growth</option>
                  </select>
                  {errors.goals?.[index]?.thrustArea && (
                    <p className="text-sm text-red-500">{errors.goals[index]?.thrustArea?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
                  <input 
                    {...register(`goals.${index}.title` as const)}
                    className="w-full h-10 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="E.g., Increase Q2 Sales"
                  />
                  {errors.goals?.[index]?.title && (
                    <p className="text-sm text-red-500">{errors.goals[index]?.title?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Unit of Measurement</label>
                  <select 
                    {...register(`goals.${index}.uom` as const)}
                    className="w-full h-10 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value="numeric">Numeric</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="timeline">Timeline</option>
                    <option value="zero">Zero-Based</option>
                  </select>
                </div>

                {(currentUom === 'numeric' || currentUom === 'percentage') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Evaluation Type</label>
                    <select 
                      {...register(`goals.${index}.evaluationType` as const)}
                      className="w-full h-10 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                      <option value="min">Higher is Better (Min)</option>
                      <option value="max">Lower is Better (Max)</option>
                    </select>
                    {errors.goals?.[index]?.evaluationType && (
                      <p className="text-sm text-red-500">{errors.goals[index]?.evaluationType?.message}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Target Value</label>
                  <input 
                    type={currentUom === 'timeline' ? 'date' : 'text'}
                    {...register(`goals.${index}.target` as const)}
                    className="w-full h-10 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  {errors.goals?.[index]?.target && (
                    <p className="text-sm text-red-500">{errors.goals[index]?.target?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Weightage (%)</label>
                  <input 
                    type="number"
                    min={MIN_WEIGHTAGE_PER_GOAL}
                    max={100}
                    {...register(`goals.${index}.weightage` as const)}
                    className="w-full h-10 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  {errors.goals?.[index]?.weightage && (
                    <p className="text-sm text-red-500">{errors.goals[index]?.weightage?.message}</p>
                  )}
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description (Optional)</label>
                  <textarea 
                    {...register(`goals.${index}.description` as const)}
                    className="w-full p-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[80px]"
                    placeholder="Provide additional details..."
                  />
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button 
            type="button" 
            onClick={() => {
              if (fields.length < MAX_GOALS) {
                append({ thrustArea: '', title: '', description: '', uom: 'numeric', evaluationType: 'min', target: 0, weightage: MIN_WEIGHTAGE_PER_GOAL });
              }
            }}
            disabled={fields.length >= MAX_GOALS}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Another Goal
          </button>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Goals for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
}
