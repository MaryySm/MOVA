import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';
import 'mova_api.dart';
import 'map_navigation.dart';

class DeviceLocationMap extends StatefulWidget {
  const DeviceLocationMap(
      {super.key,
      required this.token,
      required this.deviceId,
      required this.canWrite});
  final String token;
  final String? deviceId;
  final bool canWrite;
  @override
  State<DeviceLocationMap> createState() => _DeviceLocationMapState();
}

class _DeviceLocationMapState extends State<DeviceLocationMap> {
  final _map = MapController();
  Timer? _timer;
  LatLng? _point;
  DateTime? _observed;
  double? _accuracy;
  bool _busy = false, _ready = false, _reading = false;
  @override
  void initState() {
    super.initState();
    unawaited(_refresh());
    _timer = Timer.periodic(
        const Duration(seconds: 10), (_) => unawaited(_refresh()));
  }

  @override
  void dispose() {
    _timer?.cancel();
    _map.dispose();
    super.dispose();
  }

  // Move the marker above the existing footer without changing the card dimensions.
  LatLng _center(LatLng point) =>
      LatLng(point.latitude - 0.00045, point.longitude);
  void _show(LatLng point, DateTime observed, double accuracy) {
    if (!mounted) return;
    setState(() {
      _point = point;
      _observed = observed;
      _accuracy = accuracy;
    });
    if (_ready) _map.move(_center(point), 16);
  }

  Future<void> _refresh() async {
    if (widget.deviceId == null || _reading || _busy) return;
    _reading = true;
    try {
      final data = await MovaApi(widget.token).get(
          '/api/devices/${Uri.encodeComponent(widget.deviceId!)}/location');
      if (data != null && mounted && !_busy) {
        final at = DateTime.parse(data['observedAt']);
        if (_observed == null || at.isAfter(_observed!))
          _show(
              LatLng((data['latitude'] as num).toDouble(),
                  (data['longitude'] as num).toDouble()),
              at,
              (data['accuracy'] as num).toDouble());
      }
    } catch (_) {
      /* Keep the last known point during temporary disconnection. */
    } finally {
      _reading = false;
    }
  }

  void _message(String message) {
    if (mounted)
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _locate() async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      if (!await Geolocator.isLocationServiceEnabled())
        throw Exception(
            'Activa la ubicación del teléfono para probar el mapa.');
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied)
        permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever)
        throw Exception(
            'Permite la ubicación de MOVA en Ajustes del teléfono.');
      final position = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
              accuracy: LocationAccuracy.high,
              timeLimit: Duration(seconds: 20)));
      if (!mounted) return;
      _show(LatLng(position.latitude, position.longitude), position.timestamp,
          position.accuracy);
      if (widget.deviceId != null) {
        try {
          await MovaApi(widget.token).post(
              '/api/devices/${Uri.encodeComponent(widget.deviceId!)}/location',
              {
                'latitude': position.latitude,
                'longitude': position.longitude,
                'accuracy': position.accuracy,
                'observedAt': position.timestamp.toUtc().toIso8601String(),
                'source': 'phone_simulated',
              });
          _message(
              'Ubicación del teléfono guardada como simulación del reloj.');
        } catch (_) {
          _message(
              'Ubicación visible en este teléfono; no se pudo guardar en la API. Reintenta Ubicar.');
        }
      } else {
        _message(
            'Ubicación del teléfono mostrada. Vincula un reloj para compartirla mediante la API.');
      }
    } catch (error) {
      _message(error is TimeoutException
          ? 'No se pudo obtener la ubicación a tiempo. Reintenta.'
          : error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  _MapCapture? get _capture =>
      _point == null ? null : _MapCapture(_point!, _observed!, _accuracy!);
  Future<void> _expand() => showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        useSafeArea: true,
        backgroundColor: const Color(0xfffff0f5),
        constraints: const BoxConstraints(maxWidth: 390),
        shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
        builder: (_) => SizedBox(
            height: MediaQuery.sizeOf(context).height * .85,
            child: _ExpandedLocationMap(
              capture: _capture,
              locate: widget.canWrite
                  ? () async {
                      await _locate();
                      return _capture;
                    }
                  : null,
            )),
      );

  @override
  Widget build(BuildContext context) => Stack(fit: StackFit.expand, children: [
        Semantics(
            label: 'Ampliar mapa de ubicación',
            button: true,
            child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: _expand,
                child: IgnorePointer(
                    child: FlutterMap(
                        mapController: _map,
                        options: MapOptions(
                          initialCenter: _point == null
                              ? const LatLng(-33.4489, -70.6693)
                              : _center(_point!),
                          initialZoom: _point == null ? 11 : 16,
                          interactionOptions: const InteractionOptions(
                              flags: InteractiveFlag.none),
                          onMapReady: () {
                            _ready = true;
                            if (_point != null) _map.move(_center(_point!), 16);
                          },
                        ),
                        children: [
                      TileLayer(
                          urlTemplate:
                              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                          userAgentPackageName: 'cl.erickmorales.mova.capstone',
                          maxNativeZoom: 19),
                      if (_point != null)
                        MarkerLayer(markers: [
                          Marker(
                              point: _point!,
                              width: 32,
                              height: 32,
                              child: Tooltip(
                                message:
                                    'Teléfono · ubicación simulada del reloj\nPrecisión: ±${_accuracy?.round()} m\n${_observed?.toLocal()}',
                                child: const Icon(Icons.location_on,
                                    color: Color(0xff7098f5), size: 32),
                              ))
                        ]),
                    ])))),
        Positioned(
            top: 4,
            right: 6,
            child: TextButton.icon(
                onPressed: widget.canWrite && !_busy ? _locate : null,
                style: TextButton.styleFrom(
                    backgroundColor: Colors.white.withValues(alpha: .94),
                    foregroundColor: const Color(0xff7098f5),
                    minimumSize: const Size(0, 26),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                icon: Icon(_busy ? Icons.hourglass_empty : Icons.my_location,
                    size: 12),
                label: Text(_busy ? 'Ubicando…' : 'Ubicar',
                    style: const TextStyle(
                        fontSize: 10, fontWeight: FontWeight.w700)))),
        Positioned(
            bottom: 51,
            left: 7,
            child: Container(
                color: Colors.white.withValues(alpha: .9),
                padding: const EdgeInsets.symmetric(horizontal: 3),
                child: Text(
                    _point == null
                        ? 'Sin ubicación · pulsa Ubicar'
                        : 'Simulada · teléfono · ${_observed!.toLocal().hour.toString().padLeft(2, '0')}:${_observed!.toLocal().minute.toString().padLeft(2, '0')}',
                    style: const TextStyle(
                        fontSize: 8, color: Color(0xff68677e))))),
        Positioned(
            bottom: 51,
            right: 5,
            child: GestureDetector(
                onTap: () => launchUrl(
                    Uri.parse('https://www.openstreetmap.org/copyright')),
                child: Container(
                    color: Colors.white.withValues(alpha: .9),
                    padding: const EdgeInsets.symmetric(horizontal: 3),
                    child: const Text('© OpenStreetMap',
                        style: TextStyle(
                            fontSize: 8, color: Color(0xff68677e)))))),
      ]);
}

class _MapCapture {
  const _MapCapture(this.point, this.observed, this.accuracy);
  final LatLng point;
  final DateTime observed;
  final double accuracy;
}

class _ExpandedLocationMap extends StatefulWidget {
  const _ExpandedLocationMap({required this.capture, required this.locate});
  final _MapCapture? capture;
  final Future<_MapCapture?> Function()? locate;
  @override
  State<_ExpandedLocationMap> createState() => _ExpandedLocationMapState();
}

class _ExpandedLocationMapState extends State<_ExpandedLocationMap> {
  final _controller = MapController();
  late _MapCapture? _capture = widget.capture;
  bool _busy = false;
  String? _error;
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _locate() async {
    if (_busy || widget.locate == null) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    final before = _capture;
    try {
      final result = await widget.locate!();
      if (!mounted) return;
      setState(() {
        _capture = result;
        if (result == null || result.observed == before?.observed)
          _error =
              'No se obtuvo una posición nueva. Revisa el permiso de ubicación.';
      });
      if (result != null) _controller.move(result.point, 16);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _open(MapDestination destination) async {
    final point = _capture?.point;
    if (point == null) return;
    try {
      if (!kIsWeb) {
        final native = nativeMapNavigationUrl(
            destination, point.latitude, point.longitude);
        if (native != null) {
          try {
            if (await launchUrl(native, mode: LaunchMode.externalApplication))
              return;
          } catch (_) {/* Fall back to the universal link. */}
        }
      }
      final opened = await launchUrl(
          mapNavigationUrl(destination, point.latitude, point.longitude),
          mode: LaunchMode.externalApplication);
      if (!opened && mounted)
        setState(() => _error = 'No se pudo abrir la aplicación de mapas.');
    } catch (_) {
      if (mounted)
        setState(() => _error = 'No se pudo abrir la aplicación de mapas.');
    }
  }

  @override
  Widget build(BuildContext context) => SafeArea(
      top: false,
      child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Row(children: [
              const Expanded(
                  child: Text('Ubicación simulada',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: Color(0xff1a1a2e)))),
              TextButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.expand_more),
                  label: const Text('Minimizar'),
                  style: TextButton.styleFrom(
                      foregroundColor: const Color(0xff7098f5))),
            ]),
            Text(
                _capture == null
                    ? 'Sin posición: pulsa Ubicar. El mapa inicial no es una ubicación detectada.'
                    : 'Ubicación del teléfono · ±${_capture!.accuracy.round()} m · ${_capture!.observed.toLocal().toString().substring(0, 19)}',
                style: const TextStyle(fontSize: 11, color: Color(0xff68677e))),
            const SizedBox(height: 10),
            Expanded(
                child: ClipRRect(
                    borderRadius: BorderRadius.circular(18),
                    child: FlutterMap(
                        mapController: _controller,
                        options: MapOptions(
                            initialCenter: _capture?.point ??
                                const LatLng(-33.4489, -70.6693),
                            initialZoom: _capture == null ? 11 : 16),
                        children: [
                          TileLayer(
                              urlTemplate:
                                  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                              userAgentPackageName:
                                  'cl.erickmorales.mova.capstone',
                              maxNativeZoom: 19),
                          if (_capture != null)
                            MarkerLayer(markers: [
                              Marker(
                                  point: _capture!.point,
                                  width: 42,
                                  height: 42,
                                  child: const Icon(Icons.location_on,
                                      size: 42, color: Color(0xff7098f5)))
                            ]),
                          Align(
                              alignment: Alignment.bottomRight,
                              child: GestureDetector(
                                  onTap: () => launchUrl(Uri.parse(
                                      'https://www.openstreetmap.org/copyright')),
                                  child: Container(
                                      color:
                                          Colors.white.withValues(alpha: .94),
                                      padding: const EdgeInsets.all(4),
                                      child: const Text('© OpenStreetMap',
                                          style: TextStyle(
                                              fontSize: 10,
                                              color: Color(0xff68677e)))))),
                        ]))),
            const SizedBox(height: 8),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              TextButton.icon(
                  onPressed: _busy || widget.locate == null ? null : _locate,
                  icon: const Icon(Icons.my_location, size: 17),
                  label: Text(_busy ? 'Ubicando…' : 'Ubicar teléfono')),
              IconButton(
                  tooltip: 'Centrar ubicación',
                  onPressed: _capture == null
                      ? null
                      : () => _controller.move(_capture!.point, 16),
                  icon: const Icon(Icons.center_focus_strong,
                      color: Color(0xff7098f5))),
            ]),
            const Text('Abrir ubicación en',
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Color(0xff68677e))),
            Wrap(spacing: 6, children: [
              for (final item in const {
                MapDestination.google: 'Google Maps',
                MapDestination.apple: 'Apple Maps',
                MapDestination.waze: 'Waze'
              }.entries)
                OutlinedButton(
                    onPressed: _capture == null ? null : () => _open(item.key),
                    style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xff7098f5),
                        side: const BorderSide(color: Color(0xffd4e1ff)),
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        textStyle: const TextStyle(fontSize: 11)),
                    child: Text(item.value)),
            ]),
            if (_error != null)
              Text(_error!,
                  style:
                      const TextStyle(fontSize: 11, color: Color(0xffd95648))),
          ])));
}
