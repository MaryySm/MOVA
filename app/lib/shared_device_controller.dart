import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class SharedDeviceController extends ChangeNotifier {
  SharedDeviceController({required this.apiUrl, required this.deviceId, http.Client? client})
      : _client = client ?? http.Client();
  final String apiUrl;
  final String deviceId;
  final http.Client _client;
  Map<String, dynamic>? payload;
  String? updatedAt;
  String status = 'Conectando…';
  bool busy = false;
  bool _reading = false;
  bool _disposed = false;
  int _version = 0;
  Timer? _timer;

  Uri get _endpoint => Uri.parse('${apiUrl.replaceFirst(RegExp(r'/$'), '')}/api/devices/${Uri.encodeComponent(deviceId)}/state');

  void start() {
    unawaited(refresh());
    _timer ??= Timer.periodic(const Duration(seconds: 2), (_) => unawaited(refresh()));
  }
  void _notify() {
    if (!_disposed) notifyListeners();
  }
  void _accept(http.Response response) {
    if (response.statusCode != 200) throw Exception('API ${response.statusCode}');
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    payload = data['payload'] as Map<String, dynamic>;
    updatedAt = data['updatedAt'] as String?;
    status = 'Conectado';
  }
  Future<void> refresh() async {
    if (_disposed || _reading || busy) return;
    _reading = true;
    final version = _version;
    try {
      final response = await _client.get(_endpoint).timeout(const Duration(seconds: 8));
      if (!_disposed && version == _version) _accept(response);
    } catch (_) {
      if (!_disposed && version == _version) status = 'Sin conexión · reintentando';
    } finally {
      _reading = false;
      if (version == _version) _notify();
    }
  }
  Future<bool> update(Map<String, dynamic> patch) async {
    if (_disposed || busy) return false;
    busy = true;
    _version++;
    status = 'Guardando…';
    _notify();
    try {
      final response = await _client.patch(_endpoint,
        headers: {'Content-Type': 'application/json'}, body: jsonEncode(patch))
          .timeout(const Duration(seconds: 8));
      if (_disposed) return false;
      _accept(response);
      return true;
    } catch (_) {
      if (!_disposed) status = 'No se guardó · vuelve a intentarlo';
      return false;
    } finally {
      busy = false;
      _notify();
    }
  }
  @override
  void dispose() {
    _disposed = true;
    _timer?.cancel();
    _client.close();
    super.dispose();
  }
}
