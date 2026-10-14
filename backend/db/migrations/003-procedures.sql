-- Additive migration: existing identifiers, records and client contracts are preserved.
CREATE TABLE pairing_requests (
 id UUID PRIMARY KEY, code_hash TEXT NOT NULL UNIQUE, secret_hash TEXT NOT NULL UNIQUE,
 device_token_hash TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL,
 claimed_at TIMESTAMPTZ, claimed_by UUID REFERENCES users(id), device_id TEXT REFERENCES devices(id),
 delivered_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX pairing_requests_expiry_idx ON pairing_requests(expires_at);

CREATE PROCEDURE sp_error(IN p_status INT, IN p_message TEXT) LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE=p_message, DETAIL=p_status::text; END $$;
CREATE PROCEDURE sp_registrar_historial(IN p_user UUID, IN p_device TEXT, IN p_action TEXT, IN p_id TEXT)
LANGUAGE plpgsql AS $$ BEGIN
 INSERT INTO audit_logs(actor_user_id,actor_device_id,action,resource_id) VALUES(p_user,p_device,p_action,p_id);
END $$;
CREATE PROCEDURE sp_validar_perfil(IN p_user UUID, IN p_profile UUID, IN p_write BOOLEAN, IN p_owner BOOLEAN)
LANGUAGE plpgsql AS $$ DECLARE v_role TEXT; BEGIN
 IF p_user IS NULL THEN CALL sp_error(403,'Esta acción requiere una cuenta de usuario'); END IF;
 SELECT m.role INTO v_role FROM profiles p JOIN profile_members m ON m.profile_id=p.id
 WHERE p.id=p_profile AND m.user_id=p_user AND p.archived_at IS NULL FOR UPDATE OF p;
 IF v_role IS NULL THEN CALL sp_error(404,'Perfil no disponible'); END IF;
 IF (p_write AND v_role='viewer') OR (p_owner AND v_role<>'owner') THEN CALL sp_error(403,'No tienes permiso para esta acción'); END IF;
END $$;
CREATE PROCEDURE sp_validar_dispositivo(IN p_user UUID, IN p_actor_device TEXT, IN p_device TEXT, INOUT p_profile UUID)
LANGUAGE plpgsql AS $$ DECLARE v_owner UUID; BEGIN
 SELECT owner_id,profile_id INTO v_owner,p_profile FROM devices WHERE id=p_device AND archived_at IS NULL FOR UPDATE;
 IF NOT FOUND THEN CALL sp_error(404,'Dispositivo no disponible'); END IF;
 IF p_actor_device IS NOT NULL THEN
  IF p_actor_device<>p_device THEN CALL sp_error(403,'Dispositivo no autorizado'); END IF;
 ELSE CALL sp_validar_perfil(p_user,p_profile,true,false); END IF;
END $$;
CREATE PROCEDURE sp_insertar_perfil(IN p_user UUID, IN p_data JSONB, INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ DECLARE v_id UUID:=gen_random_uuid(); v_name TEXT:=trim(p_data->>'name'); BEGIN
 IF v_name IS NULL OR length(v_name) NOT BETWEEN 1 AND 120 OR (p_data->>'age')::INT NOT BETWEEN 0 AND 120 THEN CALL sp_error(400,'Perfil inválido'); END IF;
 INSERT INTO profiles(id,owner_id,name,age,diagnosis) VALUES(v_id,p_user,v_name,(p_data->>'age')::INT,coalesce(p_data->>'diagnosis','')) RETURNING to_jsonb(profiles.*) INTO p_result;
 INSERT INTO profile_members VALUES(v_id,p_user,'owner'); INSERT INTO profile_settings(profile_id) VALUES(v_id);
 INSERT INTO tasks(id,profile_id,title,icon,scheduled_time,legacy_key)
 SELECT gen_random_uuid(),v_id,title,icon,time::TIME,'a'||n FROM (VALUES
 (1,'Levantarme','⏰','06:30'),(2,'Bañarme','🚿','06:45'),(3,'Lavarme los dientes','🦷','07:00'),
 (4,'Desayunar','🍳','07:15'),(5,'Ir al colegio','🏫','08:00'),(6,'Fútbol','⚽','16:00'),(7,'Dormir','🌙','21:00')) AS t(n,title,icon,time);
END $$;
CREATE PROCEDURE sp_crear_perfil(IN p_user UUID, IN p_data JSONB, INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM users WHERE id=p_user) THEN CALL sp_error(401,'Usuario no disponible'); END IF;
 CALL sp_insertar_perfil(p_user,p_data,p_result);
 CALL sp_registrar_historial(p_user,NULL,'profile.create',p_result->>'id');
END $$;
CREATE PROCEDURE sp_registrar_usuario(IN p_data JSONB, INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ DECLARE v_id UUID:=gen_random_uuid(); v_user JSONB; v_profile JSONB; BEGIN
 IF coalesce(p_data->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR length(trim(coalesce(p_data->>'name','')))=0 OR length(coalesce(p_data->>'passwordHash',''))<100 THEN CALL sp_error(400,'Cuenta inválida'); END IF;
 INSERT INTO users(id,email,name,password_hash,phone) VALUES(v_id,lower(p_data->>'email'),trim(p_data->>'name'),p_data->>'passwordHash',coalesce(p_data->>'phone',''))
 RETURNING jsonb_build_object('id',id,'email',email,'name',name,'phone',phone) INTO v_user;
 INSERT INTO user_settings(user_id) VALUES(v_id);
 CALL sp_insertar_perfil(v_id,jsonb_build_object('name',coalesce(p_data->>'profileName',p_data->>'name'),'age',p_data->'age','diagnosis',p_data->'diagnosis'),v_profile);
 INSERT INTO auth_sessions(token_hash,user_id,expires_at) VALUES(p_data->>'tokenHash',v_id,now()+interval '7 days');
 CALL sp_registrar_historial(v_id,NULL,'account.register',v_id::text);
 p_result:=jsonb_build_object('user',v_user,'profile',v_profile);
END $$;
CREATE PROCEDURE sp_validar_emocion(IN p_mood TEXT, IN p_note TEXT, IN p_tags JSONB, INOUT p_type JSONB)
LANGUAGE plpgsql AS $$ DECLARE v_count INT; BEGIN
 SELECT to_jsonb(t.*) INTO p_type FROM emotion_types t WHERE label=p_mood OR code=p_mood;
 IF p_type IS NULL THEN CALL sp_error(400,'Emoción no válida'); END IF;
 IF length(p_note)>2000 OR jsonb_typeof(p_tags)<>'array' OR jsonb_array_length(p_tags)>12 OR EXISTS(SELECT 1 FROM jsonb_array_elements(p_tags) x WHERE jsonb_typeof(x)<>'string') THEN CALL sp_error(400,'Nota o etiquetas inválidas'); END IF;
 SELECT count(*) INTO v_count FROM emotion_tags WHERE id IN(SELECT jsonb_array_elements_text(p_tags)) OR label IN(SELECT jsonb_array_elements_text(p_tags));
 IF v_count<>(SELECT count(DISTINCT x) FROM jsonb_array_elements_text(p_tags) x) THEN CALL sp_error(400,'Etiqueta no válida'); END IF;
END $$;
CREATE PROCEDURE sp_insertar_emocion(IN p_user UUID,IN p_device TEXT,IN p_profile UUID,IN p_data JSONB,IN p_type JSONB,INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ DECLARE v_id BIGINT; BEGIN
 IF p_device IS NOT NULL THEN
  INSERT INTO wearable_states(device_id,payload) VALUES(p_device,'{"mood":null,"activities":{},"sos":false}') ON CONFLICT DO NOTHING;
  PERFORM 1 FROM wearable_states WHERE device_id=p_device FOR UPDATE;
  UPDATE emotion_entries SET superseded_at=clock_timestamp() WHERE device_id=p_device AND followup_due_at IS NOT NULL AND answered_at IS NULL AND superseded_at IS NULL;
 END IF;
 INSERT INTO emotion_entries(device_id,mood,mood_code,profile_id,recorded_by,note,followup_due_at,sync_id)
 VALUES(p_device,p_type->>'label',p_type->>'code',p_profile,p_user,coalesce(p_data->>'note',''),
 CASE WHEN p_device IS NULL THEN NULL ELSE clock_timestamp()+coalesce((p_data->>'followupSeconds')::numeric,30)*interval '1 second' END,(p_data->>'syncId')::BIGINT) RETURNING id INTO v_id;
 INSERT INTO emotion_entry_tags SELECT v_id,id FROM emotion_tags WHERE id IN(SELECT jsonb_array_elements_text(coalesce(p_data->'tags','[]'))) OR label IN(SELECT jsonb_array_elements_text(coalesce(p_data->'tags','[]')));
 UPDATE wearable_states SET payload=jsonb_set(payload,'{mood}',to_jsonb(p_type->>'label')) WHERE device_id=p_device;
 INSERT INTO notifications(id,profile_id,kind,title,body) VALUES(gen_random_uuid(),p_profile,'emotion','Nueva emoción registrada',p_type->>'label');
 p_result:=jsonb_build_object('id',v_id::text);
END $$;
CREATE PROCEDURE sp_registrar_emocion(IN p_user UUID,IN p_actor_device TEXT,IN p_device TEXT,IN p_profile UUID,IN p_data JSONB,INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ DECLARE v_type JSONB; v_profile UUID:=p_profile; v_mood TEXT:=p_data->>'mood'; BEGIN
 IF p_device IS NULL THEN CALL sp_validar_perfil(p_user,p_profile,true,false);
 ELSE CALL sp_validar_dispositivo(p_user,p_actor_device,p_device,v_profile); END IF;
 v_mood:=CASE v_mood WHEN 'Genial' THEN '¡Genial!' WHEN 'Regular' THEN 'Normal' WHEN 'Bajo' THEN 'Triste' ELSE v_mood END;
 CALL sp_validar_emocion(v_mood,coalesce(p_data->>'note',''),coalesce(p_data->'tags','[]'),v_type);
 CALL sp_insertar_emocion(p_user,p_device,v_profile,p_data,v_type,p_result);
 CALL sp_registrar_historial(p_user,p_actor_device,'emotion.register',p_result->>'id');
END $$;
CREATE PROCEDURE sp_completar_tarea(IN p_user UUID,IN p_actor_device TEXT,IN p_profile UUID,IN p_task UUID,IN p_date DATE,IN p_done BOOLEAN)
LANGUAGE plpgsql AS $$ DECLARE v_profile UUID; BEGIN
 IF p_actor_device IS NULL THEN CALL sp_validar_perfil(p_user,p_profile,true,false);
 ELSE CALL sp_validar_dispositivo(p_user,p_actor_device,p_actor_device,v_profile); IF v_profile<>p_profile THEN CALL sp_error(403,'Tarea no autorizada'); END IF; END IF;
 IF p_done IS NULL OR p_date IS NULL THEN CALL sp_error(400,'Estado de tarea inválido'); END IF;
 IF NOT EXISTS(SELECT 1 FROM tasks WHERE id=p_task AND profile_id=p_profile AND archived_at IS NULL) THEN CALL sp_error(404,'Tarea no disponible'); END IF;
 INSERT INTO task_completions(task_id,occurrence_date,done,actor_user_id,actor_device_id) VALUES(p_task,p_date,p_done,p_user,p_actor_device)
 ON CONFLICT(task_id,occurrence_date) DO UPDATE SET done=p_done,actor_user_id=p_user,actor_device_id=p_actor_device,updated_at=now();
 CALL sp_registrar_historial(p_user,p_actor_device,'task.complete',p_task::text);
END $$;
CREATE PROCEDURE sp_procesar_sos(IN p_user UUID,IN p_actor_device TEXT,IN p_device TEXT,IN p_active BOOLEAN)
LANGUAGE plpgsql AS $$ DECLARE v_profile UUID; v_id UUID; v_name TEXT; BEGIN
 CALL sp_validar_dispositivo(p_user,p_actor_device,p_device,v_profile);
 IF NOT p_active AND p_user IS NULL THEN CALL sp_error(403,'Esta acción requiere una cuenta de usuario'); END IF;
 IF p_active THEN
  INSERT INTO sos_events(id,device_id,profile_id) VALUES(gen_random_uuid(),p_device,v_profile) ON CONFLICT(device_id) WHERE acknowledged_at IS NULL DO NOTHING RETURNING id INTO v_id;
  SELECT name INTO v_name FROM devices WHERE id=p_device;
  IF v_id IS NOT NULL THEN INSERT INTO notifications(id,profile_id,kind,title,body) VALUES(gen_random_uuid(),v_profile,'sos','Solicitud de ayuda',v_name||' solicita ayuda'); END IF;
 ELSE UPDATE sos_events SET acknowledged_at=now(),acknowledged_by=p_user WHERE device_id=p_device AND acknowledged_at IS NULL; END IF;
 CALL sp_registrar_historial(p_user,p_actor_device,CASE WHEN p_active THEN 'sos.raise' ELSE 'sos.acknowledge' END,p_device);
END $$;
CREATE PROCEDURE sp_procesar_sincronizacion(IN p_user UUID,IN p_actor_device TEXT,IN p_device TEXT,IN p_payload JSONB,IN p_patch JSONB,IN p_followup INT,INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ DECLARE v_profile UUID; v_sync BIGINT; v_at TIMESTAMPTZ; v_task UUID; v_date DATE; v_key TEXT; v_value JSONB; v_emotion JSONB; BEGIN
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
CREATE PROCEDURE sp_procesar_seguimiento(IN p_user UUID,IN p_actor_device TEXT,IN p_device TEXT,IN p_entry BIGINT,IN p_action TEXT,IN p_still BOOLEAN)
LANGUAGE plpgsql AS $$ DECLARE v_profile UUID; v_entry emotion_entries%ROWTYPE; BEGIN
 CALL sp_validar_dispositivo(p_user,p_actor_device,p_device,v_profile);
 PERFORM 1 FROM wearable_states WHERE device_id=p_device FOR UPDATE;
 SELECT * INTO v_entry FROM emotion_entries WHERE id=p_entry AND device_id=p_device FOR UPDATE;
 IF NOT FOUND OR v_entry.superseded_at IS NOT NULL OR v_entry.followup_due_at IS NULL THEN CALL sp_error(409,'El seguimiento ya no está disponible'); END IF;
 IF v_entry.followup_due_at>clock_timestamp() THEN CALL sp_error(409,'Todavía no es hora del seguimiento'); END IF;
 IF p_action='prompt' THEN
  IF v_entry.answered_at IS NULL THEN UPDATE emotion_entries SET asked_at=coalesce(asked_at,clock_timestamp()) WHERE id=p_entry; END IF;
 ELSIF p_action='answer' THEN
  IF p_still IS NULL THEN CALL sp_error(400,'Respuesta inválida'); END IF;
  IF v_entry.asked_at IS NULL OR (v_entry.answered_at IS NOT NULL AND v_entry.still_feeling<>p_still) THEN CALL sp_error(409,'El seguimiento no admite esa respuesta'); END IF;
  UPDATE emotion_entries SET answered_at=coalesce(answered_at,clock_timestamp()),still_feeling=p_still WHERE id=p_entry;
 ELSE CALL sp_error(400,'Acción inválida'); END IF;
 CALL sp_registrar_historial(p_user,p_actor_device,'emotion.'||p_action,p_entry::text);
END $$;
-- Reverse pairing: only the authenticated owner claims; only the watch secret retrieves credentials.
CREATE PROCEDURE sp_iniciar_vinculacion(IN p_id UUID,IN p_code_hash TEXT,IN p_secret_hash TEXT,IN p_token_hash TEXT,INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ BEGIN
 DELETE FROM pairing_requests WHERE expires_at<now()-interval '1 day';
 INSERT INTO pairing_requests(id,code_hash,secret_hash,device_token_hash,expires_at) VALUES(p_id,p_code_hash,p_secret_hash,p_token_hash,now()+interval '10 minutes');
 p_result:=jsonb_build_object('id',p_id,'expiresAt',now()+interval '10 minutes');
END $$;
CREATE PROCEDURE sp_validar_vinculacion(IN p_user UUID,IN p_profile UUID,IN p_code_hash TEXT,INOUT p_request UUID)
LANGUAGE plpgsql AS $$ BEGIN
 CALL sp_validar_perfil(p_user,p_profile,true,true);
 SELECT id INTO p_request FROM pairing_requests WHERE code_hash=p_code_hash AND expires_at>now() AND claimed_at IS NULL FOR UPDATE;
 IF p_request IS NULL THEN CALL sp_error(400,'Código inválido, utilizado o vencido'); END IF;
END $$;
CREATE PROCEDURE sp_asociar_reloj(IN p_user UUID,IN p_profile UUID,IN p_request UUID,IN p_name TEXT,INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ DECLARE v_id TEXT:='MOVA-'||replace(p_request::text,'-',''); BEGIN
 INSERT INTO devices(id,owner_id,profile_id,name,credential_hash) SELECT v_id,p_user,p_profile,p_name,device_token_hash FROM pairing_requests WHERE id=p_request RETURNING jsonb_build_object('id',id,'name',name,'profile_id',profile_id) INTO p_result;
 UPDATE pairing_requests SET claimed_at=now(),claimed_by=p_user,device_id=v_id WHERE id=p_request;
END $$;
CREATE PROCEDURE sp_completar_vinculacion(IN p_user UUID,IN p_profile UUID,IN p_code_hash TEXT,IN p_name TEXT,INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ DECLARE v_request UUID; BEGIN
 IF length(trim(p_name)) NOT BETWEEN 1 AND 120 THEN CALL sp_error(400,'Nombre inválido'); END IF;
 CALL sp_validar_vinculacion(p_user,p_profile,p_code_hash,v_request);
 CALL sp_asociar_reloj(p_user,p_profile,v_request,p_name,p_result);
 CALL sp_registrar_historial(p_user,NULL,'device.pair',p_result->>'id');
END $$;
CREATE PROCEDURE sp_consultar_vinculacion(IN p_secret_hash TEXT,INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ DECLARE v pairing_requests%ROWTYPE; BEGIN
 SELECT * INTO v FROM pairing_requests WHERE secret_hash=p_secret_hash FOR UPDATE;
 IF NOT FOUND OR (v.expires_at<=now() AND v.claimed_at IS NULL) THEN CALL sp_error(410,'Código vencido. Genera uno nuevo.'); END IF;
 IF v.claimed_at IS NULL THEN p_result:=jsonb_build_object('status','pending');
 ELSE
  IF NOT EXISTS(SELECT 1 FROM devices WHERE id=v.device_id AND archived_at IS NULL AND credential_hash=v.device_token_hash) THEN CALL sp_error(410,'El reloj ya no está vinculado'); END IF;
  UPDATE pairing_requests SET delivered_at=coalesce(delivered_at,now()) WHERE id=v.id;
  p_result:=jsonb_build_object('status','paired','device',jsonb_build_object('id',v.device_id));
 END IF;
END $$;
CREATE PROCEDURE sp_guardar_tarea(IN p_user UUID,IN p_profile UUID,IN p_id UUID,IN p_data JSONB,INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ DECLARE v_title TEXT:=trim(p_data->>'title');v_days INT[]; BEGIN
 CALL sp_validar_perfil(p_user,p_profile,true,false);
 IF length(coalesce(v_title,'')) NOT BETWEEN 1 AND 120 OR coalesce(p_data->>'time','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$' THEN CALL sp_error(400,'Tarea inválida'); END IF;
 SELECT array_agg(DISTINCT x::int) INTO v_days FROM jsonb_array_elements_text(p_data->'weekdays') x;
 IF v_days IS NULL OR NOT v_days <@ ARRAY[1,2,3,4,5,6,7] THEN CALL sp_error(400,'Días inválidos'); END IF;
 IF EXISTS(SELECT 1 FROM tasks WHERE id=p_id AND (profile_id<>p_profile OR archived_at IS NOT NULL)) THEN CALL sp_error(403,'Tarea no autorizada'); END IF;
 INSERT INTO tasks(id,profile_id,title,icon,scheduled_time,weekdays) VALUES(p_id,p_profile,v_title,p_data->>'icon',(p_data->>'time')::time,v_days)
 ON CONFLICT(id) DO UPDATE SET title=excluded.title,icon=excluded.icon,scheduled_time=excluded.scheduled_time,weekdays=excluded.weekdays RETURNING to_jsonb(tasks.*) INTO p_result;
 CALL sp_registrar_historial(p_user,NULL,'task.save',p_id::text);
END $$;
CREATE PROCEDURE sp_guardar_evento(IN p_user UUID,IN p_profile UUID,IN p_id UUID,IN p_data JSONB,INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ BEGIN
 CALL sp_validar_perfil(p_user,p_profile,true,false);
 IF length(trim(coalesce(p_data->>'title',''))) NOT BETWEEN 1 AND 120 OR (p_data->>'endsAt')::timestamptz<=(p_data->>'startsAt')::timestamptz OR length(p_data->>'notes')>2000 THEN CALL sp_error(400,'Evento inválido'); END IF;
 IF EXISTS(SELECT 1 FROM calendar_events WHERE id=p_id AND (profile_id<>p_profile OR archived_at IS NOT NULL)) THEN CALL sp_error(403,'Evento no autorizado'); END IF;
 INSERT INTO calendar_events(id,profile_id,title,starts_at,ends_at,notes) VALUES(p_id,p_profile,trim(p_data->>'title'),(p_data->>'startsAt')::timestamptz,(p_data->>'endsAt')::timestamptz,p_data->>'notes')
 ON CONFLICT(id) DO UPDATE SET title=excluded.title,starts_at=excluded.starts_at,ends_at=excluded.ends_at,notes=excluded.notes RETURNING to_jsonb(calendar_events.*) INTO p_result;
 CALL sp_registrar_historial(p_user,NULL,'calendar.save',p_id::text);
END $$;
CREATE PROCEDURE sp_administrar_perfil(IN p_user UUID,IN p_profile UUID,IN p_action TEXT,IN p_data JSONB,INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ DECLARE v_target UUID; BEGIN
 CALL sp_validar_perfil(p_user,p_profile,true,p_action IN('archive','member.save','member.remove'));
 CASE p_action
 WHEN 'edit' THEN
  IF length(trim(coalesce(p_data->>'name',''))) NOT BETWEEN 1 AND 120 OR (p_data->>'age')::int NOT BETWEEN 0 AND 120 OR length(p_data->>'photo')>500000 THEN CALL sp_error(400,'Perfil inválido'); END IF;
  UPDATE profiles SET name=p_data->>'name',age=(p_data->>'age')::int,diagnosis=p_data->>'diagnosis',photo=p_data->>'photo' WHERE id=p_profile RETURNING to_jsonb(profiles.*) INTO p_result;
 WHEN 'archive' THEN UPDATE profiles SET archived_at=now() WHERE id=p_profile; UPDATE devices SET archived_at=now(),credential_hash=NULL WHERE profile_id=p_profile;
 WHEN 'member.save' THEN
  SELECT id INTO v_target FROM users WHERE email=lower(p_data->>'email');
  IF v_target IS NULL THEN CALL sp_error(404,'Esa persona debe registrar una cuenta primero'); END IF;
  IF v_target=p_user OR p_data->>'role' NOT IN('caregiver','viewer') THEN CALL sp_error(400,'Miembro o rol inválido'); END IF;
  INSERT INTO profile_members VALUES(p_profile,v_target,p_data->>'role') ON CONFLICT(profile_id,user_id) DO UPDATE SET role=excluded.role;
 WHEN 'member.remove' THEN
  v_target:=(p_data->>'userId')::uuid;
  IF EXISTS(SELECT 1 FROM profiles WHERE id=p_profile AND owner_id=v_target) THEN CALL sp_error(400,'No se puede quitar al propietario'); END IF;
  DELETE FROM profile_members WHERE profile_id=p_profile AND user_id=v_target;
 WHEN 'settings' THEN
  UPDATE profile_settings SET vibration=(p_data->>'vibration')::boolean,sound=(p_data->>'sound')::boolean,lights=(p_data->>'lights')::boolean,intensity=(p_data->>'intensity')::int WHERE profile_id=p_profile RETURNING to_jsonb(profile_settings.*) INTO p_result;
 ELSE CALL sp_error(400,'Operación inválida'); END CASE;
 CALL sp_registrar_historial(p_user,NULL,'profile.'||p_action,p_profile::text);
END $$;
CREATE PROCEDURE sp_archivar_recurso(IN p_user UUID,IN p_kind TEXT,IN p_id UUID)
LANGUAGE plpgsql AS $$ DECLARE v_profile UUID; BEGIN
 IF p_kind='task' THEN SELECT profile_id INTO v_profile FROM tasks WHERE id=p_id;
 ELSIF p_kind='calendar' THEN SELECT profile_id INTO v_profile FROM calendar_events WHERE id=p_id;
 ELSE CALL sp_error(400,'Recurso inválido'); END IF;
 IF v_profile IS NULL THEN CALL sp_error(404,'Recurso no disponible'); END IF;
 CALL sp_validar_perfil(p_user,v_profile,true,false);
 IF p_kind='task' THEN UPDATE tasks SET archived_at=now() WHERE id=p_id; ELSE UPDATE calendar_events SET archived_at=now() WHERE id=p_id; END IF;
 CALL sp_registrar_historial(p_user,NULL,p_kind||'.archive',p_id::text);
END $$;
CREATE PROCEDURE sp_administrar_cuenta(IN p_user UUID,IN p_action TEXT,IN p_data JSONB,INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM users WHERE id=p_user) THEN CALL sp_error(401,'Usuario no disponible'); END IF;
 CASE p_action
 WHEN 'session' THEN INSERT INTO auth_sessions(token_hash,user_id,expires_at) VALUES(p_data->>'tokenHash',p_user,now()+interval '7 days');
 WHEN 'logout' THEN UPDATE auth_sessions SET revoked_at=now() WHERE user_id=p_user AND token_hash=p_data->>'tokenHash';
 WHEN 'password' THEN
  UPDATE users SET password_hash=p_data->>'passwordHash' WHERE id=p_user;
  UPDATE auth_sessions SET revoked_at=now() WHERE user_id=p_user AND token_hash<>p_data->>'tokenHash';
 WHEN 'settings' THEN UPDATE user_settings SET language=p_data->>'language' WHERE user_id=p_user RETURNING to_jsonb(user_settings.*) INTO p_result;
 ELSE CALL sp_error(400,'Operación inválida'); END CASE;
 CALL sp_registrar_historial(p_user,NULL,'account.'||p_action,p_user::text);
END $$;
CREATE PROCEDURE sp_leer_aviso(IN p_user UUID,IN p_id UUID)
LANGUAGE plpgsql AS $$ DECLARE v_profile UUID;BEGIN
 SELECT profile_id INTO v_profile FROM notifications WHERE id=p_id;
 IF v_profile IS NULL THEN CALL sp_error(404,'Aviso no disponible'); END IF;
 CALL sp_validar_perfil(p_user,v_profile,false,false);
 INSERT INTO notification_reads(notification_id,user_id) VALUES(p_id,p_user) ON CONFLICT DO NOTHING;
END $$;
-- Legacy registration is kept for already deployed clients; new clients use reverse pairing.
CREATE PROCEDURE sp_registrar_dispositivo(IN p_user UUID,IN p_profile UUID,IN p_id TEXT,IN p_name TEXT,INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ DECLARE v devices%ROWTYPE;BEGIN
 CALL sp_validar_perfil(p_user,p_profile,true,true);
 IF p_id !~ '^[A-Za-z0-9_-]{1,80}$' THEN CALL sp_error(400,'Identificador inválido'); END IF;
 PERFORM pg_advisory_xact_lock(hashtext(p_id));
 SELECT * INTO v FROM devices WHERE id=p_id FOR UPDATE;
 IF v.owner_id IS NOT NULL THEN
  IF v.owner_id<>p_user OR v.archived_at IS NULL OR v.profile_id<>p_profile THEN CALL sp_error(409,'El dispositivo ya está registrado'); END IF;
  UPDATE devices SET archived_at=NULL,name=p_name WHERE id=p_id;
 ELSE
  INSERT INTO devices(id,owner_id,profile_id,name) VALUES(p_id,p_user,p_profile,p_name) ON CONFLICT(id) DO UPDATE SET owner_id=p_user,profile_id=p_profile,name=p_name;
  UPDATE emotion_entries SET profile_id=p_profile WHERE device_id=p_id AND profile_id IS NULL;
 END IF;
 p_result:=jsonb_build_object('id',p_id,'name',p_name,'profile_id',p_profile);
 CALL sp_registrar_historial(p_user,NULL,'device.register',p_id);
END $$;
CREATE PROCEDURE sp_archivar_dispositivo(IN p_user UUID,IN p_id TEXT)
LANGUAGE plpgsql AS $$ DECLARE v_profile UUID;BEGIN
 CALL sp_validar_dispositivo(p_user,NULL,p_id,v_profile);
 IF NOT EXISTS(SELECT 1 FROM devices WHERE id=p_id AND owner_id=p_user) THEN CALL sp_error(403,'Solo el propietario puede desvincular'); END IF;
 UPDATE devices SET archived_at=now(),credential_hash=NULL WHERE id=p_id;
 UPDATE device_pairings SET consumed_at=now() WHERE device_id=p_id;
 CALL sp_registrar_historial(p_user,NULL,'device.archive',p_id);
END $$;
CREATE PROCEDURE sp_generar_codigo_legacy(IN p_user UUID,IN p_id TEXT,IN p_hash TEXT)
LANGUAGE plpgsql AS $$ DECLARE v_profile UUID; BEGIN
 CALL sp_validar_dispositivo(p_user,NULL,p_id,v_profile);
 IF NOT EXISTS(SELECT 1 FROM devices WHERE id=p_id AND owner_id=p_user) THEN CALL sp_error(403,'Solo el propietario puede vincular'); END IF;
 UPDATE device_pairings SET consumed_at=now() WHERE device_id=p_id AND consumed_at IS NULL;
 INSERT INTO device_pairings(code_hash,device_id,expires_at) VALUES(p_hash,p_id,now()+interval '10 minutes');
END $$;
CREATE PROCEDURE sp_canjear_codigo_legacy(IN p_hash TEXT,IN p_token_hash TEXT,INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ DECLARE v_id TEXT; BEGIN
 SELECT device_id INTO v_id FROM device_pairings WHERE code_hash=p_hash AND consumed_at IS NULL AND expires_at>now() FOR UPDATE;
 IF v_id IS NULL THEN CALL sp_error(400,'Código inválido o vencido'); END IF;
 UPDATE devices SET credential_hash=p_token_hash WHERE id=v_id AND archived_at IS NULL RETURNING jsonb_build_object('id',id,'name',name,'profile_id',profile_id) INTO p_result;
 IF p_result IS NULL THEN CALL sp_error(400,'Dispositivo no disponible'); END IF;
 UPDATE device_pairings SET consumed_at=now() WHERE code_hash=p_hash;
END $$;
