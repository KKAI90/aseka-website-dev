-- Fix: candidates_view dùng SECURITY DEFINER → đổi sang SECURITY INVOKER
-- SECURITY INVOKER đảm bảo RLS policies trên bảng candidates được áp dụng đúng

DROP VIEW IF EXISTS public.candidates_view;

CREATE VIEW public.candidates_view
WITH (security_invoker = true)
AS
SELECT id,
    name,
    name_kana,
    email,
    phone,
    gender,
    date_of_birth,
    nationality,
    address,
    visa_type,
    visa_expiry,
    jlpt,
    jlpt_actual,
    height_cm,
    weight_kg,
    skill,
    preferred_job,
    work_hours,
    availability,
    marital_status,
    dependents,
    education,
    work_history,
    certifications,
    motivation,
    self_pr,
    status,
    match_job_id,
    match_job_name,
    note,
    cv_filename,
    created_at,
    updated_at
FROM candidates;
