-- Only the latest explicitly captured test position is retained, not a route history.
CREATE TABLE device_locations (
 device_id TEXT PRIMARY KEY REFERENCES devices(id), actor_user_id UUID NOT NULL REFERENCES users(id),
 latitude DOUBLE PRECISION NOT NULL CHECK(latitude BETWEEN -90 AND 90),
 longitude DOUBLE PRECISION NOT NULL CHECK(longitude BETWEEN -180 AND 180),
 accuracy DOUBLE PRECISION NOT NULL CHECK(accuracy>=0 AND accuracy<100000),
 source TEXT NOT NULL CHECK(source='phone_simulated'),
 observed_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE PROCEDURE sp_validar_ubicacion(IN p_data JSONB)
LANGUAGE plpgsql AS $$ BEGIN
 IF p_data->>'source' IS DISTINCT FROM 'phone_simulated' OR
 jsonb_typeof(p_data->'latitude') IS DISTINCT FROM 'number' OR
 jsonb_typeof(p_data->'longitude') IS DISTINCT FROM 'number' OR
 jsonb_typeof(p_data->'accuracy') IS DISTINCT FROM 'number' THEN CALL sp_error(400,'Ubicación inválida'); END IF;
 IF (p_data->>'latitude')::numeric NOT BETWEEN -90 AND 90 OR (p_data->>'longitude')::numeric NOT BETWEEN -180 AND 180 OR (p_data->>'accuracy')::numeric NOT BETWEEN 0 AND 99999 THEN CALL sp_error(400,'Coordenadas o precisión inválidas'); END IF;
 IF p_data->>'observedAt' IS NULL OR (p_data->>'observedAt')::timestamptz>now()+interval '5 minutes' OR (p_data->>'observedAt')::timestamptz<now()-interval '1 hour' THEN CALL sp_error(400,'La ubicación debe ser reciente'); END IF;
END $$;
CREATE PROCEDURE sp_guardar_ubicacion(IN p_user UUID,IN p_device TEXT,IN p_data JSONB,INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ BEGIN
 INSERT INTO device_locations(device_id,actor_user_id,latitude,longitude,accuracy,source,observed_at)
 VALUES(p_device,p_user,(p_data->>'latitude')::double precision,(p_data->>'longitude')::double precision,(p_data->>'accuracy')::double precision,'phone_simulated',(p_data->>'observedAt')::timestamptz)
 ON CONFLICT(device_id) DO UPDATE SET actor_user_id=excluded.actor_user_id,latitude=excluded.latitude,longitude=excluded.longitude,accuracy=excluded.accuracy,source=excluded.source,observed_at=excluded.observed_at,updated_at=now()
 WHERE excluded.observed_at>=device_locations.observed_at;
 SELECT to_jsonb(l.*) INTO p_result FROM device_locations l WHERE device_id=p_device;
END $$;
CREATE PROCEDURE sp_registrar_ubicacion(IN p_user UUID,IN p_device TEXT,IN p_data JSONB,INOUT p_result JSONB)
LANGUAGE plpgsql AS $$ DECLARE v_profile UUID; BEGIN
 CALL sp_validar_dispositivo(p_user,NULL,p_device,v_profile);
 CALL sp_validar_ubicacion(p_data);
 CALL sp_guardar_ubicacion(p_user,p_device,p_data,p_result);
 CALL sp_registrar_historial(p_user,NULL,'device.location.simulated',p_device);
END $$;
