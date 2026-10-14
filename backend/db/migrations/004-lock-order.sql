-- Serialize competing writers before child procedures acquire state locks.
CREATE OR REPLACE PROCEDURE sp_validar_perfil(IN p_user UUID, IN p_profile UUID, IN p_write BOOLEAN, IN p_owner BOOLEAN)
LANGUAGE plpgsql AS $$ DECLARE v_role TEXT; BEGIN
 IF p_user IS NULL THEN CALL sp_error(403,'Esta acción requiere una cuenta de usuario'); END IF;
 SELECT m.role INTO v_role FROM profiles p JOIN profile_members m ON m.profile_id=p.id
 WHERE p.id=p_profile AND m.user_id=p_user AND p.archived_at IS NULL FOR UPDATE OF p;
 IF v_role IS NULL THEN CALL sp_error(404,'Perfil no disponible'); END IF;
 IF (p_write AND v_role='viewer') OR (p_owner AND v_role<>'owner') THEN CALL sp_error(403,'No tienes permiso para esta acción'); END IF;
END $$;
CREATE OR REPLACE PROCEDURE sp_validar_dispositivo(IN p_user UUID, IN p_actor_device TEXT, IN p_device TEXT, INOUT p_profile UUID)
LANGUAGE plpgsql AS $$ DECLARE v_before UUID; v_owner UUID; BEGIN
 SELECT profile_id INTO v_before FROM devices WHERE id=p_device AND archived_at IS NULL;
 IF NOT FOUND THEN CALL sp_error(404,'Dispositivo no disponible'); END IF;
 -- Consistent hierarchy: profile -> device -> state -> children, including profile archive.
 IF p_actor_device IS NULL THEN CALL sp_validar_perfil(p_user,v_before,true,false);
 ELSE
  IF p_actor_device<>p_device THEN CALL sp_error(403,'Dispositivo no autorizado'); END IF;
  PERFORM 1 FROM profiles WHERE id=v_before AND archived_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN CALL sp_error(404,'Perfil no disponible'); END IF;
 END IF;
 SELECT owner_id,profile_id INTO v_owner,p_profile FROM devices WHERE id=p_device AND archived_at IS NULL FOR UPDATE;
 IF NOT FOUND OR p_profile IS DISTINCT FROM v_before THEN CALL sp_error(404,'Dispositivo no disponible'); END IF;
END $$;
CREATE OR REPLACE PROCEDURE sp_validar_estado(IN p_patch JSONB,IN p_followup INT)
LANGUAGE plpgsql AS $$ DECLARE v_key TEXT; v_value JSONB; BEGIN
 IF p_followup<1 THEN CALL sp_error(400,'Plazo de seguimiento inválido'); END IF;
 IF p_patch IS NULL THEN RETURN; END IF;
 IF jsonb_typeof(p_patch)<>'object' THEN CALL sp_error(400,'Estado inválido'); END IF;
 FOR v_key,v_value IN SELECT * FROM jsonb_each(p_patch) LOOP
  CASE v_key
  WHEN 'mood' THEN IF jsonb_typeof(v_value) NOT IN('string','null') THEN CALL sp_error(400,'Emoción inválida'); END IF;
  WHEN 'sos' THEN IF jsonb_typeof(v_value)<>'boolean' THEN CALL sp_error(400,'SOS inválido'); END IF;
  WHEN 'activities' THEN
   IF jsonb_typeof(v_value)<>'object' THEN CALL sp_error(400,'Actividades inválidas'); END IF;
   IF EXISTS(SELECT 1 FROM jsonb_each(v_value) x WHERE jsonb_typeof(x.value)<>'boolean') THEN CALL sp_error(400,'Actividades inválidas'); END IF;
  WHEN 'note' THEN IF jsonb_typeof(v_value)<>'string' OR length(p_patch->>'note')>2000 THEN CALL sp_error(400,'Nota inválida'); END IF;
  WHEN 'tags' THEN IF jsonb_typeof(v_value)<>'array' OR jsonb_array_length(v_value)>12 THEN CALL sp_error(400,'Etiquetas inválidas'); END IF;
  WHEN 'heartRate' THEN IF jsonb_typeof(v_value)<>'number' OR (v_value::text)::numeric NOT BETWEEN 0 AND 300 THEN CALL sp_error(400,'Pulso inválido'); END IF;
  WHEN 'steps' THEN IF jsonb_typeof(v_value)<>'number' OR v_value::text !~ '^[0-9]+$' THEN CALL sp_error(400,'Pasos inválidos'); END IF;
  WHEN 'battery' THEN IF jsonb_typeof(v_value)<>'number' OR v_value::text !~ '^[0-9]+$' OR (v_value::text)::numeric NOT BETWEEN 0 AND 100 THEN CALL sp_error(400,'Batería inválida'); END IF;
  ELSE CALL sp_error(400,'Campo de estado inválido'); END CASE;
 END LOOP;
END $$;
CREATE OR REPLACE PROCEDURE sp_procesar_sincronizacion(IN p_user UUID,IN p_actor_device TEXT,IN p_device TEXT,IN p_payload JSONB,IN p_patch JSONB,IN p_followup INT,INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ DECLARE v_profile UUID; v_sync BIGINT; v_at TIMESTAMPTZ; v_task UUID; v_date DATE; v_key TEXT; v_value JSONB; v_emotion JSONB; BEGIN
 CALL sp_validar_estado(p_patch,p_followup);
 CALL sp_validar_dispositivo(p_user,p_actor_device,p_device,v_profile);
 INSERT INTO wearable_syncs(device_id,payload) VALUES(p_device,p_payload) RETURNING id,synced_at INTO v_sync,v_at;
 IF p_patch IS NOT NULL THEN
  INSERT INTO wearable_states(device_id,payload) VALUES(p_device,'{"mood":null,"activities":{},"sos":false}'::jsonb||p_patch)
  ON CONFLICT(device_id) DO UPDATE SET payload=wearable_states.payload||p_patch||jsonb_build_object('activities',coalesce(wearable_states.payload->'activities','{}')||coalesce(p_patch->'activities','{}')),updated_at=clock_timestamp();
  SELECT (now() AT TIME ZONE timezone)::date INTO v_date FROM profiles WHERE id=v_profile;
  IF p_patch ? 'activities' THEN
   FOR v_key,v_value IN SELECT * FROM jsonb_each(p_patch->'activities') LOOP
    SELECT id INTO v_task FROM tasks WHERE profile_id=v_profile AND (id::text=v_key OR legacy_key=v_key) AND archived_at IS NULL;
    IF v_task IS NULL THEN CALL sp_error(400,'La actividad no pertenece al perfil'); END IF;
    CALL sp_completar_tarea(p_user,p_actor_device,v_profile,v_task,v_date,v_value::boolean);
   END LOOP;
  END IF;
  IF coalesce(p_patch->>'mood','')<>'' THEN CALL sp_registrar_emocion(p_user,p_actor_device,p_device,v_profile,p_patch||jsonb_build_object('syncId',v_sync,'followupSeconds',p_followup),v_emotion); END IF;
  IF p_patch ?| ARRAY['heartRate','steps','battery'] THEN INSERT INTO telemetry_samples(device_id,heart_rate,steps,battery) VALUES(p_device,(p_patch->>'heartRate')::numeric,(p_patch->>'steps')::int,(p_patch->>'battery')::int); END IF;
  IF p_patch ? 'sos' THEN CALL sp_procesar_sos(p_user,p_actor_device,p_device,(p_patch->>'sos')::boolean); END IF;
 END IF;
 UPDATE devices SET last_seen_at=now() WHERE id=p_device;
 CALL sp_registrar_historial(p_user,p_actor_device,'device.sync',p_device);
 p_result:=jsonb_build_object('id',v_sync::text,'syncedAt',v_at);
END $$;
