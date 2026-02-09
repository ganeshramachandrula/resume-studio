-- ============================================================
-- Application Bundles Migration
-- Adds: saved_applications_count, check_application_limit(),
--        save_document_with_bundle_tracking(), delete_application()
-- ============================================================

-- ── 1. Add saved_applications_count to profiles ────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS saved_applications_count INT DEFAULT 0;


-- ── 2. check_application_limit() ───────────────────────────
-- Returns whether a Pro user can save documents for a JD.
-- Free users always get {allowed: true, reason: 'free_preview'} — they preview only.

CREATE OR REPLACE FUNCTION check_application_limit(
  user_uuid UUID,
  job_description_uuid UUID,
  max_applications INT DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan TEXT;
  v_saved_count INT;
  v_existing_docs INT;
BEGIN
  SELECT plan, saved_applications_count
  INTO v_plan, v_saved_count
  FROM profiles
  WHERE id = user_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'profile_not_found');
  END IF;

  -- Free users: always allowed to generate (preview only, not saved)
  IF v_plan NOT IN ('pro_monthly', 'pro_annual') THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'free_preview');
  END IF;

  -- Pro: check if this JD already has docs for this user
  SELECT COUNT(*) INTO v_existing_docs
  FROM documents
  WHERE user_id = user_uuid AND job_description_id = job_description_uuid;

  IF v_existing_docs > 0 THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'existing_application');
  END IF;

  -- Pro: check application limit
  IF v_saved_count >= max_applications THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'application_limit_reached',
      'current_count', v_saved_count,
      'max', max_applications
    );
  END IF;

  RETURN jsonb_build_object('allowed', true, 'reason', 'allowed');
END;
$$;


-- ── 3. save_document_with_bundle_tracking() ────────────────
-- Inserts a document and increments saved_applications_count
-- only if this is the first document for the given JD.

CREATE OR REPLACE FUNCTION save_document_with_bundle_tracking(
  p_user_id UUID,
  p_job_description_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_content JSONB,
  p_template TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_docs INT;
  v_doc_row documents%ROWTYPE;
BEGIN
  -- Check if this JD already has docs for this user
  SELECT COUNT(*) INTO v_existing_docs
  FROM documents
  WHERE user_id = p_user_id AND job_description_id = p_job_description_id;

  -- Insert the document
  INSERT INTO documents (user_id, job_description_id, type, title, content, template)
  VALUES (p_user_id, p_job_description_id, p_type, p_title, p_content, p_template)
  RETURNING * INTO v_doc_row;

  -- If this is the first doc for this JD, increment the application counter
  IF v_existing_docs = 0 THEN
    UPDATE profiles
    SET saved_applications_count = saved_applications_count + 1
    WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'id', v_doc_row.id,
    'user_id', v_doc_row.user_id,
    'job_description_id', v_doc_row.job_description_id,
    'type', v_doc_row.type,
    'title', v_doc_row.title,
    'content', v_doc_row.content,
    'template', v_doc_row.template,
    'created_at', v_doc_row.created_at
  );
END;
$$;


-- ── 4. delete_application() ────────────────────────────────
-- Deletes all documents for a JD, the JD row, and decrements the counter.

CREATE OR REPLACE FUNCTION delete_application(
  user_uuid UUID,
  jd_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  -- Delete all documents for this JD
  DELETE FROM documents
  WHERE user_id = user_uuid AND job_description_id = jd_id;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  -- Only decrement if we actually deleted something
  IF v_deleted_count > 0 THEN
    UPDATE profiles
    SET saved_applications_count = GREATEST(saved_applications_count - 1, 0)
    WHERE id = user_uuid;
  END IF;

  -- Delete the JD row
  DELETE FROM job_descriptions
  WHERE id = jd_id AND user_id = user_uuid;

  RETURN jsonb_build_object('deleted_count', v_deleted_count);
END;
$$;


-- ── 5. Backfill existing data ──────────────────────────────
UPDATE profiles SET saved_applications_count = (
  SELECT COUNT(DISTINCT job_description_id)
  FROM documents
  WHERE documents.user_id = profiles.id
);
